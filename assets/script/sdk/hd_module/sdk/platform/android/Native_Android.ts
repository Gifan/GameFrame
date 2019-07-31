import { EventManager } from "../../../mgr/EventManager";
import { HDDefaultUserInfo, appConfig } from "../../../config/AppConfig";
import { HD_MODULE } from "../../../hd_module";
import JsBridge from "./jsb/JsBridge";

let shareSuccess = 2; //默认切后台多少秒后视为成功分享

let runFuncFormArray = (funcList: Array<Function>, param?: any) => {
    if(funcList){
        while(funcList.length > 0){
            let func = funcList.pop();
            if(func)
                func(param);
        }
    }
}
/**
 * SDK接入, 微信信息注册
 */
export default class Native_Android {
    /** 用户信息 */
    public static userInfo: any = null;

    /** 分享模板信息 */
    public static shareInfo: any = {};

    /** 分享开关信息 */
    public static switchConfig: any = {};

    /** 切到后台时长 */
    public static hideTime: number = 0;

    /** 分享回调 */
    public static shareFunc: Function = null;

    /** 是否已登陆 */
    public static isLogin: boolean = false;

    /** onShowRes */
    public static onShowRes: any = {};

    /** 是否已授权 */
    public static authorizeInfo: any = {};

    /** 登录动作队列 */
    public static loginCallBackList: Array<Function> = [];

    /** 登录码，-1：没登录过，0：登录失败，1：登录成功 */
    public static loginCode: number = -1;

    /** 游戏圈 */
    public static gameClub: any = null;

    /** 分享模板 */
    public static shareTemplate: any = null;

    /** 分享开关 */
    public static shareSwitch: any = null;

    /** 是否正在视频 */
    public static isVideo: boolean = false;

    /** onShowFuncList */
    public static onShowFuncList: Array<Function> = [];

    /** onHideFuncList */
    public static onHideFuncList: Object = {};

    /** 正在获取分享模板 */
    public static isGetShareTemplate: boolean = false;

    /** 注册登录后执行事件 */
    public static afterLoginCallBackList: Array<Function> = [];

    /** banner广告 */
    public static bannerAd: BannerAd = null;

    /** 请求队列 */
    public static reqList = [];

    /** 震动次数，每0.2秒内只能震动一次 */
    public static vibrateNum: number = 0;

    /** 初始化 */
    public static init(onShowCallBack, onHideCallback){
        /** 获取设备信息 */
        // let systemInfo = cc.gam;
        // //console.log("[hd_sdk_Android]----->设备信息 ", systemInfo);
        let systemInfo = JsBridge.getDevicesInfo();
        //console.log('[hd_sdk_android]------->设备信息', systemInfo);
        
        this.rigisterOnStartEvent();

        this.rigisterOnShowEvent(onShowCallBack);

        this.rigisterOnHideEvent(onHideCallback);

        /** 注册事件监听 */
        // EventManager.on('open-share', this.share, this);
        /** 注册事件监听 */
        EventManager.on('login-req', (data) => this._silenceLogin(data.success), this);

        /** 0.2秒只允许震动一次 */
        setInterval(() => {
            this.vibrateNum = 0;
        }, 200);
    }

    public static rigisterOnStartEvent(){
        cc.game.on(cc.game.EVENT_GAME_INITED, (res) => {
            //console.log('[hd_sdk_Android]----->EVENT_GAME_INITED', res)
            /** 初始化JSB */
            JsBridge.init();

            /** 执行一次onShow */
            this.onShowCallBack(res);
        });
    }

    public static rigisterOnShowEvent(cb: Function){
        cc.game.on(cc.game.EVENT_SHOW, (res) => {
            this.onShowCallBack(res);
            cb && cb(res);
        });
    }

    public static rigisterOnHideEvent(cb: Function){
        cc.game.on(cc.game.EVENT_HIDE, (res) => {
            this.onHideCallBack();
            cb && cb(res);
        });
    }

