import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { DefaultTransition } from "../../../frame/mvcs/transition/DefaultTransition";
import { Time } from "../../../frame/Time";
import { ListenID } from "../../ListenID";
import { CallID } from "../../CallID";
import { Cfg } from "../../config/Cfg";
import { StageUI } from "./uiGen/StageUI";
import { SoundDefine } from "../../config/SoundCfg";
import { ItemView } from "../item/ItemView";
import { ItemDefine } from "../../config/ItemCfg";
import { Const } from "../../config/Const";
import { CellPool } from "../../../frame/extension/CellPool";
import { Album } from "./uiGen/Album";
import { ButtonCell } from "../../../frame/extension/ButtonCell";
import { UIManager } from "../../../frame/UIManager";
import { AlbumDefine } from "../../config/AlbumCfg";
import { Stage } from "./uiGen/Stage";
import { SceneCfg } from "../../config/SceneCfg";
import { ToggleCell } from "../../../frame/extension/ToggleCell";
import { SceneSwitchMsg } from "../../message/SceneSwitchMsg";
import { ScrollViewCell } from "../../../frame/extension/ScrollViewCell";
import { Cell } from "../../../frame/extension/Cell";
import { FlowTipsArgs } from "../flowtips/FlowTipsArgs";
import { WeChatSDK } from "../../../sdk/WeChatSDK";
import { AbsCell } from "../../../frame/extension/AbsCell";
import { ScrollRecord } from "../../../frame/extension/AbsScrollLayout";
import { IItem } from "../../message/IItem";

export class StageView extends MVCS.AbsView {
    public constructor() {
        super("ui/StageUI@Stage", MVCS.eUILayer.Main, MVCS.eUIQueue.Main, new DefaultTransition())
        
    }

    private _ui : StageUI;
    private _center : cc.Vec2;
    private _albumOut : cc.Action;
    private _albumIn : cc.Action;
    private _albumOutX = 0;
    private _stageOut : cc.Action;
    private _stageIn : cc.Action;
    private _stageOutX = 0;
    private _shake : cc.Action;
    private _albumId = 0;
    private _showStage = false;
    private _activeTextColor : cc.Color;

    protected onLoad() : void {
        let ui = new StageUI(this.node);
        this._ui = ui;

        ui.node.on(cc.Node.EventType.TOUCH_START, this.onClickFrame, this);
        
        ui.btn_back.SetListener(this.onClickBack, this);
        ui.btn_back.clickAudioId = SoundDefine.BtnBack;

        let energyView = new ItemView(ui.btn_energy, ItemDefine.Energy, SoundDefine.BtnStart, "/" + Const.DailyEnergy);
        this.addChildren(energyView);

        this._activeTextColor = ui.Album.root.maskText.node.color;
        ui.scroll_album.InitLoop(Album, this.onCreateAlbum, this.onPopAlbum, this.onPushAlbum, this);
        ui.scroll_stage.InitLoop(Stage, this.onCreateStage, this.onPopStage, this.onPushStage, this);

        let size = MVCS.designResolution();
        this._center = MVCS.designCenter().clone();

        let dura = 0.4;
        let albumNode = ui.scroll_album.node;
        let albumOutCallback = cc.callFunc(this.onAlbumOutFinish, this);
        this._albumOutX = albumNode.x - size.width * 1.5;
        this._albumOut = cc.sequence(
                cc.moveTo(dura, this._albumOutX, albumNode.y),                    
                albumOutCallback
            );
        this._albumIn = cc.moveTo(dura, albumNode.x, albumNode.y);
                 
        let stageNode = ui.scroll_stage.node;
        let stageOutCallback = cc.callFunc(this.onStageOutFinish, this);
        this._stageOutX = stageNode.x + size.width * 1.5;    
        this._stageOut = cc.sequence(
                cc.moveTo(dura, this._stageOutX, stageNode.y),                
                stageOutCallback
            );
        this._stageIn = cc.moveTo(dura, stageNode.x, stageNode.y);
        stageNode.x = this._stageOutX;

        let deltaTime = 0.05;
        let offset = 5;
        this._shake = cc.sequence(
            cc.moveBy(deltaTime, cc.v2(offset * 2, 0)),
            cc.moveBy(deltaTime * 2, cc.v2(-offset * 4)),
            cc.moveBy(deltaTime, cc.v2(offset * 2)),

            cc.moveBy(deltaTime, cc.v2(0, offset * 2)),
            cc.moveBy(deltaTime * 2, cc.v2(0, -offset * 4)),
            cc.moveBy(deltaTime, cc.v2(0, offset * 2)),

            cc.moveBy(deltaTime, cc.v2(offset, 0)),
            cc.moveBy(deltaTime * 2, cc.v2(-offset * 2, 0)),
            cc.moveBy(deltaTime, cc.v2(offset, 0)),

            cc.moveBy(deltaTime, cc.v2(0, offset)),
            cc.moveBy(deltaTime * 2, cc.v2(0, -offset * 2)),
            cc.moveBy(deltaTime, cc.v2(0, offset)),
        );
    }

