import { appConfig, EPlatform, videoIdList, bannerIdList } from "../../config/AppConfig";
import Base64 = require('../../utils/base64.js');
import WeChat from "./wechat/WeChat";
import ZiJie from "./zijie/ZiJie";
import { EventManager } from "../../mgr/EventManager";
import Native_Android from "./android/Native_Android";
import Native_IOS from "./ios/Native_IOS";
import QQ from "./qq/QQ";
import { Time } from "../../../../frame/Time";

export default class Platform {
    /** token */
    private _token: string = null;

    /** openId */
    private _openId: string = null;

    /** sdk */
    private _sdk: any = null;

    /** 用户隐藏信息 */
    private _userExInfo: any = null;

    constructor() {
        /** 检查本地token是否过期 */
        // let token = localStorage.getItem("token" + appConfig.platform_id + appConfig.env);
        this._token = null;//!this.checkTokenIsExpire(token) ? token : null;
        //console.log("[hd_platform]----->获取本地token ", token);

        /** 初始化平台 */
        let platformStr = "";
        if (this.isWeChat()) {
            this._sdk = WeChat;
            platformStr = "wechat";
        } else if (this.isZiJie()) {
            this._sdk = ZiJie;
            platformStr = "zijie";
        } else if (this.isAndroid()) {
            this._sdk = Native_Android;
            platformStr = "native_android";
        } else if (this.isIOS()) {
            this._sdk = Native_IOS;
            platformStr = "native_ios";
        } else if (this.isQQ()) {
            this._sdk = QQ;
            platformStr = "qq";
        }
        if (this._sdk) {
            this._sdk.init();
            //console.log('[hd_platform]-----> SDK init, platform:', platformStr);
        } else {
            EventManager.on('login-req', (data) => data.success(() => { }), this);
            // this._sdk = Native_IOS;
            // platformStr = "native_ios";
        }
        EventManager.on('updateToken', this.updateToken, this);
        /** 监听打开激励视频 */
        EventManager.on('open-video', (data) => this.showVideo(this.getVideoId(data.index), data.success, data.fail), this);
    }

    public get sdk() {
        return this._sdk;
    }
    public updateToken() {
        let this1 = this;
        this.silenceLogin().then(res => {
        }).catch(err => {
            Time.getTokenState = 0;
            this1.updateToken();
        });
    }



    public silenceLogin(): Promise<any> {
        let this1 = this;
        return new Promise((resolve, reject) => {
            if (this1._sdk && this1._sdk.login) {
                this1._sdk.login().then(res => {
                    Time.initTokenTime();
                    resolve();
                }).catch(err => {
                    reject();
                })
            } else {
                resolve();
            }
        });
    }

    /** 是否是微信平台 */
    public isWeChat() {
        return (cc.sys.platform == cc.sys.WECHAT_GAME) && appConfig.platform_id == EPlatform.WeChat;
    }

    /** 是否是字节跳动平台 */
    public isZiJie() {
        return (cc.sys.platform == cc.sys.WECHAT_GAME) && appConfig.platform_id == EPlatform.ZiJie;
    }

    /** 是否是原生Android平台 */
    public isAndroid() {
        return (cc.sys.platform == cc.sys.ANDROID) && cc.sys.isNative;
    }

    /** 是否是原生IOS平台 */
    public isIOS() {
        return (cc.sys.os == cc.sys.OS_IOS) && cc.sys.isNative;
    }

    /** 是否是原生IOS平台 */
    public isQQ() {
        return (cc.sys.platform == cc.sys.WECHAT_GAME) && appConfig.platform_id == EPlatform.QQ;
    }

    public isNative() {
        return cc.sys.isNative;
    }

    /** 是否是测试环境 */
    public isTest() {
        return appConfig.env != 2;
    }

    /** 获取token */
    public getToken() {
        return this._token;
    }

    /** 设置token */
    public setToken(token: string) {
        this._token = token;
    }

    /** 获取openId */
    public getOpenId() {
        if (!this._openId) {
            if (this._token) {
                let decode = this._token.split('.');
                let info = JSON.parse(Base64.Base64.decode(decode[1]));
                this._openId = info.open_id;
            }
        }
        return this._openId;
    }

    public get token(): string {
        return this._token;
    }
    public isLogin(): boolean {
        return this._sdk && this._sdk.getIsLogin && this._sdk.getIsLogin();
    }