    /** onShow */
    public static onShowCallBack(res){
        //console.log('[hd_sdk_Android]----->onshow', res)

        /** onShowRes */
        // //console.log('[hd_sdk_Android]------>onShowCallBack', res);
        // this.onShowRes = res;

        // //** 小游戏跳转信息 */
        // let refInfo = res.referrerInfo;
        // if(refInfo){
        //     /** 附带信息 */
        //     // let extraData = refInfo.extraData;
        //     let fromAppId = refInfo.appId;
        //     /** 上报打点 */
        //     if(fromAppId){
        //         // HD_MODULE.getNet().postDSPCounter({from_app_id: app_id, version: appConfig.app_version});
        //         //console.log('[hd_sdk_Android]----->开始上报交叉推广,从' + fromAppId + "跳入");
        //         HD_MODULE.getNet().postDSPIn({from_app_id: fromAppId}, () => {
        //             //console.log('[hd_sdk_Android]----->上报交叉推广成功,从' + fromAppId + "跳入");
        //         });
        //     }
        // }

        // /** 获取分享开关 */
        // if(!this.shareSwitch){
        //     HD_MODULE.getNet().getShareSwitch({version: appConfig.app_version}).then((res) => {
        //         //console.log('[hd_sdk_Android]----->获取分享开关', res.data.switch);
        //         this.shareSwitch = res.data.switch;
        //     });
        // }

        // /** 清除切后台计时器 */
        // if(this.shareFunc){
        //     if((Date.now() - this.hideTime) >= shareSuccess * 1000){
        //         this.shareFunc(0);
        //     }else{
        //         this.shareFunc(-1);
        //     }
        // }

        // this.shareFunc = null;

        // this.updateNotityEvent('onshow');

        // this.checkQueryEvent();

        // EventManager.emit('game-onshow', {res: res});
    }

    /** onHide */
    public static onHideCallBack(){
        //console.log('[hd_sdk_Android]----->onhide')
        this.hideTime = Date.now();
        this.updateNotityEvent('onhide');
        EventManager.emit('game-onhide');
    }

    /** 登陆成功回调 */
    public static loginCallBack(res){
        if(this.isLogin) return;
        //console.log('[hd_sdk_Android]----------------->登录成功');
        this.isLogin = true;

        runFuncFormArray(this.loginCallBackList);
        runFuncFormArray(this.afterLoginCallBackList);

        /** 发射小游戏登录成功事件 */
        EventManager.emit('game-login');
    }

    /** 分享 */
    public static share(data: wx.types.ShareOption){
        /** 分享类型 */
        let channel             = data.channel || 'article';
        /** 标题 */
        let title               = data.title || '';
        /** 分享图 */
        let imageUrl            = data.imageUrl || "https://cdn-hdgames.9377.com/gameres/t1/p2/release/wechat/1.0.0/shareTemplates/res/share_0.jpg";//cc.url.raw('Texture/start/logo' + "?a=a.jpg");
        /** 分享出去的数据 */
        let query               = data.query || '';
        /** 附加信息 */
        let extra               = data.extra || undefined;
        /** 当前分享场景 */
        let scene               = data ? data.scene : 'not define scene!';
        /** 分享卡片事件 */
        let cardEvent           = data.cardEvent;

        /** 分享回调, code: 0为成功，-1为失败 */
        this.shareFunc = (code: number) => {
            if(code == 0){
                if(data.success)
                    data.success();
                HD_MODULE.getNet().postGameEvent({event_name: '分享成功' + scene, counter: 1});
            }else if(code == -1){
                this.showAlert("提示", "分享失败", "确定");
                HD_MODULE.getNet().postGameEvent({event_name: '分享失败' + scene, counter: 1});
            }
        };

        /** 不是微信环境，直接退出分享 */
        if(cc.sys.platform != cc.sys.WECHAT_GAME){
            if(this.shareFunc)
                this.shareFunc(0);
            return;
        }

        let cardEventStr = '&' + cardEvent + "=1";
        let openId = HD_MODULE.getPlatform().getOpenId() || "";
        let shareMsg = {
            // channel: channel,
            title: title,
            imageUrl: imageUrl,
            query: query + '&openId=' + openId + '&share=' + scene + (cardEventStr || ""),
            extra: extra,
        }
        //console.log('[hd_sdk_Android]----->分享', imageUrl, shareMsg);
        this._shareAppMessage(shareMsg);
    }

