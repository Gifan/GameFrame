import { Notifier } from "../frame/mvcs/Notifier";
import { ListenID } from "./ListenID";
import { MVCS } from "../frame/mvcs/MVCS";
import { AppConfig } from "../sdk/AppConfig";
import { Time } from "../frame/Time";
import { IMsg } from "./message/IMsg";

const NetLogger = console;

interface IOption {
    [key: string]: string | Array<string>;
}

/**
 * url 拼接参数
 * @param url 原始url，不要带有？，之后再优化各种url参数的兼容
 * @returns
 */
function _urlBindParams(url: string, params: IOption) {
    let postfix = "?";
    for (let key in params) {
        let value = params[key];
        postfix += `${key}=${value}&`;
    }
    postfix = postfix.slice(0, postfix.length - 1);
    return `${url}${encodeURI(postfix)}`;
}

class _NetUtil {
    private _token = null;
    public setToken(token : string) {
        if (token == null) {
            cc.error("NetUtil.setToken null");
            return;
        }
        this._token = "Bearer " + token;
    }

    private _gameUrl = "www.test.com";
    public get gameUrl() {
        return this._gameUrl;
    }

    public setGameUrl(url : string) {
        if (url == null) {
            cc.error("NetUtil.setGameUrl null");
            return;
        }
        this._gameUrl = url;
    }

    private _id = "";
    private _nid = 0;
    private _expiresAt = 0;
    public setUser(id : string, nid : number, expiresAt : string) {        
        this._id = id;
        this._nid = nid;
        //提前一小时重新获取token
        this._expiresAt = Date.parse(expiresAt) - 60 * 60 * 1000;
        //cc.log("this._expiresAt", this._expiresAt, Time.clientTimeMs);
    }

    private checkExpires() {
        if (!this._token) {
            return;
        }
        if (this._expiresAt > Time.clientTimeMs) {
            return;
        }
        Notifier.send(ListenID.Login_Again);
    }

    public showRegetAffirm(req : XMLHttpRequest, url : string, title : string, info : string) {
        let msg = new MVCS.AffirmArgs();
        msg.SetTitle(title)
            .SetInfo(info)
            .SetStyle(MVCS.eAffirmStyle.YesOrNo)
            .SetCallback(function(result : MVCS.eReplyOption, param : object) {
                if (result != MVCS.eReplyOption.Confirm) {
                    return;
                }
        
                cc.log("get showRegetAffirm:", url);
                req.open("GET", url, true);
                req.send();
            })
            .SetContext(this);
        Notifier.send(ListenID.Affirm, msg);
    }

    public showRepostAffirm(req : XMLHttpRequest, url : string, body : string, title : string, info : string) {
        let msg = new MVCS.AffirmArgs();
        msg.SetTitle(title)
            .SetInfo(info)
            .SetStyle(MVCS.eAffirmStyle.YesOrNo)
            .SetCallback(function(result : MVCS.eReplyOption, param : object) {
                if (result != MVCS.eReplyOption.Confirm) {
                    return;
                }
        
                console.log("post showRegetAffirm:", url);
                req.open("POST", url, true);
                req.send(body);
            })
            .SetContext(this);
        Notifier.send(ListenID.Affirm, msg);
    }

    public httpGet(cmd : string, body : IOption, callback : (data : IMsg) => void, context : any) : void {
        let url = `${this._gameUrl}/${cmd}`;
        url = _urlBindParams(url, body);

        console.info("httpGet:", url);

        let req = cc.loader.getXMLHttpRequest();
        req.onreadystatechange = () => {
            if (req.readyState !== 4) {
                //cc.error("request readyState error:", req.readyState, "DONE", req.DONE);
                return;
            }
            if (req.status < 200 || req.status >= 300) {
                cc.error("request status error:", req.status);
                this.showRegetAffirm(req, url, "网络错误", "网络状态错误：" + req.status + "，消息发送失败，是否尝试重发！");
                return;
            }

            console.info("httpGet:", cmd, "response", req.responseText);
            let result : IMsg = JSON.parse(req.responseText);
            if (result.err != 0) {
                this.showRegetAffirm(req, url, "消息错误", "消息发送错误，是否尝试重发！错误号：" + result.err + ",内容：" + result.msg);
                return;
            }

            if (callback) {
                callback.call(context, result);                
            }
        };
        req.ontimeout = () => {
            cc.error("httpGet ontimeout:", cmd, "url",  req.responseURL);
            this.showRegetAffirm(req, url, "网络超时", "当前网络异常，请切换到良好网络再次尝试！");
        };
        req.onerror = () => {
            cc.error("httpGet onerror:", cmd, "url", req.responseURL);
            this.showRegetAffirm(req, url, "网络错误", "当前网络异常，请切换到良好网络再次尝试！");
        };
        req.open("GET", url, true);
        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        req.timeout = 5000;// 5 seconds for timeout
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("version", AppConfig.GameVersion);
        if (this._token) {
            req.setRequestHeader("Authorization", this._token);           
        }
        req.send();

        this.checkExpires();
    }

    public httpPost(cmd : string, body : IOption, callback : (data : IMsg) => void, context : any) : void {
        let url = `${this._gameUrl}/${cmd}`;
        let bodyStr = body ? JSON.stringify(body) : "";

        let req = cc.loader.getXMLHttpRequest();
        req.onreadystatechange = () => {
            if (req.readyState !== 4) {
                //cc.error("request readyState error:", req.readyState);
                return;
            }
            if (req.status < 200 || req.status >= 300) {
                cc.error("request status error:", req.status);
                return;
            }

            cc.log("httpPost:", cmd, "response", req.responseText);
            let result : IMsg = JSON.parse(req.responseText);
            if (result.err != 0) {
                this.showRepostAffirm(req, url, bodyStr, "消息错误", "消息发送错误，是否尝试重发！错误号：" + result.err + ",内容：" + result.msg);
                return;
            }

            if (callback) {
                callback.call(context, result);                
            }           
        };
        req.ontimeout = () => {
            cc.error("httpPost ontimeout:", cmd, "url", req.responseURL);
            this.showRepostAffirm(req, url, bodyStr, "网络超时", "当前网络异常，请切换到良好网络再次尝试！");
        }
        req.onerror = () => {
            cc.error("httpPost onerror:", cmd, "url", req.responseURL);
            this.showRepostAffirm(req, url, bodyStr, "网络错误", "当前网络异常，请切换到良好网络再次尝试！");
        }
        req.open("POST", url, true);
        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        req.timeout = 5000;// 5 seconds for timeout
        req.setRequestHeader("Content-Type", "application/json");
        req.setRequestHeader("version", AppConfig.GameVersion);
        if (this._token) {
            req.setRequestHeader("Authorization", this._token);           
        }
        req.send(bodyStr);

        this.checkExpires();
    }

    public getQueryString(url : string, name : string) : string {
        let reg = new RegExp("(^|&?)" + name + "=([^&]*)(&|$)");
        let results = url.match(reg);
        if (results != null) {
            return unescape(results[2]);
        }
        return null;
    };
}

export const NetUtil = new _NetUtil();