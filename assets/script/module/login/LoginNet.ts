import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { ListenID } from "../../ListenID";
import { LoginModel } from "./LoginModel"
import { Manager } from "../../manager/Manager";
import { NetUtil } from "../../NetUtil";
import { XHSDK } from "../../../sdk/XHSDK";
import { AppConfig } from "../../../sdk/AppConfig";
import { IMsg } from "../../message/IMsg";
import { Time } from "../../../frame/Time";

export class LoginNet extends MVCS.AbsNet<LoginModel> {
    public reset() : void {
        
    }

    protected register() : void {
        Notifier.addListener(ListenID.Login_Again, this.login, this);
        Notifier.addListener(NotifyID.App_Pause, this.onAppPause, this);
    }

    public login() {
        let userInfo = XHSDK.userinfo;
        let open_id : string;
        let nick_name : string;
        let avatar_url : string;
        let ofp = "test";
        if (userInfo == null) {
            let localId = Manager.storage.getString("localId");
            if (isNullOrEmpty(localId)) {
                localId = Date.now().toString();
                Manager.storage.setString("localId", localId);
            }
            cc.log("localId:", localId);
            open_id = localId;
            nick_name = "default";
            avatar_url = "default";
            XHSDK.localId = open_id;
        } else {
            open_id = userInfo.open_id;
            nick_name = userInfo.nick_name;
            avatar_url = userInfo.avatar_url;
            ofp = userInfo.ofp || "";

            if (isNullOrEmpty(nick_name)) {
                nick_name = "default";
            }
            if (isNullOrEmpty(avatar_url)) {
                avatar_url = "default";
            }
        }
        Manager.storage.setPersonKey(open_id);

        let body = {
            miniprogram : AppConfig.AppID,
            programId : AppConfig.ProgramId,
            openid : open_id,
            ofp : ofp,
        }
        NetUtil.httpPost("getJWT", body, this.onLogin, this);
    }

    public onLogin(msg : IMsg) {
        if (msg.err != 0) {
            console.error("onLogin error", msg.err);
            return;
        }
        //console.log("onLogin msg", msg.msg);

        let data = msg.data;
        NetUtil.setToken(data.jwt);
        NetUtil.setUser(data.id, data.nid, data.expiresAt);

        this.updateUser();

        Notifier.send(ListenID.Login_Finish);

        if (msg.msg == "new") {
            //新手处理
            let queryArgs = XHSDK.queryArgs;
            if (queryArgs["invite"]) {
                //受邀请来的处理
                Notifier.send(NotifyID.SDK_ReqAuth, ()=>{
                    Notifier.send(NotifyID.Invite_Feedback, queryArgs["invite"]);
                })
            }
        }
        //cc.log("onLogin", data);
    }

    private updateUser() {
        let userInfo = XHSDK.userinfo;
        if (!userInfo) {
            return;
        }

        if (isNullOrEmpty(userInfo.nick_name) || isNullOrEmpty(userInfo.avatar_url)) {
            console.log("updateUser skip empty", userInfo.open_id);
            return;
        }

        //自定义展示数据
        let data = {};

        let body = {
            nickname : userInfo.nick_name,
            headimgurl : userInfo.avatar_url,
            gender : userInfo.gender ? userInfo.gender.toString() : "",
            country : userInfo.country,
            province : userInfo.province,
            city : userInfo.city,
            //data : JSON.stringify(data),
        }

        NetUtil.httpPost("user/profile", body, null, null);
    }

    public getServerTime() {
        NetUtil.httpGet("serverTime", null, this.onGetServerTime, this);
    }

    private _lastDay = 0;
    private onGetServerTime(msg : IMsg) {        
        Time.setServerTime(msg.data);

        let date = new Date(Time.serverTimeMs);
        let day = date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();
        if (day != this._lastDay) {
            this._lastDay = day;
            Notifier.send(NotifyID.Day_Changed, day);
        }
    }

    private onAppPause(enable : boolean) {
        if (enable) {
            return;
        }

        //每次重新进入获取一次服务器时间
        this.getServerTime();        
    }
}