    /** 是否通过某分享卡片进来 */
    public static getIsGameLauchByShareCard(cardEventFlag: string){
        let bool = false;
        if(this.onShowRes && this.onShowRes.query){
            bool = this.onShowRes.query[cardEventFlag];
        }
        return bool;
    }

    /** 
     * 微信提示框 没有 cancelText 则只显示一个按钮
    */
   public static showAlert(title: string, content: string, okText: string = "确定", cancelText: string = ""){
        // let showCancel = Boolean(cancelText);
        // let tipsData = {
        //     title: title,
        //     content: content,
        //     showCancel: showCancel,
        //     confirmText: okText,
        //     cancelText: cancelText
        // }
        // wx.showModal(tipsData);

    }

    /** 获取用户数据,没授权则询问授权 */
    public static getUserInfo(success: Function, noAuth?: boolean){
        if(this.userInfo){
            if(success){
                //console.log('[hd_sdk_Android]----->获取用户信息', this.userInfo);
                success(this.userInfo);
            }
        }else{
            this._login(success, null, noAuth);
        }
    }

    /**
	 * 静默登录
	 */
	private static _silenceLogin(success: Function = () => {}, fail: Function = () => {}){
        // if(this.loginCode != 0){
        //     this.loginCallBackList.push(success);
        //     if(this.loginCallBackList.length > 1) return;
        // }

        // /** 重连 */
        // let reconnect = () => {
        //     //console.log('[hd_sdk_Android]------>静默登录失败');
        //     let reconnectTimerID = null;
        //     let reconnectCount = 5;
        //     reconnectTimerID = setInterval(() => {
        //         //console.log('[hd_sdk_Android]------>', reconnectCount, '秒后尝试重连');
        //         reconnectCount--;
        //         if(reconnectCount == 0) this._silenceLogin(() => {clearInterval(reconnectTimerID);}, () => {reconnect()});
        //     }, 1000);
        // }

        success && success();

		// wx.login({
        //     success: (res) => {
        //         if (res.code) {
        //             //console.log("[hd_sdk_Android]------>静默登录:", res);
        //             let codeRes = res;
        //             HDDefaultUserInfo.code = codeRes.code;
        //             if(!HD_MODULE.getPlatform().getToken()){
        //                 //console.log("[hd_sdk_Android]------>本地token为空或者已过期,重新登录小游戏服务器:");
        //                 let params = {
        //                     platform_id: appConfig.platform_id,
        //                     app_id: appConfig.app_id,
        //                     user_info: HDDefaultUserInfo
        //                 }
        //                 HD_MODULE.getNet().postMiniGameLogin(params, (res) => {
        //                     //console.log('[hd_sdk_Android]------>登录小游戏服务器', res);
        //                     let token = res.data.token;
        //                     HD_MODULE.getPlatform().setToken(token);
        //                     localStorage.setItem("token" + appConfig.platform_id + appConfig.env, token);
        //                     this.loginCode = 1;
        //                     this.loginCallBack(res);
        //                 }, (err) => {
        //                     console.error('[hd_sdk_Android]------>登录小游戏服务器失败', err);
        //                     this.loginCode = 0;
        //                     if(fail)
        //                         fail(err);
        //                 });
        //             }else{
        //                 this.loginCallBack(res);
        //             }
        //         }else {
        //         }
        //     },
        //     fail: () => {
        //     }
        // });
	}

