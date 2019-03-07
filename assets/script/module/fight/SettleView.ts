import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { ListenID } from "../../ListenID";
import { DefaultTransition } from "../../../frame/mvcs/transition/DefaultTransition";
import { SettleUI } from "./uiGen/SettleUI";
import { Cfg } from "../../config/Cfg";
import { SoundDefine } from "../../config/SoundCfg";
import { SceneSwitchMsg } from "../../message/SceneSwitchMsg";
import { CallID } from "../../CallID";
import { IItem } from "../../message/IItem";
import { FuncDefine } from "../../config/FuncCfg";
import { AppConfig } from "../../../sdk/AppConfig";
import { btn_back } from "../common/uiGen/btn_back";

export class SettleView extends MVCS.AbsView {
    public constructor() {
        super("ui/SettleUI@Fight", MVCS.eUILayer.Main, MVCS.eUIQueue.None, new DefaultTransition());
    }

    private _ui : SettleUI;

    protected onLoad() : void {
        let ui = new SettleUI(this.node);
        this._ui = ui;

        ui.btn_back.SetListener(this.onClickBack, this);
        ui.btn_back.clickAudioId = SoundDefine.BtnBack;

        // ui.btn_share.SetListener(this.onClickShare, this);
        // ui.btn_share.clickAudioId = SoundDefine.BtnStart;        
        ui.btn_again.SetListener(this.onClickAgain, this);
        ui.btn_again.clickAudioId = SoundDefine.BtnStart;

        // ui.btn_reward.SetListener(this.onClickReward, this);
        // ui.btn_reward.clickAudioId = SoundDefine.BtnStart;
        ui.btn_next.SetListener(this.onClickNext, this);
        ui.btn_next.clickAudioId = SoundDefine.BtnStart;
    }
    
    protected onUnload() : void {

    }

    protected onOpen() {
        super.onOpen();

        this.refreshResult();
    }

    protected onClose() {
        super.onClose();
        
        Notifier.send(NotifyID.SDK_CleanTiger);
    }

    private onClickBack(){
        this.close();
        Notifier.send(ListenID.Scene_BackToCity);
    }

    private _curId = 0;
    private _nextId = 0;
    private refreshResult() {
        let ui = this._ui;

        this._curId = Notifier.call(CallID.Stage_GetCurId);
        let sceneCfg = Cfg.Scene.get(this._curId);
        //ui.stage.string = sceneCfg.name;
        ui.btn_again.mainText.string = sceneCfg.name;

        Notifier.send(NotifyID.SDK_CreateTiger, AppConfig.TigerID.gameOver, ui.btn_tiger.button);    

        let args = this._openArgs;
        let grade = args.index;
        // switch (grade) {
        //     case 0:
        //         ui.animation.play("Fail");
        //         break;
        //     case 1:
        //         ui.animation.play("Pass");
        //         break;
        //     case 2:
        //         ui.animation.play("Prefect");
        //         break;
        //     default:
        //         break;
        // }

        cc.error("refreshResult", grade);

        //发放奖励
        if (grade > 0) {
            let reward = sceneCfg.rewards[grade - 1];
            if (reward != null) {
                Notifier.send(ListenID.Item_Awards, reward);                
            }
        }
        //更新关卡
        Notifier.send(ListenID.Stage_Update, {id : this._curId, num : grade})

        this._nextId = Notifier.call(CallID.Stage_GetNextId);
        if (this._nextId) {
            //判断下一级是否解锁
            let nextStage : IItem = Notifier.call(CallID.Stage_GetStage, this._nextId);
            if (nextStage == null) {
                let nextSceneCfg = Cfg.Scene.get(this._nextId);
                if (nextSceneCfg.album != sceneCfg.album) {
                    let nextAlbumCfg = Cfg.Album.get(nextSceneCfg.album);
                    ui.btn_again.subText.node.active = true;
                    ui.btn_again.subText.string = "总玫瑰达到{0}解锁下一关".format(nextAlbumCfg.unlockStar);
                } else {
                    ui.btn_again.subText.node.active = false;
                }
                this._nextId = null;
            } else {
                ui.btn_again.subText.node.active = false;
            }            
        } else {
            cc.log("refreshResult Stage_GetNextId null");
            ui.btn_again.subText.node.active = true;
            ui.btn_again.subText.string = "恭喜你通关了";
        }

        if (this._nextId == null) {
            ui.btn_again.node.active = true;
            ui.btn_next.node.active = false;
        } else {
            ui.btn_again.node.active = false;
            ui.btn_next.node.active = true;
        }
    }

    private onClickShare(){
        Notifier.send(NotifyID.SDK_ReqShare, "energy", null, ()=> {
            this.close();
            let msg = new SceneSwitchMsg();
            msg.setId(this._curId);
            //重试不消耗体力
            msg.setRetry(true);
            Notifier.send(ListenID.Scene_AskSwitch, msg);
        });
    }

    private onClickReward(){
        Notifier.send(NotifyID.SDK_ReqShare, "reward", null, ()=> {
            
        });
    }

    private onClickNext(){
        let nextId : number = this._nextId;
        let sceneCfg = Cfg.Scene.get(nextId);
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
        let msg = new SceneSwitchMsg();
        msg.setId(nextId);
        Notifier.send(ListenID.Scene_AskSwitch, msg);

        Notifier.send(ListenID.Stage_ChangeStage, nextId);
    }

    private onClickAgain(){
        let curId : number = Notifier.call(CallID.Stage_GetCurId);
        let sceneCfg = Cfg.Scene.get(curId);
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
        let msg = new SceneSwitchMsg();
        msg.setId(curId);
        Notifier.send(ListenID.Scene_AskSwitch, msg);
    }
}

