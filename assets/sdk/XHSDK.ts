import XH_MINIPRO_SDK = require("./xh_minipro_sdk_1.5.1.min.js");
import XH_MINIPRO_STATISTIC = require('./xh_minipro_statistic_1.5.0.min.js');
import XH_TIGER = require('./tiger_sdk_1.2.0.js');
import { Notifier } from "../frame/mvcs/Notifier";
import { NotifyID } from "../frame/mvcs/NotifyID";
import { AppConfig } from "./AppConfig";

const wx = window["wx"];
/**
 * 平台玩家数据
 */
export class UserInfo {
    pid        = "";	//String	用户在平台的统一索引
    app_id     = "";	//String	所在应用的appId
    open_id	   = "";    //String	用户在该应用下的open_id
    union_id   = "";	//String	用户的union_id
    nick_name  = "";	//String	用户的微信昵称
    avatar_url = "";	//String	用户的微信头像地址
    gold       = 0;	    //Number	用户在平台的金币数
    diamond    = 0 ;	//Number	用户在平台的钻石数
    is_new     = false;	//Bool	    用户是否新注册的用户
    gender     = 0;	    //Number	男：1 女：0
    country	   = "" ;   //String	用户国家
    language   = "";	//String	用户微信里面选择使用的语言
    city       = ""; 	//String	用户城市
    province   = "";	//String	用户省份
    ofp        = "";
}

export interface PayParam {
    coin : number;
    program_param : string;
}

export enum AdType {
    /** 静态icon */
    StaticIcon = 1,
    /** 动态icon */
    DynamicIcon = 2,
    /** 闪屏竖屏 */
    SplashPortrait = 3,
    Banner = 7,
    /** 闪屏横屏 */
    SplashLandscape = 8,
}

export enum AdDynamicType {
    None = 0,
    /** 放大缩小 */
    EaseInOut = 1,
    /** 抖动 */
    Shake = 2
}

export interface AdInfo {
    is_open: boolean;
    /** 广告id */
    creative_id: number;
    /** 广告位id */
    tiger_position_id: number;
    type: AdType;
    show_config: {
        image?: string;
        images?: string[];
        show_type?: AdDynamicType;
        fps?: number;
        /** 单位：秒 */
        duration: number;
        auto_change : number;
    };
}

class _XHSDK {
    /**平台分享数据 */
    private _sharelist : Array<any> = [];

    //cms开关列表
    private _switchConfig : object = null;

    public localId : string = "localId";

    /**平台用户信息 */
    public userinfo : UserInfo = null;

    //微信用户信息
    public systemInfo = null;

    //渠道码
    public channelCode = "";
    
    //邀请来源
    public share_key : string;

    /*
    * 分享参数
    * 如 invite 邀请者openid
    *  share_key 邀请来源
    */
    public queryArgs: object = {};
    /** 记录是否取消分享 */
    public isShareCancel: boolean = false
    /** 调起分享的时间 */
    public shareTime: number = 0

    /**
     * 平台登录
     * @param callBack 
     */

    public async FirstLogin(){
        if(!wx) {
            return;
        }
        await XH_MINIPRO_SDK.login().then(res => {
            this.userinfo = res;
            this.getGameSwitchConfig();
            if (this.userinfo.open_id && this.userinfo.is_new){
                XH_TIGER.sendRegisterInfo({
                    openId:this.userinfo.open_id
                });
            }
            this.xhSuccessHandle();
        });
        XH_MINIPRO_STATISTIC.onShow(res => {
            this.queryArgs = {}
            for (let keyName in res.query) {
                this.queryArgs[keyName] = res.query[keyName];
            }
            Notifier.send(NotifyID.SDK_QueryArgs, this.queryArgs);
        });
        XH_MINIPRO_STATISTIC.onHide(() => {
            cc.log("【XH_MINIPRO_STATISTIC.onHide】");
            //Notifier.send(NotifyID.App_Pause, true);
        });
        this.getLaunchOptionsSync();
    }

    /**
     * 启动参数
     * @param cb 
     */
    public getLaunchOptionsSync(){
        let sync = wx.getLaunchOptionsSync();
        console.log("小程序启动参数", sync)
        this.queryArgs = {}
        for (let keyName in sync.query) {
            this.queryArgs[keyName] = sync.query[keyName];
        }
        Notifier.send(NotifyID.SDK_QueryArgs, this.queryArgs);
    }

