import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { Time } from "../../../frame/Time";
import { ListenID } from "../../ListenID";
import { CallID } from "../../CallID";
import { Cfg } from "../../config/Cfg";
import { SettingUI } from "./uiGen/SettingUI";
import { ScaleTransition } from "../../../frame/mvcs/transition/ScaleTransition";
import { Const } from "../../config/Const";

export class SettingView extends MVCS.AbsView {
    public constructor() {
        super("ui/SettingUI@Setting", MVCS.eUILayer.Panel, MVCS.eUIQueue.Panel, new ScaleTransition())
    }
    private _ui : SettingUI;
    protected onLoad() : void {
        let ui = new SettingUI(this.node);
        this._ui = ui;
        ui.toggle_music.SetListener(this.onClickMusic, this);
        ui.toggle_audio.SetListener(this.onClickAudio, this);
        ui.toggle_shake.SetListener(this.onClickShake, this);
        ui.shade.SetListener(this.close, this);
        // ui.btn_back.SetListener(this.close, this);
    }

    protected onUnload() : void {
        
    }

    // protected changeListener(enable : boolean) : void {
    //     // Notifier.changeListener(enable, ListenID.Setting_Init, this.InitChecked, this);
    // }
    
    /*
     * 打开界面回调，每次打开只调用一次
     */
    protected onOpen() : void {
        super.onOpen();

        let ui = this._ui;
        let muteMusic : boolean = Notifier.call(CallID.Setting_IsMuteMusic);
        ui.toggle_music.InitChecked(!muteMusic);
        let muteAudio : boolean = Notifier.call(CallID.Setting_IsMuteAudio);
        ui.toggle_audio.InitChecked(!muteAudio);
        let blockShake : boolean = Notifier.call(CallID.Setting_IsBlockShake);
        ui.toggle_shake.InitChecked(!blockShake);
    }

    /*
     * 关闭界面回调，每次打开只调用一次
     */
    protected onClose() : void {
       super.onClose();
    }

    private onClickMusic(isChecked : boolean){
        Notifier.send(ListenID.Setting_MuteMusic, !isChecked);
    }

    private onClickAudio(isChecked : boolean){
        Notifier.send(ListenID.Setting_MuteAudio, !isChecked);
    }

    private onClickShake(isChecked : boolean){
        Notifier.send(ListenID.Setting_BlockShake, !isChecked);
    }
}