    /** 检查token是否过期 */
    public checkTokenIsExpire(token?: string) {
        if (!Time.isgetToken) return false;
        console.log("checkout token");
        let isExpire = true;
        if (!token)
            token = this._token;
        if (token) {
            let decode = token.split('.');
            let info = JSON.parse(Base64.Base64.decode(decode[1]));
            this._openId = info.open_id;
            Time.getServetTime1((serverTimeMs) => {
                // console.log("getServerTime",info.exp - serverTimeMs / 1000 <= 300)
                if (info.exp - serverTimeMs / 1000 <= 300) { //小于5分钟则过期
                    this.loginCode = -1;
                } else {
                    isExpire = false;
                }
            }, () => {

            })
        }
        if (isExpire) {
            this.updateToken();
        }
        return isExpire;
    }
    public get loginCode() {
        if (this._sdk) {
            return this._sdk.loginCode;
        }
    }

    public set loginCode(number) {
        if (this._sdk) {
            this._sdk.loginCode = number;
        }
    }

    /** 获取用户敏感信息 */
    public getUserExInfo(): any {
        let info = {};
        if (this._token) {
            let decode = this._token.split('.');
            info = JSON.parse(Base64.Base64.decode(decode[1]));
        }
        return info;
    }

    /** 获取token是否已过期 */
    public getTokenIsExpire() {
        return this.checkTokenIsExpire(this._token);
    }

    /**
     * 获取用户信息,如果用户未授权，则弹出授权窗口
     * @param success 成功回调
     */
    getUserInfo(success: Function, fail = null, info = null, force: boolean = false) {
        if (!this._sdk) return;
        this._sdk.getUserInfo && this._sdk.getUserInfo(success, fail, info, force);
    }

    /**
     * 获取用户信息
     */
    getUserInfoData() {
        if (!this._sdk) return null;
        return this._sdk.userInfo;
    }

    /**
     * 初始化右上角分享
     * @param data 
     */
    setShareAppMsg(data: wx.types.ShareOption) {
        if (!this._sdk) return;
        if (this._sdk.setShareAppMsg) {
            this._sdk.setShareAppMsg(data);
        } else {
            //console.log('[hd_platform]----->右上角分享初始化失败,平台不存在setShareAppMsg方法');
        }
    }

    /** 设置默认右上角分享 */
    setDefaultRightTopShare() {
        if (!this._sdk) return;
        if (this._sdk.setDefaultRightTopShare) {
            this._sdk.setDefaultRightTopShare();
        }
    }
    /** 
     * 录屏
     * @param onStartCallBack 开始录屏回调
     * @param onStopCallBack 停止录屏回调
     * @example 调用一次为开始录屏，再调用一次为停止录屏,也就是一直调用这一个方法就可以进行录屏和停止录屏
     */
    recordVideo(onStartCallBack?: Function, onStopCallBack?: Function) {
        if (this._sdk) {
            if (this._sdk.recordVideo) {
                this._sdk.recordVideo(onStartCallBack, onStopCallBack);
            } else {
                //console.log('[hd_platform]----->SDK不存在API: recordVider');
            }
        } else {
            //console.log('[hd_platform]----->没有接入游戏平台, 录制失败');
        }
    }

    /** 获取是否在录屏状态 */
    getIsRecord() {
        let isRecord = false;
        if (this._sdk) {
            if (this._sdk.getIsRecord) {
                isRecord = this._sdk.getIsRecord();
            } else {
                //console.log('[hd_platform]----->SDK不存在API: getIsRecord');
            }
        }
        return isRecord;
    }

    /** 
     * 根据平台显示按钮，诱导分享
     * @param btnList 按钮列表
     * @param allHide 是否全部隐藏，用于诱导分享，如果为true，则无论如何，将列表内的按钮隐藏
     * @example btnList = {wx: [btn1, btn2, btn3], tt: [btn4, btn5, btn6]}, 如果是微信平台,则显示按钮1,2,3， 头条显示4,5,6
     * 
     */
    showBtnArrayByPlatformt(btnList: any, allHide: boolean = false) {
        if (!this._sdk) {
            return;
        }
        if (!btnList) return;
        for (let platform in btnList) {
            for (let i = 0; i < btnList[platform].length; ++i) {
                let btn = btnList[platform][i];
                if (btn) {
                    if (btn instanceof cc.Button)
                        btn = btn.node;
                    switch (platform) {
                        case 'wx': {
                            btn.active = this.isWeChat();
                            break;
                        }
                        case 'tt': {
                            btn.active = this.isZiJie();
                            break;
                        }
                        case 'ios': {
                            btn.active = this.isIOS();
                            break;
                        }
                    }
                    btn.active = btn.active && !allHide;
                }
            }
        }
    }