	/**
	 * 大授权登录
     * @param success 成功回调
     * @param fail 失败回调
     * @param noAuth 如果未授权时，noAuth=true，则<不>弹出授权窗，否则弹授权窗
	 */
	private static _login(success: Function, fail?: Function, noAuth?: boolean){
		// wx.login({
        //     success: (res) => {
        //         if (res.code) {
		// 			let codeRes = res;
        //             //console.log("[hd_sdk_Android]------>大授权登录:", res);
        //             let updateUserInfo = (res) => {
        //                 this.userInfo = res.userInfo;
        //                 //console.log(`[hd_sdk_Android]------>获取用户信息`, this.userInfo);
        //                 {
        //                     HDDefaultUserInfo.avatar_url = this.userInfo.avatarUrl;
        //                     HDDefaultUserInfo.city = this.userInfo.city;
        //                     HDDefaultUserInfo.code = codeRes.code;
        //                     HDDefaultUserInfo.country = this.userInfo.country;
        //                     HDDefaultUserInfo.gender = this.userInfo.gender;
        //                     HDDefaultUserInfo.nick_name = this.userInfo.nickName;
        //                     HDDefaultUserInfo.province = this.userInfo.province;
        //                 }
        //                 this.userInfo = HDDefaultUserInfo;
        //                 let params = {
        //                     platform_id: appConfig.platform_id,
        //                     app_id: appConfig.app_id,
        //                     user_info: this.userInfo
        //                 }
        //                 HD_MODULE.getNet().postMiniGameLogin(params);
        //                 success(this.userInfo)
        //             }

        //             let btnLogin = () => {
        //                 //console.log("[hd_sdk_Android]------>创建按钮授权");
        //                 var screenSize = cc.view.getVisibleSize();
        //                 let wxSysInfo = wx.getSystemInfoSync()
        //                 var widthRate = wxSysInfo.screenWidth / screenSize.width;
        //                 var heightRate = wxSysInfo.screenHeight / screenSize.height;
        //                 var btn = wx.createUserInfoButton({
        //                     type: "text",
        //                     text: '获取',
        //                     style: {
        //                         left: (wxSysInfo.screenWidth / 2 - 300 * widthRate / 2),
        //                         top: (wxSysInfo.screenHeight / 2 - 250 * heightRate / 2),
        //                         width: 300 * widthRate,
        //                         height: 250 * heightRate,
        //                         lineHeight: 40,
        //                         backgroundColor: '#ff0000',
        //                         fontSize: 16,
        //                         borderRadius: 10
        //                     } as any,
        //                     withCredentials: true,
        //                     lang: "zh_CN"
        //                 });

        //                 var isWaiting = false;

        //                 btn.onTap((userInfo) => {
        //                     if (isWaiting) {
        //                         console.info("waiting for update");
        //                         if (fail) fail("waiting");
        //                         return;
        //                     }

        //                     if(userInfo.errMsg != "getUserInfo:ok"){
        //                         fail(userInfo);
        //                     }else{
        //                         (btn as any).destroy();
        //                         updateUserInfo(userInfo)
        //                     }
        //                 })
        //             }
                    
        //             wx.getSetting({
        //                 success: (res) => {
        //                     //console.log('[hd_sdk_Android]----->获取授权信息', res);
        //                     this.authorizeInfo = res;
        //                     let isAuthorize = res.authSetting['scope.userInfo'];
        //                     if(!isAuthorize){//是否已授权，未授权则按钮授权
        //                         if(!noAuth)
        //                             btnLogin();
        //                         else
        //                             success(HDDefaultUserInfo);
        //                     }else{
        //                         wx.getUserInfo({
        //                             success: (userInfo) => {
        //                                 updateUserInfo(userInfo)
        //                             }
        //                         });
        //                     }
        //                 }
        //             });
        //         }else {
        //             console.error("[hd_sdk_Android]------>微信登录失败:", res);
        //         }
        //     },
        // });
    }
    
    private static _shareAppMessage(data: wx.types.ShareOption) {
        wx.shareAppMessage(data);
    }
    
    static getIsLogin(){
        return this.isLogin;
    }

    /**
     * 
     * @param data 初始化右上角转发
     */
    public static setShareAppMsg(data: wx.types.ShareOption){
        let title           = data.title;
        let imageUrl        = data.imageUrl;
        let query           = data.query;

        wx.onShareAppMessage(()=> {
            HD_MODULE.getNet().postGameEvent({event_name: '分享成功' + '右上角', counter: 1});
            return {
                title: title,
                imageUrl: imageUrl,
                query: query + '&share=' + '右上角',
            };
        });
    }

    /**
     * 小游戏跳转
     */
    public static navigateToMiniProgram(data: wx.types.navigateToMiniProgramParam){
        wx.navigateToMiniProgram(data);
    }

    /** 客服 */
    public static openCustomerServiceConversation(data: wx.types.CustomParam){
        wx.openCustomerServiceConversation(data);
    }

