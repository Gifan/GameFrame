import { MVC } from "../../framework/MVC";
import { Notifier } from "../../framework/Notifier";
import { Common_HttpInterface, Common_UIPath } from "../../common/Common_Define";
import NetAdapter from "../../adpapter/NetAdapter";
import { ListenID } from "../../ListenID";
import { Const } from "../../config/Const";
import { Cfg } from "../../config/Cfg";
import { GameVoManager } from "../../manager/GameVoManager";
import { HD_MODULE } from "../../sdk/hd_module/hd_module";
import { Manager } from "../../manager/Manager";

export class LoginController extends MVC.BaseController {
    public constructor() {
        super("LoginController");
        this.changeListener(true);
    }

    protected changeListener(enable: boolean): void {
        Notifier.changeListener(enable, ListenID.Login_Start, this.onLoginStart, this);
        Notifier.changeListener(enable, ListenID.Login_Finish, this.onLoginFinish, this);
        // Notifier.changeListener(enable, ListenID.Login_User, this.onLoginFinish, this);
    }

    public login(openid: string, nickName: string = "", avatarUrl: string = "") {
        return NetAdapter.httpPost(Common_HttpInterface.UserLogin, { openid: openid, nick_name: nickName, avatar_url: avatarUrl });
    }
    private onLoginStart(): void {

    }

    private onLoginFinish(): void {
        let data = Cfg.Barrier.getAll()
        let num = 0;
        for (const k in data) {
            num++;
        }
        GameVoManager.getInstance.stateVo.stepNum = num;
        GameVoManager.getInstance.stateVo.isNewUser = !Manager.storage.getNumber(Const.STORAGE_NEWUSER, 0);
        HD_MODULE.PLATFORM.showToast("进入战斗中!");
        let self = this;
        // let checkLogin = () => {
        //     if (HD_MODULE.getPlatform().isWeChat() || !cc.sys.isNative || GameVoManager.getInstance.stateVo.isGetData || HD_MODULE.getPlatform().isAndroid())
        //         this.loadResSuc();//).catch(this.loadResFai.bind(this));
        //     else {
        //         setTimeout(() => {
        //             checkLogin();
        //         }, 2000);
        //     }
        // }
        // checkLogin();
        this.loadResSuc()
    }

    // loadRes(): Promise<any> {
    //     return new Promise((rec, rej) => {
    //         rec()
    //     });
    // }

    loadResSuc() {
        // HD_MODULE.PLATFORM.showVideoByIndex(1, false);
        cc.director.loadScene(Const.GAME_SCENENAME, () => {
            HD_MODULE.getNet().postGameEvent({ event_name: 'loadend', counter: 1 });
            GameVoManager.getInstance.myUserVo.loadState = 2;
        });
    }

    loadResFai() {
        HD_MODULE.getPlatform().showWxTips("提示", "网络不稳定,点击确定重连", "确定", "", (data) => {
            if (data.confirm) {
                HD_MODULE.getPlatform().setLoadingVisible(true);
                this.loadResSuc();//.bind(this)//).catch(this.loadResFai.bind(this));
            }
        });
    }
}