    /** 小游戏跳转 */
    navigateToMiniProgram(data: wx.types.navigateToMiniProgramParam) {
        if (!this._sdk) {
            return;
        }
        if (this._sdk.navigateToMiniProgram) {
            this._sdk.navigateToMiniProgram(data);
        }
    }

    /** 客服 */
    openCustomerServiceConversation(data: wx.types.CustomParam) {
        if (!this._sdk) {
            return;
        }
        if (this._sdk.openCustomerServiceConversation) {
            this._sdk.openCustomerServiceConversation(data);
        }
    }

    /** 根据类型随机获取分享素材 */
    getOneShareInfoByType(type: string, success?: Function, fail?: Function) {
        if (!this._sdk) {
            return;
        }
        if (this._sdk.getOneShareInfoByType) {
            this._sdk.getOneShareInfoByType(type, success, fail);
        }
    }

    /** 拉起分享,素材随机 */
    openShareByShareTemplateRand(type: string, data?: { scene?: string, success?: Function, fail?: Function, tempImageUrl?: string }) {
        if (!this._sdk) {
            data.success && data.success();
            return;
        }
        if (this._sdk.openShareByShareTemplateRand) {
            this._sdk.openShareByShareTemplateRand(type, data);
        }
    }

    /** 获取启动参数 */
    getOnShowRes() {
        if (!this._sdk) {
            return {};
        }
        if (this._sdk.getOnShowRes) {
            return this._sdk.getOnShowRes();
        }
    }

    /** 
     * 激励视频 
     */
    showVideo(videoId: string, success?: () => any, fail?: (err: any) => any, isshow: boolean = true) {
        if (!this._sdk) { fail && fail({ errCode: 0 }); return }
        if (this._sdk.showVideo)
            this._sdk.showVideo(videoId, success, fail, isshow);
        else {
            fail && fail(null);
        }
    }

    /** 是否有视频 */
    getIsHaveVideo(): boolean {
        if (!this._sdk) {
            return true;
        }
        if (this._sdk.getIsHaveVideo) {
            return this._sdk.getIsHaveVideo();
        }
        return false
    }

    /** 获取视频id */
    getVideoId(index: number) {
        return videoIdList[appConfig.platform_id] ? videoIdList[appConfig.platform_id][index] : '';
    }

    /** 打开视频 */
    showVideoByIndex(index: number, isshow: boolean = true): Promise<any> {
        let _self = this;
        return new Promise((sucf, errf) => {
            _self.showVideo(_self.getVideoId(index), sucf, errf, isshow);
        });
    }

    /** 显示banner */
    showBanner(bannerId): Promise<any> {
        return new Promise((sucF, errF) => {
            this._sdk && this._sdk.showBanner && this._sdk.showBanner(bannerId).then(sucF).catch(errF);
        });
    }

    /** 隐藏banner */
    showBannerByIndex(index: number): Promise<any> {
        return new Promise((sucF, errF) => {
            this.showBanner(bannerIdList[appConfig.platform_id][index]).then(sucF).catch(errF);
        });
    }

    hideBanner(): Promise<any> {
        return new Promise((sucF, errF) => {
            this._sdk && this._sdk.hideBanner && this._sdk.hideBanner().then(sucF).catch(errF);
        });
    }

    /** 获取设备信息 */
    public get SystemInfo(): any {
        if (!this._sdk) return null;
        return this._sdk.systemInfo && this._sdk.systemInfo();
    }
    /** 设置onShow事件 */
    notifyOnShowEvent(onShowCallBack: Function) {
        if (!this._sdk) return;
        if (this._sdk.notifyOnShowEvent) {
            this._sdk.notifyOnShowEvent(onShowCallBack);
        }
    }

    /** 设置onHide事件 */
    notifyOnHideEvent(onHideCallBack: Function) {
        if (!this._sdk) return;
        if (this._sdk.notifyOnHideEvent) {
            this._sdk.notifyOnHideEvent(onHideCallBack);
        }
    }

