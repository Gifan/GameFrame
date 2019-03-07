import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { ListenID } from "../../ListenID";

import { LoginModel } from "./LoginModel"
import { LoginNet } from "./LoginNet"
import { SceneSwitchMsg } from "../../message/SceneSwitchMsg";
import { SceneDefine } from "../../config/SceneCfg";
import { Manager } from "../../manager/Manager";
import { NetUtil } from "../../NetUtil";
import { AppConfig } from "../../../sdk/AppConfig";

/// <summary>
/// 登录逻辑
/// </summary>
export class LoginLogic extends MVCS.MNLogic<LoginModel, LoginNet> {

    public constructor() {
        super("Login");

        this.setup(new LoginModel(), new LoginNet());
        this.changeListener(true);        
    }

    protected changeListener(enable : boolean) : void {
       Notifier.changeListener(enable, NotifyID.App_Start, this.OnAppStart, this);
       Notifier.changeListener(enable, ListenID.Login_Finish, this.OnLoginFinish, this);
    }

    private OnAppStart() : void {
        // UIManager.Open(FuncDefine.Login);
        let serverIndex = Manager.storage.getNumber("serverIndex", AppConfig.GameUrlDefaultIndex);
        let serverUrl = AppConfig.Servers[serverIndex];
        if (serverUrl == null) {
            cc.error("serverUrl error, index:", serverIndex);
            serverUrl = AppConfig.Servers[AppConfig.GameUrlDefaultIndex];
        }
        NetUtil.setGameUrl(serverUrl.url);
        
        this._net.getServerTime();
        this._net.login();
    }

    private OnLoginFinish() : void {
        let id = SceneDefine.Main;
        let msg = new SceneSwitchMsg();
        msg.setId(id);
        Notifier.send(ListenID.Scene_AskSwitch, msg);
    }
}
