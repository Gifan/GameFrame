import { MVC } from "../../framework/MVC";
import { Notifier } from "../../framework/Notifier";
import { ListenID } from "../../ListenID";
import { CallID } from "../../CallID";
import SettingModel from "./SettingModel";
import { Manager } from "../../manager/Manager";
import { Const } from "../../config/Const";
import { UIManager } from "../../framework/UIManager";
import { Common_UIPath } from "../../common/Common_Define";

/*
 * 设置控制器
 */
export class SettingController extends MVC.BaseController {
    public constructor() {
        super("SettingController");
        this.changeListener(true);
    }

    public reset(): void {

    }

    protected changeListener(enable: boolean): void {
        Notifier.changeCall(enable, CallID.Setting_IsMuteMusic, this.isMuteMusic, this);
        Notifier.changeCall(enable, CallID.Setting_IsMuteAudio, this.isMuteAudio, this);
        Notifier.changeCall(enable, CallID.Setting_IsBlockShake, this.isBlockShake, this);
        Notifier.changeCall(enable, CallID.Setting_IsHurtShow, this.isHurtShow, this);
        Notifier.changeCall(enable, CallID.Setting_GetRealDesignSize, this.getRealDesign, this);

        Notifier.changeListener(enable, ListenID.Login_Start, this.onLoginStart, this);
        Notifier.changeListener(enable, ListenID.Setting_MuteMusic, this.reqMuteMusic, this);
        Notifier.changeListener(enable, ListenID.Setting_MuteAudio, this.reqMuteAudio, this);
        Notifier.changeListener(enable, ListenID.Setting_BlockShake, this.reqBlockShake, this);
        Notifier.changeListener(enable, ListenID.Setting_HurtShow, this.reqHurShow, this);
        Notifier.changeListener(enable, ListenID.Setting_Open, this.openSettingView, this);
    }

    private onLoginStart() {
        let storagedata = Manager.storage.getString(Const.STORAGE_SETTING, "");
        // //console.log("onLoginStart", storagedata);
        if (storagedata && storagedata != "") {
            SettingModel.getInstance.initSetting(JSON.parse(storagedata));
            Manager.audio.muteAudio(SettingModel.getInstance.muteAudio);
            // Manager.audio.muteMusic(SettingModel.getInstance.muteMusic);
        }
    }

    private isMuteMusic(): boolean {
        return SettingModel.getInstance.muteMusic;
    }

    private isMuteAudio(): boolean {
        return SettingModel.getInstance.muteAudio;
    }

    private isBlockShake(): boolean {
        return SettingModel.getInstance.blockShake;
    }

    private isHurtShow(): boolean {
        return SettingModel.getInstance.hurtShow;
    }

    private getRealDesign(): cc.Size {
        return SettingModel.getInstance.getRealDesignSize();
    }

    private reqMuteMusic(enable: boolean) {
        SettingModel.getInstance.muteMusic = !!enable;
        Manager.audio.muteMusic(!!enable);
        this.reqSave();
    }

    private reqMuteAudio(enable: boolean) {
        SettingModel.getInstance.muteAudio = enable;
        Manager.audio.muteAudio(enable);
        this.reqSave();
    }

    private reqBlockShake(enable: boolean) {
        SettingModel.getInstance.blockShake = enable;
        this.reqSave();
    }
    private reqHurShow(enable:boolean){
        SettingModel.getInstance.hurtShow = enable;
        this.reqSave();
    }

    public reqSave() {
        Manager.storage.setString(Const.STORAGE_SETTING, SettingModel.getInstance.serialize());
    }

    public openSettingView() {
        UIManager.Open(Common_UIPath.SettingUI,MVC.eTransition.Default,MVC.eUILayer.Popup);
    }
}