    /**
     * 渠道码是否匹配
     */
    public matchingChannelCode() {
        let is_match = false
        let cc = AppConfig.AppID + "-platform-default";
        if(this.channelCode == cc){
            is_match = true;
        }
        return is_match;
    }

    public XhLogin(callBack:Function):void{
        if(!wx) {
            callBack();
            return;
        }
        if(this.userinfo){
            callBack(this.userinfo);
        }
    }

    public IsWeChat(){
        return wx != null;
    }

    /**
     * 平台登录成功
     */
    public xhSuccessHandle(){
        this.getShareTemplates();
        this.systemInfo = wx.getSystemInfoSync();
    }

    /**
     * 更新平台玩家数据
     * @param info 
     * @param callBack 
     */
    public updateUserInfo(info:{},callBack:Function):void{
        XH_MINIPRO_SDK.updateUserInfo(info).then(res => {
            console.log("更新平台玩家数据",res);
            this.userinfo = res;
            callBack();
        });
    }

    /**
     * 获取平台分享数据
     */
    public getShareTemplates(){
        wx.showShareMenu();
        XH_MINIPRO_SDK.getShareTemplates().then(res => {
            console.log("获取平台分享数据", res);
            this._sharelist = res;
            this.shareAppMessage();
        });
    }

    /**
     * 监听右上角的转发按钮
     */
    private shareAppMessage(){
        let arr = this._sharelist["regular"];
        console.log("监听右上角的转发按钮",arr);
        if(!arr || arr.length == 0){
            return;
        }
        let info = arr[0];
        let openId = this.userinfo.open_id        
        XH_MINIPRO_STATISTIC.onShareAppMessage(res => {
            Notifier.send(NotifyID.SDK_WhenShare, "regular");
            return {
                title: info.title,
                imageUrl: info.image,
                success: function() {
                },
                channelCode:info.channel_code,
                query:"invite=" + openId + "&share_key=regular",
            }
        });
    }

    /**
     * 分享
     * @param callBack 
     */
    public WxShare(key?:string, value ?: object, args ?:{}):Promise<any>{
        if(!wx){
            return Promise.resolve();;
        }
        if (key == null){
            key = "regular";
        }
        let arr = this._sharelist[key];
        if(!arr || arr.length == 0){
            cc.error("shareKey null", key, this._sharelist);
            return Promise.reject(null);
        }
        //cc.error("WxShare", toJson(this.sharelist));
        let info = arr[Math.intRange(0, arr.length - 1)];
        let title = info.title;
        if (value != null) {
            //cc.error("WxShareInvite", key, info.title, toJson(value));
            title = title.format(value);
        }
        wx.hideLoading();
        let openId = this.userinfo.open_id;
        let query = "invite=" + openId + "&share_key=" + key;
        if(args){
            for (var keyName in args) {
                query = query + "&" + keyName + "=" + args[keyName];
            }
        }
        /** 记录调起分享的时间 */
        XHSDK.shareTime = new Date().getTime()

        XH_MINIPRO_STATISTIC.shareAppMessage({
            title: title,
            imageUrl: info.image,
            channelCode: info.channel_code,
            query: query,
            cancel:() => {
                XHSDK.isShareCancel = true
                console.log('分享取消----->')
            }
            
        });
        Notifier.send(NotifyID.SDK_WhenShare, key);
        return new Promise((resolve, reject) => {
            let startTime = Date.now();
            wx.onShow((res:{scene:string, query:string, shareTicket:string}) => {
                let nowTime = Date.now();
                let subTime = nowTime - XHSDK.shareTime
                console.log('打开分享时间：', subTime, XHSDK.shareTime)
                // 延迟100ms 为了确保先调分享的cancel回调，测试的时候，不延迟也是先调取消分享的接口
                setTimeout(() => {
                    if (subTime > 2 * 1000 && !XHSDK.isShareCancel) {
                        XHSDK.isShareCancel = false;
                        resolve();
                    } else {
                        XHSDK.isShareCancel = false;
                        wx.showModal({
                            title: '提示',
                            content: '分享多个群更容易成功哟！',
                            showCancel:false,
                        })
                        reject();
                    }
                }, 100)
            });
        });
    }