    protected onUnload() : void {
        
    }

    protected changeListener(enable : boolean) : void {
        //Notifier.changeListener(enable, NotifyID.Game_Update, this.onUpdate, this);
    }
    
    /*
     * 打开界面回调，每次打开只调用一次
     */
    protected onOpen() : void {
       super.onOpen();

    //    this.initStar();
    this.initOpen();
    }

    private onClickBack() {
        if (!this._showStage) {
            this.close();
            return;
        }

        let ui = this._ui;
        let albumNode = ui.scroll_album.node;
        albumNode.active = true;
        albumNode.stopAllActions();
        albumNode.runAction(this._albumIn);

        let stageNode = ui.scroll_stage.node;
        stageNode.stopAllActions();
        stageNode.runAction(this._stageOut);
        this._showStage = false;
    }

    private initStar() {
        //cc.log("initStar")
        let totalStar : number = Notifier.call(CallID.Stage_GetTotalStar);
        //除去Login,Mian,Guide三个场景，每个关卡3星
        let stageNum  = (Cfg.Scene.count - 3);

        this._ui.cell_star.mainText.string = totalStar + "/" + stageNum;
    }

    private initOpen() {        
        let ui = this._ui;

        let albumNode = ui.scroll_album.node;
        albumNode.x = this._center.x;
        albumNode.active = true;
        albumNode.stopAllActions();

        let stageNode = ui.scroll_stage.node;
        stageNode.x = this._stageOutX;
        stageNode.stopAllActions();

        this._showStage = false;

        let albumId = Notifier.call(CallID.Stage_GetAlbumId);
        this._albumId = albumId;

        this.initScrollAlbum();        

        if (this._openArgs != null) {
            if (this._openArgs.tab == 1) {
                albumNode.x = this._albumOutX;
                stageNode.x = this._center.x;
                this._showStage = true;
                
                this.initScrollStage();
            }
        }
    }

    private initScrollAlbum() {
        let scroll = this._ui.scroll_album;
        scroll.Clear();

        let albumCfgs = Cfg.Album.getAll();
        for (const key in albumCfgs) {
            const albumCfg = albumCfgs[key];
            let sceneCfgs = Cfg.Scene.filter({album : albumCfg.id});
            if (sceneCfgs.length == 0) {
                //数据错误
                continue;
            }

            let record = new ScrollRecord(albumCfg.id);
            scroll.AddRecord(record);            
        }
        scroll.Build();
        //跳到当前专辑位置
        let record = scroll.FindRecord(this._albumId);
        scroll.ShowRecord(record);
    }

    private onCreateAlbum(record : ScrollRecord) {
        let item = record.cell as Album;
        let btn = item.root;
        btn.SetListenerWithSelf(this.onClickAlbum, this);
    }

    private onPopAlbum(record : ScrollRecord) {
        let item = record.cell as Album;
        let btn = item.root;
        let albumCfg = Cfg.Album.get(record.id);
        item.id = albumCfg.id;
        btn.id = albumCfg.id;
        btn.icon.setSprite(albumCfg.icon);
        btn.mainText.string = albumCfg.desc || "";

        let sceneCfgs = Cfg.Scene.filter({album : albumCfg.id});
        let stage = Notifier.call(CallID.Stage_GetStage, sceneCfgs[0].id);
        //通过第一个关卡判断是否已经解锁
        if (stage != null) {
            let num : number = Notifier.call(CallID.Stage_GetAlbumStar, item.id);
            let max = sceneCfgs.length;

            btn.mask.node.color = cc.Color.WHITE;
            btn.maskText.string = num + "/" + max;
            btn.maskText.node.color = this._activeTextColor;
            btn.image.node.color = cc.Color.WHITE;
            btn.icon.node.color = cc.Color.WHITE;
            let selected = item.id == this._albumId;
            btn.checked.active = selected;
            btn.badge.active = false;
            item.root.index = 1;             
        } else {
            btn.mask.node.color = cc.Color.GRAY;
            btn.maskText.node.color = cc.Color.GRAY;
            btn.image.node.color = cc.Color.GRAY;
            btn.icon.node.color = cc.Color.GRAY;
            btn.checked.active = false;
            btn.badge.active = true;
            item.root.index = 0;

            if (albumCfg.unlockStar) {
                btn.maskText.string = albumCfg.unlockStar + "解锁";                
            } else {
                btn.maskText.string = "视频解锁";   
            }
        }
    }

    private onPushAlbum(record : ScrollRecord) {
        //let item = record.cell as Album;
        
    }