    /** 获取游戏开关配置 */
    getGameSwitchConfig(): Promise<any> {
        return new Promise((resolve, reject) => {
            //console.log("getGameSwitchConfig");
            if (!this._sdk || !this._sdk.getGameSwitchConfig) {
                reject({ msg: 'sdk is null' });
            } else {
                this._sdk.getGameSwitchConfig().then(res => {
                    resolve(res);
                }).catch(err => {
                    reject(err);
                })
            }
        })
    }

    /** 显示提示框 */
    public showToast(text: string, mask: boolean = false, icon: string = "loading") {
        if (!this._sdk || !this._sdk.showToast) return;
        this._sdk.showToast(text, mask, icon);
    }

    /** 隐藏提示框 */
    public hideToast() {
        if (!this._sdk || !this._sdk.hideToast) return;
        this._sdk.hideToast();
    }
    /** 短震 */
    vibrateShort(): Promise<any> {
        return this._sdk && this._sdk.vibrateShort && this._sdk.vibrateShort();
    }

    /** 节点判断是否是诱导分享，是则节点隐藏，否则原先咋样就咋样 */
    checkIsOpenShare(node: cc.Node, type: string) {
        if (!this._sdk) return;
        if (this._sdk.checkIsOpenShare) {
            this._sdk.checkIsOpenShare(node, type);
        }
    }

    /** 判断手机是否是iphonex 底部有个横条挡住 坑 */
    isIphoneX(): boolean {
        if (!this._sdk || !this.isIphoneX) { return false }
        else return this._sdk.isIphoneX && this._sdk.isIphoneX();
    }

    /** 登陆后执行队列,如果未登录，则登录后执行，如果已登录，则立即执行 */
    rigisterEventAfterLogin(cb: () => any) {
        this._sdk && this._sdk.rigisterEventAfterLogin && this._sdk.rigisterEventAfterLogin(cb);
    }

    /** 显示微信提示框 */
    showWxTips(title: string, content: string, okText: string = "确定", cancelText: string = "", success?: (res: { confirm?: boolean, canel?: boolean }) => any) {
        if (!this._sdk) return;
        if (this._sdk.showWxTips) {
            this._sdk.showWxTips(title, content, okText, cancelText, success);
        }
    }

    /** 获取设备信息 */
    getSysInfo() {
        let info: any = {};
        if (this._sdk && this._sdk.getSysInfo) {
            info = this._sdk.getSysInfo();
        }
        return info;
    }

    destroyUserInfoBtn() {
        if (this._sdk && this._sdk.destroyUserInfoBtn) {
            this._sdk.destroyUserInfoBtn();
        }
    }

    /** 获取授权信息 */
    getSetting() {
        if (this._sdk && this._sdk.getSetting) {
            this._sdk.getSetting();
        }
    }

    /** 获取是否授权授权状态 */
    getAuthorizeInfo() {
        if (this._sdk && this._sdk.getAuthorizeInfo) {
            return this._sdk.getAuthorizeInfo();
        }
        return false;
    }

    /** 设置加载中是否显示 */
    setLoadingVisible(bool: boolean) {
        this._sdk && this._sdk.setLoadingVisible && this._sdk.setLoadingVisible(bool);
    }

    stageLog(type: number, data: any) {
        if (this._sdk && this._sdk.stageLog) {
            this._sdk.stageLog(type, data);
        }
    }

    /** 获取用户信息 */
    getUserInfoBtn() {
        if (!this._sdk || !this._sdk.getUserInfoBtn) {
            return null;
        }
        return this._sdk.getUserInfoBtn();
    }

    /** 内购 */
    inAppPurchaseWithOrderInfo(): Promise<any> {
        return new Promise((resolve) => {
            this._sdk && this._sdk.inAppPurchaseWithOrderInfo && this._sdk.inAppPurchaseWithOrderInfo().then(resolve);
        });
    }

    isQuickGame(res: any): boolean {
        if (!this._sdk || !this._sdk.isQuickGame) {
            return false;
        }
        return this._sdk.isQuickGame(res);
    }

    //复制到剪贴板
    uiPasteBoard(str: string, callback?) {
        this._sdk && this._sdk.uiPasteBoard && this._sdk.uiPasteBoard(str, callback);
    }
}