    /**
     * 通知平台玩家登录
     * @param openId 
     */
    public sendOpenId():void {
        XH_MINIPRO_STATISTIC.sendOpenId(this.userinfo.open_id);
    }

    //分享屏蔽信息
    public getGameSwitchConfig(){
        XH_MINIPRO_SDK.getGameSwitchConfig({
            version: AppConfig.GameVersion //传入根据平台配置的, 对应模版列表的应用版本号
        }).then(res=>{
            console.log("分享屏蔽信息GameSwitchConfig", JSON.stringify(res));
            this._switchConfig = res;
            Notifier.send(NotifyID.SDK_SwitchConfig);
        })
    }

    private _hasAd = false;
    public hasAd() {
        return this._hasAd;
    }

    // 检测是否没有广告
    public _checkNoAd(err) {
        if (err.errCode == 1005) {
            this._hasAd = false;
        }
    };

    private _bannerAd = null;

    //创建Banner广告
    public showWXBannerAd(id : string) {
        if (!this.hasAd()) {
            return;
        }
        if (!id) {
            id = "default";
        }
        // destroy if already loaded
        if (this._bannerAd) {
            this._bannerAd.destroy();
        }
        const windowHeight = this.systemInfo.windowHeight;
        const windowWidth = this.systemInfo.windowWidth;
        let bannerAd = wx.createBannerAd({
            adUnitId: id,
            style: {
                left: 0,
                top: 0,
                width: 320,
            }
        });
        bannerAd.onResize((res) => {
            console.log("on banner resize ", res);
            // let bannerHeight = 200;
            // let windowHeight = wx.getSystemInfoSync().windowHeight;
            // let windowWidth = wx.getSystemInfoSync().windowWidth;
            // let realBannerHeight = bannerHeight * windowHeight/730;
            // bannerAd.style.top = windowHeight - res.height;
            // bannerAd.style.width = windowWidth;
            // bannerAd.style.height = realBannerHeight;
        });
        bannerAd.onError((err) => {
            console.error("[wx]show banner ad,  onerror, ", err);
            this._checkNoAd(err);
        });
        bannerAd.onLoad(() => {
            console.log("[wx]banner loaded");
        });
        console.log("[wx]ad show ", id);
        bannerAd.show().catch((err) => {
            console.error("[wx]show banner ad error, ", err);
        });
        this._bannerAd = bannerAd;
    };

    //隐藏广告
    public showBannerAd(id) {
        if (this._bannerAd) {
            this._bannerAd.show();
        }else{
            this.showWXBannerAd(id);
        }
    };

    //隐藏广告
    public hideBannerAd() {
        if (this._bannerAd) {
            this._bannerAd.hide();
        }
    };

    private _videoAd = null;
    private _closeVideoHandler = null;

