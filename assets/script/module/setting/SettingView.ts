
import { ListenID } from "../../ListenID";
import { CallID } from "../../CallID";
import { Manager } from "../../manager/Manager";
import { Common_UIPath } from "../../common/Common_Define";
import { HD_MODULE } from "../../sdk/hd_module/hd_module";
import { HDDefaultUserInfo } from "../../sdk/hd_module/config/AppConfig";
import { AlertManager } from "../../alert/AlertManager";
import { Util } from "../../utils/Util";
import { Notifier } from "../../frame/Notifier";
import { NotifyID } from "../../frame/NotifyID";
import { MVC } from "../../frame/MVC";
import { UIManager } from "../../frame/UIManager";

const { ccclass, property } = cc._decorator;

@ccclass
export default class SettingView extends MVC.BaseView {

    @property(cc.Toggle)
    musicToggle: cc.Toggle = null;

    @property(cc.Toggle)
    audioToggle: cc.Toggle = null;

    @property(cc.Toggle)
    shakeToggle: cc.Toggle = null;

    @property(cc.Toggle)
    hurtToggle: cc.Toggle = null;

    @property(cc.Label)
    lblCustomServer: cc.Label = null;

    @property(cc.Label)
    lblUserId: cc.Label = null;

    private _customServer: string = "";
    private _userId: string = "";
    private _pasteBtnId: string = "";

    protected changeListener(enable: boolean): void {
        //Notifier.changeListener(enable, NotifyID.Game_Update, this.onUpdate, this);
        Notifier.changeListener(enable, NotifyID.SDK_Banner_Resize, this.resizeBtnPos, this);
    }

    resizeBtnPos() {
        let closeNode = cc.find("know", this.node);
        // closeNode.position = cc.v2(closeNode.x, WXSDK.bannerY);
        closeNode.active = true;
    }

    /*
     * 打开界面回调，每次打开只调用一次
     */
    public onOpen(args: any): void {
        super.onOpen(args);
        let muteMusic: boolean = Notifier.call(CallID.Setting_IsMuteMusic);
        this.musicToggle.isChecked = muteMusic;
        let muteaudio: boolean = Notifier.call(CallID.Setting_IsMuteAudio);
        this.audioToggle.isChecked = muteaudio;
        let muteshake: boolean = Notifier.call(CallID.Setting_IsBlockShake);
        this.shakeToggle.isChecked = muteshake;
        let hurtShow: boolean = Notifier.call(CallID.Setting_IsHurtShow);
        this.hurtToggle.isChecked = hurtShow;
        this.onFlush();
        Notifier.send(ListenID.ShowBanner, 3);
    }

    public start() {

    }

    /*
     * 关闭界面回调，每次打开只调用一次
     */
    public onClose(): void {
        Manager.audio.playAudio(501);
        super.onClose();
        Notifier.send(ListenID.HideBanner);
    }

    private onClickMusic(target: cc.Toggle) {
        Manager.audio.playAudio(501);
        Notifier.send(ListenID.Setting_MuteMusic, target.isChecked);
    }

    private onClickAudio(target: cc.Toggle) {
        Manager.audio.playAudio(501);
        Notifier.send(ListenID.Setting_MuteAudio, target.isChecked);
    }

    private onClickShake(target: cc.Toggle) {
        Manager.audio.playAudio(501);
        Notifier.send(ListenID.Setting_BlockShake, target.isChecked);
    }

    private onClickHurt(target: cc.Toggle) {
        Manager.audio.playAudio(501);
        Notifier.send(ListenID.Setting_HurtShow, target.isChecked);
    }

    onBtnNoticeClick() {
        Manager.audio.playAudio(501);
        UIManager.Open(Common_UIPath.NoticeUI, MVC.eTransition.Default, MVC.eUILayer.Tips);
    }

    /** 复制到剪贴板(原生平台可用) */
    uiPasteBoard(e, d) {
        let str = '';
        if (d == `1`) {
            if (this._pasteBtnId == d) return;
            str = this._customServer;
        } else {
            if (this._pasteBtnId == d) return;
            str = this._userId;
        }
        this._pasteBtnId == d;//不能一重复点复制，会卡死

        HD_MODULE.getPlatform().uiPasteBoard(str);
        AlertManager.showNormalTips("复制到剪贴板成功");
    }

    onFlush(type: string = `all`) {
        switch (type) {
            case `all`: {
                this._updateLblCustomServer();
                this._updateLblUserId();
                break;
            }
        }
    }

    private _updateLblCustomServer() {
        if (this.lblCustomServer) {
            let str = "heidong20190501";
            this.lblCustomServer.string = str;
            this._customServer = str;
        }
    }

    private _updateLblUserId() {
        if (this.lblUserId) {
            let str = HDDefaultUserInfo.open_id;
            if (HD_MODULE.PLATFORM.isWeChat() || HD_MODULE.PLATFORM.isZiJie()) {
                str = HD_MODULE.PLATFORM.getOpenId();
            }
            this._userId = str;
            if (str) {
                this.lblUserId.string = Util.normalName(str, 10);
            }
        }
    }
}
