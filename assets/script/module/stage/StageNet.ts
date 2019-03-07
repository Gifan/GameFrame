import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { ListenID } from "../../ListenID";
import { NetUtil } from "../../NetUtil";
import { StageModel } from "./StageModel"
import { MsgID } from "../../MsgID";
import { IMsg } from "../../message/IMsg";
import { Const } from "../../config/Const";
import { IItem } from "../../message/IItem";
import { Cfg } from "../../config/Cfg";
import { SceneDefine } from "../../config/SceneCfg";
import { AlbumDefine } from "../../config/AlbumCfg";
import { WeChatSDK } from "../../../sdk/WeChatSDK";
import { FlowTipsArgs } from "../flowtips/FlowTipsArgs";

export class StageNet extends MVCS.AbsNet<StageModel> {

    public constructor() {
        super();
    }

    public reset() : void {
        
    }

    protected register() : void {
        Notifier.addListener(ListenID.Login_Finish, this.onLoginFinish, this);
        Notifier.addListener(ListenID.Stage_Update, this.updateStage, this);
        Notifier.addListener(ListenID.Stage_Start, this.reqStageStart, this);
        Notifier.addListener(ListenID.Stage_ChangeAlbum, this.reqChangeAlbum, this);
        Notifier.addListener(ListenID.Stage_ChangeStage, this.reqChangeStage, this);
        Notifier.addListener(ListenID.Stage_ChangeFavor, this.reqChangeFavor, this);        
    }

    private onLoginFinish() {
        this.reqGet();
    }

    private reqGet() {
        NetUtil.httpGet("userData", 
            {datatype : this._model.getType()},
            this.onGet,
            this
        );
    }

    private onGet(msg : IMsg) {
        let data = JSON.parse(msg.data);
        if (data == null) {
            //新号，需要初始化
            data = Const.InitStage;
        }
        cc.log(this._model.getType(), "onGet", msg.data, data)
        this._model.updateCurAlbumId(data.curAlbum);
        this._model.updateCurStageIndex(data.curStage);
        this._model.initStages(data.stages);
        this._model.initFavors(data.favors);
    }

    public reqSave() {
        NetUtil.httpPost("userData", 
            {datatype : this._model.getType(), content : this._model.serialize()},
            this.onSave,
            this
        );
    }

    private onSave(msg : any) {

    }

    private tryUnlockNextStage(item : IItem) {
        let sceneCfg = Cfg.Scene.get(item.id);
        let sceneCfgs = Cfg.Scene.filter({album : sceneCfg.album});
        let nextIndex = 0;
        for (let index = 0; index < sceneCfgs.length; index++) {
            const element = sceneCfgs[index];
            if (element.id == item.id) {
                nextIndex = index + 1;
                break;
            }
        }
        let nextCfg = sceneCfgs[nextIndex];
        if (nextCfg == null) {
            cc.log("tryUnlockNextStage next stage null", sceneCfg.album, nextIndex);
            return;
        }
        let nextStage = this._model.getStage(nextCfg.id);
        if (nextStage != null) {
            //已解锁
            //cc.log("tryUnlockNextStage already unlock", nextCfg.id);
            return;
        }        
        
        let unlock = nextCfg.unlock;
        if (unlock != null) {
            if (unlock["star"] != null && unlock["star"] > item.num) {
                cc.log("tryUnlockNextStage star lock", unlock["star"], item.num);
                return;
            }
        }        

        nextStage = {id : nextCfg.id, num : 0};
        this._model.updateStage(nextStage);
    }

    private tryUnlockNextAlbum(item : IItem) {
        let sceneCfg = Cfg.Scene.get(item.id);
        let sceneCfgs = Cfg.Scene.filter({album : sceneCfg.album + 1});
        if (sceneCfgs.length <= 0) {
            cc.log("tryUnlockNextAlbum next album null", sceneCfg.album);
            return;
        }
        let nextCfg = sceneCfgs[0];
        let nextStage = this._model.getStage(nextCfg.id);
        if (nextStage != null) {
            //已解锁
            //cc.log("tryUnlockNextAlbum already unlock", nextCfg.id);
            return;
        }        
        
        let albumCfg = Cfg.Album.get(nextCfg.album);
        let totalStar = this._model.getTotalStar();
        if (totalStar < albumCfg.unlockStar) {
            cc.log("tryUnlockNextAlbum totalStar lock", totalStar, albumCfg.unlockStar, "next", nextCfg.id);
            return;
        }

        nextStage = {id : nextCfg.id, num : 0};
        this._model.updateStage(nextStage);
    }

    public updateStage(item : IItem) {
        this._model.updateStage(item);
        this.tryUnlockNextStage(item);
        this.tryUnlockNextAlbum(item);

        //更新星级排行榜
        let totalStar = this._model.getTotalStar();
        WeChatSDK.postMessage({ cmd : "updateRecord", id : 0, datas : [totalStar] });
        
        this.reqSave();
    }

    public reqStageStart(id : number){
        //console.log("关卡挑战请求", id)
        let sceneCfg = Cfg.Scene.get(id);

        if (sceneCfg.cost != null) {
            let cost : IItem = { id : sceneCfg.cost.id, change : -sceneCfg.cost.num };
            Notifier.send(ListenID.Item_Update, cost);
            
            let args = new FlowTipsArgs();
            args.SetId(sceneCfg.cost.id);
            args.SetInfo(-sceneCfg.cost.num + "");
            Notifier.send(ListenID.Flow_Icon, args);
        }
    }

    public reqChangeAlbum(album : number){
        //console.log("关卡挑战请求", stageId)
        this._model.updateCurAlbumId(album);

        this.reqSave();
    }

    public reqChangeStage(id : number){
        //console.log("关卡挑战请求", stageId)        
        if (this._model.curAlbumId != AlbumDefine.Favor) {
            let sceneCfg = Cfg.Scene.get(id);
            if (sceneCfg.album != this._model.curAlbumId) {
                this._model.updateCurAlbumId(sceneCfg.album);
            } else {
                let slot = 0;
                let sceneCfgs = Cfg.Scene.filter({album : sceneCfg.album});
                for (let index = 0; index < sceneCfgs.length; index++) {
                    const element = sceneCfgs[index];
                    if (element.id == id) {
                        slot = index;
                        break;
                    }
                }
                this._model.updateCurStageIndex(slot);                
            }
        } else {
            let slot = this._model.favors.indexOf(id);
            if (slot != -1) {
                this._model.updateCurStageIndex(slot);                
            } else {
                //更新的不在收藏列表中
                let sceneCfg = Cfg.Scene.get(id);
                this._model.updateCurAlbumId(sceneCfg.album);
                slot = 0;
                let sceneCfgs = Cfg.Scene.filter({album : sceneCfg.album});
                for (let index = 0; index < sceneCfgs.length; index++) {
                    const element = sceneCfgs[index];
                    if (element.id == id) {
                        slot = index;
                        break;
                    }
                }
                this._model.updateCurStageIndex(slot);
            }
        }

        this.reqSave();
    }

    public reqChangeFavor(id : number, isFavor : boolean){
        //console.log("关卡挑战请求", stageId)
        if (isFavor) {
            this._model.addFavor(id);            
        } else {
            this._model.delFavor(id);    
        }

        this.reqSave();
    }
}