    /** 获取分享模板 */
    private static getShareTemplate(success?: Function){
        // let sucList = [];
        // this.reqList = [];
        this.reqList.push(success);
        if(this.reqList.length > 1){
            return;
        }
        if(!this.shareTemplate){
            // if(!this.isGetShareTemplate){
                // this.isGetShareTemplate = true;

                HD_MODULE.getNet().getShareTemplate({version: appConfig.app_version}).then((res) => {
                    //console.log('[hd_sdk_Android]----->获取分享模板', res);
                    this.shareTemplate = res.data.share;
                    if(success)
                        success(res);
                    runFuncFormArray(this.reqList, res);
                });

                // cc.loader.load(shareTemplate.configUrl, (err, res) => {
                //     if(err){
                //         this.isGetShareTemplate = false;
                //         return;
                //     }
                //     this.isGetShareTemplate = false;
                //     //console.log('[hd_sdk_Android]----->获取分享模板', res);
                //     this.shareTemplate = res;
                //     if(success)
                //         success(res);
                //     runFuncFormArray(sucList, res);
                //     // while(sucList.length > 0){
                //     //     sucList.pop()(res);
                //     // }
                // });
            // }
            // else{
            //     sucList.push(success);
            // }
        }else{
            runFuncFormArray(this.reqList, this.shareTemplate);

            // if(success)
            //     success(WeChat.shareTemplate);
        }
    }

    /** 根据类型随机获取分享 */
    public static getOneShareInfoByType(type: string, success: Function){
        let info = null;
        // //console.log()
        if(this.shareTemplate){
            let shareArr = this.shareTemplate[type];
            if(shareArr){
                let rand = Math.floor(Math.random() * shareArr.length);
                info = shareArr[rand];
                if(success)
                    success(info);
            }
        }else{
            this.getShareTemplate((res) => {
                if(!res) return;
                let shareArr = res[type];
                if(shareArr){
                    let rand = Math.floor(Math.random() * shareArr.length);
                    info = shareArr[rand];
                    if(success)
                        success(info);
                }
            });
        }
    }

    /** 拉起分享,素材随机 */
    public static openShareByShareTemplateRand(type: string, data?: wx.types.ShareOption){
        this.getOneShareInfoByType(type, (shareInfo) => {
            if(shareInfo){
                let shareData = {
                    title: shareInfo.title,
                    imageUrl: shareInfo.image_url,
                    scene: data ? data.scene : "default scene",
                    success: data ? data.success : null,
                    fail: data ? data.fail: null,
                    cardEvent: data ? data.cardEvent : null,
                }
                this.share(shareData);
                //console.log('[hd_sdk_Android]----------------->随机素材分享', shareData)
            }
        });
    }

    /** 获取启动参数 */
    static getOnShowRes(){
        return this.onShowRes;
    }

    /** 激励视频 */
    // static showVideo(videoId: string, success: () => {}, fail: (res) => {}){
    //     if(!this.isVideo){
    //         // this.isVideo = true;
    //         // let video = wx.createRewardedVideoAd({
    //         //     adUnitId: videoId
    //         // });
    //         // if(!video) return;
    //         // video.load().then(() => {
    //         //     video.show();
    //         //     cc.audioEngine.pauseAll();
    //         // }).catch(() => {
    //         //     this.isVideo = false;
    //         // });
    
    //         // let onClose = (res: {isEnded: boolean}) => {
    //         //     if ((res && res.isEnded) || res == undefined) {
    //         //         //console.log('[hd_sdk_Android]----->视频正常播放结束');
    //         //         EventManager.emit('video-success');
    //         //         if(success) success();
    //         //     } else {
    //         //         //console.log('[hd_sdk_Android]----->视频中途播放结束或视频错误');
    //         //         if(fail) fail(res);
    //         //     }
    //         //     cc.audioEngine.resumeAll();
    //         //     video.offClose(onClose);
    //         //     this.isVideo = false;
    //         // }
    //         // video.onClose(onClose);
    //         // video.onError((res) => {
    //         //     if(fail) fail(res);
    //         //     this.isVideo = false;
    //         // });
    //     }
    // }

