import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { DefaultTransition } from "../../../frame/mvcs/transition/DefaultTransition";
import { Time } from "../../../frame/Time";

import { SceneLoadingUI } from "./uiGen/SceneLoadingUI";
import { Manager } from "../../manager/Manager";
import { SceneSwitchMsg } from "../../message/SceneSwitchMsg";
import { ListenID } from "../../ListenID";
import { CallID } from "../../CallID";
import { Cfg } from "../../config/Cfg";

export class SceneLoadingView extends MVCS.AbsView {
    public constructor() {
        super("ui/SceneLoadingUI@Scene", MVCS.eUILayer.Loading, MVCS.eUIQueue.None, new DefaultTransition())
        
    }

    private _ui : SceneLoadingUI;

    protected onLoad() : void {
        //cc.log(this.getType(), "onLoad")

        let ui = new SceneLoadingUI(this.node);
        this._ui = ui;        
        ui.node.on(cc.Node.EventType.TOUCH_START, this.onClickFrame, this);
    }

    protected onUnload() : void {
        
    }

    protected changeListener(enable : boolean) : void {
        Notifier.changeListener(enable, ListenID.Scene_SwitchFinish, this.onSwitchFinish, this);
        Notifier.changeListener(enable, NotifyID.Game_Update, this.onUpdate, this);
    }
    
    private _switchFinish = false;
    private _progress = 0;
    private _showProgress = 0;
    private _timeout = 0;
    private _isTimeout = false;
    private _speed = 1;
    protected onOpen() : void {
        super.onOpen();

        let prevSceneId = Notifier.call(CallID.Scene_GetPrevId);        
        if (prevSceneId == 0) {
            Notifier.send(NotifyID.SDK_LoadingLog, "progressStart");
            this.preload();
        }

        this._switchFinish = Notifier.call(CallID.Scene_IsEnter);
        if (this._switchFinish) {
            this.finish();
            return;
        }

        let sceneId = Notifier.call(CallID.Scene_GetCurId);
        cc.log("SceneLoadingView.onOpen", sceneId, "switchFinish" ,this._switchFinish);

        this._progress = 0.99;
        this._showProgress = 0;
        this._timeout = Time.time + 10;
        this._isTimeout = false;
        this._ui.bar_loading.mainText.string = "加载中...";
    }

    protected onClose() : void {
        super.onClose();
        //cc.error(this.getType(), "onClose");
        Notifier.send(ListenID.Scene_LoadingViewClose);
        let prevSceneId = Notifier.call(CallID.Scene_GetPrevId);        
        if (prevSceneId == 0) {
            Notifier.send(NotifyID.SDK_LoadingLog, "progressEnd");
        }     
    }

    private onUpdate() {        
        if (this._isTimeout) {
            return;
        }
        if (Time.time > this._timeout) {
            let msg = new MVCS.AffirmArgs();
            msg.SetTitle("加载错误")
                .SetInfo("当前网络异常，进入场景失败，请在网络良好处重启微信再次尝试！")
                .SetStyle(MVCS.eAffirmStyle.YesOrNo)
                .SetContext(this);
            Notifier.send(ListenID.Affirm, msg);
            Notifier.send(ListenID.Scene_BackToCity);
            this._isTimeout = true;
        }

        if (this._showProgress >= this._progress) {
            //cc.log(this.getType(), "onUpdate", this._showProgress, Time.time, this._timeout);
            return;
        }

        let bar = this._ui.bar_loading;
        let deltaTime = Time.deltaTime * this._speed;
        let delta = (this._progress - this._showProgress) * deltaTime;
        this._showProgress = Math.lerp(this._showProgress, this._progress, delta);
        if (this._showProgress > 1) {
            this._showProgress = 1;
        }
        bar.progress = this._showProgress;
        //cc.log("onUpdate", this._showProgress, this._progress)
    }

    private onSwitchFinish(msg : SceneSwitchMsg) {
        cc.log("SceneLoadingView.onSwitchFinish", msg.id);
        this._switchFinish = true;

        this.finish();        
    }

    private finish() {
        this.close();
    }

    private preload() {
        
    }
}