    private onClickAlbum(btn : ButtonCell) {
        //cc.log("onClickAlbum", btn.id, btn.index);
        if (btn.index < 1) {
            //需要解锁
            btn.node.runAction(this._shake);

            let args = new FlowTipsArgs();
            const albumCfg = Cfg.Album.get(btn.id);
            if (albumCfg.unlockStar) {
                args.SetInfo(`总玫瑰数${albumCfg.unlockStar}解锁`);                
            } else {
                args.SetInfo("观看视频解锁");
            }
            Notifier.send(ListenID.Flow_Txt, args);
            return;
        }

        let ui = this._ui;
        //停止上一个选择
        if (this._albumId != btn.id) {
            let record = ui.scroll_album.FindRecord(this._albumId);
            if (record != null && record.cell != null) {
                const item = record.cell as Album;
                item.root.checked.active = false;
            }
        }
        btn.checked.active = true;

        this._albumId = btn.id;
        this.initScrollStage();
        let albumId = Notifier.call(CallID.Stage_GetAlbumId);
        if (albumId != this._albumId) {
            Notifier.send(ListenID.Stage_ChangeAlbum, this._albumId);            
        }

        let albumNode = ui.scroll_album.node;
        albumNode.stopAllActions();
        albumNode.runAction(this._albumOut);

        let stageNode = ui.scroll_stage.node;
        stageNode.stopAllActions();
        stageNode.runAction(this._stageIn);
        this._showStage = true;
    }

    private onAlbumOutFinish() {
        this._ui.scroll_album.node.active = false;
    }

    private _curStageId = 0;
    private _lastStageId = 0;
    private initScrollStage() {
        let scroll = this._ui.scroll_stage;
        scroll.Clear();

        let albumCfg = Cfg.Album.get(this._albumId);
        this._ui.title_stage.string = albumCfg.desc || "";

        this._curStageId = Notifier.call(CallID.Stage_GetCurId);
        this._lastStageId = Notifier.call(CallID.Stage_GetLastId);
        let sceneCfgs = Cfg.Scene.filter({album : this._albumId});
        for (let index = 0; index < sceneCfgs.length; index++) {
            const sceneCfg = sceneCfgs[index];
            let record = new ScrollRecord(sceneCfg.id);
            scroll.AddRecord(record);                        
        }
        scroll.Build();

        let record = scroll.FindRecord(this._curStageId);
        scroll.ShowRecord(record);
    }

    private onCreateStage(record : ScrollRecord) {
        let stage = record.cell as Stage;
        let btn = stage.root;
        btn.SetListenerWithSelf(this.onClickStage, this);
    }

    private onPopStage(record : ScrollRecord) {
        let item = record.cell as Stage;
        let btn = item.root;
        let sceneCfg = Cfg.Scene.get(record.id);
        item.id = sceneCfg.id;
        btn.id = sceneCfg.id;
        btn.icon.setSprite(sceneCfg.icon);

        if (this._lastStageId == sceneCfg.id) {
            btn.checked.active = true;
        } else {
            btn.checked.active = false;
        }

        btn.mainText.string = sceneCfg.name;

        let stage : IItem = Notifier.call(CallID.Stage_GetStage, sceneCfg.id);
        if (stage != null) {
            btn.badge.active = false;
            btn.image.node.color = cc.Color.WHITE;
            btn.icon.node.color = cc.Color.WHITE;
            if (stage.num > 1) {
                btn.mask.node.color = cc.Color.WHITE;
            } else {
                btn.mask.node.color = cc.Color.GRAY;
            }
        } else {
            btn.badge.active = true;
            btn.image.node.color = cc.Color.GRAY;
            btn.icon.node.color = cc.Color.GRAY;
            btn.mask.node.color = cc.Color.GRAY;
        } 
    }

    private onPushStage(record : ScrollRecord) {
        //let item = record.cell as Stage;
        
    }

    private onClickStage(btn : ButtonCell) {
        if (btn.badge.active) {
            let args = new FlowTipsArgs();
            args.SetInfo("通过上一关解锁");
            Notifier.send(ListenID.Flow_Txt, args);
            return;
        }

        let stageId = btn.id;
        let sceneCfg = Cfg.Scene.get(stageId);
        if (sceneCfg.cost != null) {
            let args : MVCS.OpenArgs = new MVCS.OpenArgs();
            args.SetId(sceneCfg.cost.id);
            args.SetNum(sceneCfg.cost.num);
            let needTrack : boolean = Notifier.call(CallID.Item_CheckTrack, args)
            if (needTrack) {
                return;
            }
        }

        this.close();
        Notifier.send(ListenID.Stage_ChangeStage, btn.id);        
        let msg = new SceneSwitchMsg();
        msg.setId(stageId);
        Notifier.send(ListenID.Scene_AskSwitch, msg);
    }

    private onStageOutFinish() {
        let scroll = this._ui.scroll_stage;
        scroll.Clear();
        //this._ui.scroll_stage.node.active = false;
    }
}
