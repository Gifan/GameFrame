import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { ListenID } from "../../ListenID";
import { IItem } from "../../message/IItem";
import { SceneDefine } from "../../config/SceneCfg";
import { Cfg } from "../../config/Cfg";
import { Const } from "../../config/Const";

export class StageModel extends MVCS.AbsModel {
    public constructor() {
        super("_Stage");

        let data = Const.InitStage;
        this._curAlbumId = data.curAlbum;
        this._curStageIndex = data.curStage;
        this._stages = data.stages;
    }

    public reset() : void {
        
    }

    public serialize( ) : string { 
        let data = {
            curAlbum : this.curAlbumId,
            curStage : this._curStageIndex,
            stages : this._stages,
            favors : this._favors,
        }
        return JSON.stringify(data); 
    }

    private _curAlbumId = 1;
    public get curAlbumId() {
        return this._curAlbumId;
    }

    public updateCurAlbumId(id : number) {
        this._curAlbumId = id;
        Notifier.send(ListenID.Stage_AlbumChanged, id);

        //切完专辑后切换到第一首歌
        this.updateCurStageIndex(0);
    }

    private _curStageIndex = 0;
    public get curStageIndex() {
        return this._curStageIndex;
    }

    public updateCurStageIndex(index : number) {
        if (index == null) {
            cc.log("updateCurSkinId skip null");
            return;
        }
        this._curStageIndex = index;
        Notifier.send(ListenID.Stage_SelectChanged, index);
    }

    private _stages : IItem[] = [];

    public initStages(stages : IItem[]) {
        this._stages = stages;
        Notifier.send(ListenID.Stage_Inited);
    }

    public updateStage(item : IItem) {
        let find = false;
        for (let index = 0; index < this._stages.length; index++) {
            const exist = this._stages[index];
            if (exist.id == item.id) {
                //只向上更新星级
                if (exist.num < item.num) {
                    assign(exist, item);                    
                }
                find = true;
                break;
            }
        }
        if (!find) {
            this._stages.push(item);
        }
        Notifier.send(ListenID.Stage_Changed, item);
    }

    public getStage(id : number) {
        for (let index = 0; index < this._stages.length; index++) {
            const exist = this._stages[index];
            if (exist.id == id) {
                return exist;
            }
        }

        //cc.log("getStage null, id:", id);
        return null;
    }

    public filter(album : number) {
        let arr : IItem[] = [];
        for (let index = 0; index < this._stages.length; index++) {
            const exist = this._stages[index];
            const cfg = Cfg.Scene.get(exist.id);
            if (cfg == null) {
                cc.error("Cfg.Item error id:", exist.id);
                continue;
            }
            if (album == cfg.album) {
                arr.push(exist);
            }
        }
        return arr;
    }

    public getAlbumStar(album : number) : number {
        let num = 0;
        let sceneCfgs = Cfg.Scene.filter({album : album})
        for (let index = 0; index < sceneCfgs.length; index++) {
            const sceneCfg = sceneCfgs[index];
            let stage = this.getStage(sceneCfg.id);
            if (stage != null &&stage.num > 0) {
                num += stage.num - 1;
            }
        }
        
        return num;        
    }

    private _totalStar = 0;
    private onStageStatistics(stage : IItem) {
        if (stage != null &&stage.num > 0) {
            this._totalStar += stage.num - 1;
        }
    }

    public getTotalStar() : number {
        this._totalStar = 0;
        this._stages.forEach(this.onStageStatistics, this);
        return this._totalStar; 
    }

    public getLastId() : number {
        let id = 0;
        for (let index = this._stages.length - 1; index >= 0; index--) {
            const exist = this._stages[index];
            const cfg = Cfg.Scene.get(exist.id);
            //找到最后一个非购买关卡
            if (cfg == null || cfg.album >= 1000) {
                continue;
            }
            if (id < exist.id) {
                id = exist.id;                
            }
        }
        return id;
    }

    private _favors : number[] = [];
    public get favors() {
        return this._favors;
    }

    public initFavors(favors : number[]) {
        if (favors == null) {
            return;
        }
        this._favors = favors;
    }

    public addFavor(id : number) {
        let find = this._favors.contains(id);
        if (find) {
            return;
        }
        this._favors.push(id);
        Notifier.send(ListenID.Stage_FavorChanged, id, true);
    }

    public delFavor(id : number) {
        let find = this._favors.remove(id);
        if (!find) {
            return;
        }
        Notifier.send(ListenID.Stage_FavorChanged, id, false);
    }

    public isFavor(id : number) {
        return this._favors.contains(id);
    }

}