    /** banner广告 */
    static showBanner(bannerId: string): Promise<any>{
        return new Promise((sucf, errf) => {
            let { screenWidth, screenHeight } = wx.getSystemInfoSync();
            if(this.bannerAd){
                if(this.bannerAd.adUnitId == bannerId){
                    this.bannerAd.show().then(() => {sucf && sucf()}).catch(() => {errf && errf()});
                    return;
                }else{
                    this.bannerAd.destroy();
                }
            }
            this.bannerAd = wx.createBannerAd({
                adUnitId: bannerId,
                adIntervals: 30,
                style: {
                    left: 0,
                    // left: (screenWidth - screenWidth * 0.80) / 2,
                    top: screenHeight - 88,
                    width: screenWidth,
                    // left: 0,
                    // top: screenHeight,
                    // width: screenWidth,
                    // height: 200
                }
            })
            this.bannerAd.show()
                .catch(err => {
                    //console.log("拉起失败");
                    errf && errf();
                })
                .then(() => {
                    //console.log("拉起成功");
                    sucf && sucf();
                })
    
            this.bannerAd.onResize(res => {
                this.bannerAd.style.top = screenHeight - res.height;
                this.bannerAd.style.height = res.height;
            })
            this.bannerAd.onError(() => {});
        });
    }

    static hideBanner(): Promise<any>{
        return new Promise((sucf, errf) => {
            if(this.bannerAd)
                this.bannerAd.hide();
            sucf && sucf();
        });
    }

    static notifyOnShowEvent(onShowCallBack: Function){
        this.onShowFuncList.push(onShowCallBack);
    }

    static notifyOnHideEvent(onHideCallBack: Function){
        this.onShowFuncList.push(onHideCallBack);
    }

    static updateNotityEvent(type: 'onshow' | 'onhide'){
        switch(type){
            case 'onshow': {
                let funListTemp = [];
                for(let i in this.onShowFuncList){
                    this.onShowFuncList[i](this.onShowRes);
                    funListTemp.push(this.onShowFuncList[i]);
                }
                this.onShowFuncList = funListTemp;
                break;
            }
            case 'onhide': {
                let funListTemp = [];
                for(let i in this.onHideFuncList){
                    this.onHideFuncList[i]();
                    funListTemp.push(this.onHideFuncList[i]);
                }
                this.onHideFuncList = funListTemp;
                break;
            }
        }
    }

    static checkQueryEvent(){
        if(!this.onShowRes) return;
        let res = this.onShowRes;
        let query = res.query || {};

        /** 分享进来打点 */
        if(query['share']){
            HD_MODULE.getNet().postGameEvent({event_name: 'shareIn' + res.scene + query['share'], counter: 1});
        }
    }

    /** 短震 */
    static vibrateShort(): Promise<any>{
        return new Promise((sucf, errf) => {
            if(this.vibrateNum > 0) return;
            this.vibrateNum++;
            JsBridge.vibrateShort();
        });
    }

    /** 设置默认右上角分享 */
    static setDefaultRightTopShare(){
        this.getOneShareInfoByType('common', (shareInfo) => {
            if(shareInfo){
                let title           = shareInfo.title;
                let imageUrl        = shareInfo.image_url;
                let query           = shareInfo.query;
                let shareMsg = {
                    title: title,
                    imageUrl: imageUrl,
                    query: query
                }
                this.setShareAppMsg(shareMsg);
            }
        });
    }

    /** 节点判断是否是诱导分享，是则节点隐藏，否则原先咋样就咋样 */
    static checkIsRewardShare(node: cc.Node){
        if(!node || ((node instanceof cc.Node) == false)){
            return;
        }
        if(this.shareSwitch){
            let actice = Number(this.shareSwitch.share || 0);
            node.active = node.active && !!actice;
        }
    }

    /** 获取本地用户信息(大授权后信息会保存到本地) */
    static getLocalUserInfo(){
        return HDDefaultUserInfo;
    }

    /** 注册登陆后执行的动作，如果未登录，则登录时执行，如果注册该方法时已经登录了，则立即执行 */
    static rigisterEventAfterLogin(cb: () => any){
        this.isLogin ? cb() : this.afterLoginCallBackList.push(cb);
    }
}