    private _setupAd() {
        this._hasAd = true;
        //激励视频广告组件默认是隐藏的，因此可以提前创建，以提前初始化组件。
        this._videoAd = wx.createRewardedVideoAd({
            adUnitId: 111,//这里是广告ID暂时还没有
            fail: function (res) {
                console.error("[wx]createRewardedVideoAd fail,", res);
            }
        });
        this._videoAd.onLoad(function (res) {
            console.log("[wx]video loaded ", res);
        });
        this._videoAd.onClose((res) => {
            console.log("[wx]video closed ", res);
            if (this._closeVideoHandler == null) {
                console.error("on video close, handler is null");
                return;
            }
            // 用户点击了【关闭广告】按钮
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res.isEnded || res === undefined) {
                // 正常播放结束，可以下发游戏奖励
                this._onVideoClose(true);
            }
            else {
                // 播放中途退出，不下发游戏奖励
                this._onVideoClose(false);
            }
        });
        this._videoAd.onError(function (err) {
            console.error("[wx]video ad error ", err);
            this._checkNoAd(err);
        });
    };
    
    private _onVideoClose(isEnded) {
        this._closeVideoHandler.runWith(isEnded);
    };

    public showVideoAd(closeCallback) {
        if (!this.hasAd()) {
            closeCallback.runWith(false);
            return;
        }
        this._closeVideoHandler = closeCallback;
        this._videoAd.show().catch((err) => {
            console.error("[wx]show video ad failed. ", err);
            this._videoAd.load().catch((err) => {
                console.error("[wx]video manual load failed.", err);
                this._closeVideoHandler.runWith(false);
            }).then(() => {
                this._videoAd.show().catch((err) => {
                    console.error("[wx]show video fail again. ", err);
                    this._closeVideoHandler.runWith(false);
                });
            });
        });
    };

    public isCanJumpOtherGame() {
        return this._compareVersion(this.systemInfo.version, "6.7.1") >= 0;
    };

    //跳转其他场景
    public jumpOtherGame(appid) {
        console.log("[platform]jump other game");
        wx.navigateToMiniProgram({
            appId: appid,
            // path: "", //跳转后的场景,传空值跳主场景
            // extraData: {
            //     foo: 'bar' //带参数跳转
            // },
            envVersion: 'release',
            success: function (res) {
                console.log("[wx]jump other game success, res ", res);
            },
            fail: function (res) {
                console.error("[wx]jump other game failed, res ", res);
            }
        });
    };

    // exp:1.0.1 
    public _compareVersion(v1, v2) {
        v1 = v1.split('.');
        v2 = v2.split('.');
        const len = Math.max(v1.length, v2.length);
        while (v1.length < len) {
            v1.push('0');
        }
        while (v2.length < len) {
            v2.push('0');
        }
        for (let i = 0; i < len; i++) {
            let num1 = parseInt(v1[i]);
            let num2 = parseInt(v2[i]);
            if (num1 > num2) {
                return 1;
            }
            else if (num1 < num2) {
                return -1;
            }
        }
        return 0;
    };    

    public XHPay(param : PayParam) {
        XH_MINIPRO_SDK.pay(param)
            .then(()=> {
                wx.showToast({ title: '充值成功' });
                Notifier.send(NotifyID.SDK_PayResult);
            })
            .catch(res => wx.showModal({ title: '充值失败', content: res.message }))
    }

    /**
     * @param key 场景值是否屏蔽
     */
    public isSwitchOpen(key:string) : boolean {
        if (!wx) {
            return true;
        }       

        if (this._switchConfig == null) {
            cc.error("activeShare null")
            return false;
        }
        let active = this._switchConfig[key];
        if (active == null) {
            console.log("isSwitchOpen null", key);
            active = false;
        }
        return active;        
    }

    /**
     * @param enable 是否屏蔽
     */
    public switchRequestLog(enable : boolean) : void{
        if (!wx) {
            return ;
        }   
        XH_MINIPRO_SDK.switchRequestLog({open : enable})
    }

    private _currentAdInfo: { [key: string]: AdInfo } = {};

    public get currentAdInfo() {
        return this._currentAdInfo;
    }

    public getTigerList(ids: string[]) {
        return XH_MINIPRO_SDK.getTigerList( {
            tiger_position_id_list: ids,
            appVersion: AppConfig.GameVersion
        }).then(value => {
            //console.log("getTigerList", JSON.stringify(value));
            this._processNewTigerList(value);
            return this._currentAdInfo;
        });
    }

    public navigateTiger(tiger_position_id: number, creative_id: number) {
        return XH_MINIPRO_SDK.navigateToTiger({
            tiger_position_id: tiger_position_id,
            creative_id: creative_id
        }).then(value => {
            this._processNewTigerList(value);
            return this._currentAdInfo;
        });
    }

    private _processNewTigerList(value: AdInfo[]) {
        if (value == null || value.length == null || value.length <= 0) {
            cc.error("_processNewTigerList value null", toJson(value))
            return;
        }

        this._currentAdInfo = value.reduce((ret, cur) => {
            ret[cur.tiger_position_id] = cur;
            return ret;
        }, this._currentAdInfo);
        //console.info("current tiger list: ", this._currentAdInfo);
    }

    public sendLoadingLog(type:string){
        if (!wx) {
            return;
        }
        console.log("sendLoadingLog", type);
        XH_MINIPRO_SDK.sendLoadingLog(type);
    }
}

export const XHSDK = new _XHSDK();