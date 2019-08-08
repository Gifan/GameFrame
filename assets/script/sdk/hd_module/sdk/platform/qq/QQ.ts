import { HDDefaultUserInfo, appConfig, videoIdList } from "../../../config/AppConfig";
import { HD_MODULE } from "../../../hd_module";
import Base64 = require('../../../utils/base64.js');
import BaseProtocol from "../../../net/protocol/baseprotocol";
import { Manager } from "../../../../../manager/Manager";
import { GameVoManager } from "../../../../../manager/GameVoManager";

let shareSuccess = 2.5; //默认切后台多少秒后视为成功分享
const qq = window["qq"];
const wx = window["wx"];
let runFuncFormArray = (funcList: Array<Function>, param?: any) => {
    if (funcList) {
        while (funcList.length > 0) {
            let func = funcList.pop();
            if (func)
                func(param);
        }
    }
}

/**
 * SDK接入, QQ信息注册
 */
export default class QQ {
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

    /** onHideRes */
    public static onHideRes: any = {};

    /** 是否已授权 */
    public static authorizeInfo: any = {};

    /** 登录动作队列 */
    public static loginCallBackList: Array<Function> = [];

    /**登录序列 */
    public static loginFailCallBackList: Array<Function> = [];

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

    /** 激励视频 */
    public static videoAd: any = null;

    /** 激励视频是否已被加载过 */
    public static isLoadVideo: boolean = true;

    /** onShowFuncList */
    public static onShowFuncList: Function[] = [];

    /** onHideFuncList */
    public static onHideFuncList: Function[] = [];

    /** 注册登录后执行事件 */
    public static afterLoginCallBackList: Array<Function> = [];

    /** banner广告 */
    public static bannerAd: BannerAd = null;

    /**渠道码 */
    public static channel_code: string = "";

    public static isHaveVideo: boolean = true;

    public static userInfoBtn = null;

    /** 初始化 */
    public static init() {
        /** 开启右上角转发 */
        qq.showShareMenu({
            showShareItems: ['qq', 'qzone']
        });

        /** 静默登录 */
        // if (!QQ.isLogin) {
        //     QQ._silenceLogin(
        //         (res) => {
        //             // QQ.loginCallBack(res);
        //         },
        //         (err) => {
        //             // QQ.loginFailCallBack(err);
        //         }
        //     );
        // }
        // this.showVideo(videoIdList[1][0], null, null, false);
        /** SDK初始化 */
        qq.onShow((res) => {
			QQ.onShowCallBack(res);
		});

		qq.onHide((res) => {
			QQ.onHideCallBack(res);
		});
    }

    /** onShow */
    public static onShowCallBack(res) {
        /** onShowRes */
        // console.log('[hd_sdk_QQ]------>onShowCallBack', res);
        QQ.onShowRes = res;

        if (res.query.openId) {
            QQ.getUserInfo((userInfo) => {
                HD_MODULE.getNet().postInvitation({
                    inviter_open_id: res.query.openId,
                    mark: userInfo.avatar_url
                }, () => {
                    //console.log("=====邀请进入成功====", res.query.openId, userInfo);
                }, (err) => {
                    //console.log("=====邀请进入失败====", err);
                })
            }, () => {
                //console.log("==授权失败==")
            })
        }

        if (res.query.channel_code) {
            QQ.channel_code = res.query.channel_code;
        }
        //** 小游戏跳转信息 */
        let refInfo = res.referrerInfo;
        if (refInfo) {
            /** 附带信息 */
            let extraData = refInfo.extraData;
            let fromAppId = refInfo.appId;
            if (extraData && extraData.channel_code) {
                QQ.channel_code = extraData.channel_code;
            }
            /** 上报打点 */
            if (fromAppId) {
                // HD_MODULE.getNet().postDSPCounter({from_app_id: app_id, version: appConfig.app_version});
                HD_MODULE.getNet().postDSPIn({ from_app_id: fromAppId });
            }
        }
        /** 获取分享模板 */
        QQ.getShareTemplate(appConfig.app_version);

        /** 清除切后台计时器 */
        if (QQ.shareFunc) {
            if ((Date.now() - QQ.hideTime) >= shareSuccess * 1000) {
                QQ.shareFunc(0);
            } else {
                QQ.shareFunc(-1);
            }
        }
        QQ.shareFunc = null;

        QQ.updateNotityEvent('onshow');

        QQ.checkQueryEvent();

    }

    /** onHide */
    public static onHideCallBack(res) {
        QQ.onHideRes = res;
        // console.log("onHideCallBack")
        QQ.hideTime = Date.now();
        QQ.updateNotityEvent('onhide');
    }

    /** 登陆成功回调 */
    public static loginCallBack(res) {
        // if (QQ.isLogin) return;
        // console.log('[hd_sdk_QQ]----------------->登录成功');
        QQ.isLogin = true;

        runFuncFormArray(this.loginCallBackList, res);
        runFuncFormArray(this.afterLoginCallBackList, res);

        // this.showVideo(videoIdList[1][0], null, null, false);

    }

    public static loginFailCallBack(res) {
        while (this.loginFailCallBackList.length > 0) {
            (this.loginFailCallBackList.pop())(res);
        }
    }

    /** 分享 */
    public static share(data: any) {
        /** 分享类型 */
        let channel = data.channel || 'article';
        /** 标题 */
        let title = data.title || '';
        /** 分享图 */
        let imageUrl = data.imageUrl || "https://cdn.heidong.fun/gameres/t3/p1/release/wechat/1.0.0/shareTemplates/res/share.jpg";//cc.url.raw('Texture/start/logo' + "?a=a.jpg");
        /** 分享出去的数据 */
        let query = data.query || '';
        /** 附加信息 */
        let extra = data.extra || undefined;
        /** 当前分享场景 */
        let scene = data.scene || '未定义场景';

        /** 分享回调, code: 0为成功，-1为失败 */
        QQ.shareFunc = (code: number) => {
            if (code == 0) {
                if (data.success)
                    data.success();
                HD_MODULE.getNet().postGameEvent({ event_name: '分享成功' + scene, counter: 1 });
            } else if (code == -1) {
                if (data.fail) {
                    data.fail()
                }
                QQ.showWxTips("提示", "请分享不同群获得奖励", "确定");
                HD_MODULE.getNet().postGameEvent({ event_name: '分享失败' + scene, counter: 1 });
            }
        };

        /** 不是微信环境，直接退出分享 */
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            if (QQ.shareFunc)
                QQ.shareFunc(0);
            return;
        }

        // console.log('[hd_sdk_QQ]----->分享', imageUrl)

        let shareMsg = {
            // channel: channel,
            title: title,
            imageUrl: imageUrl,
            query: query + '&share=' + scene + "&openId=" + HD_MODULE.getPlatform().getOpenId(),
            extra: extra,
            ald_desc: scene,
        }
        this._shareAppMessage(shareMsg);
    }

    /** 
     * 微信提示框 没有 cancelText 则只显示一个按钮
    */
    public static showWxTips(title: string, content: string, okText: string = "确定", cancelText: string = "", success?: (res: { confirm?: boolean, canel?: boolean }) => any) {
        let showCancel = Boolean(cancelText);
        let tipsData = {
            title: title,
            content: content,
            showCancel: showCancel,
            confirmText: okText,
            cancelText: cancelText,
            success: success
        }
        // console.log('[hd_sdk_QQ]----->showTips', tipsData)
        qq.showModal(tipsData);
    }

    /** 获取用户数据,没授权则询问授权 */
    public static getUserInfo(success: Function, fail?: Function, type = 1) {
        if (this.userInfo) {
            if (success && type == 1) {
                // console.log('[hd_sdk_QQ]----->获取用户信息', this.userInfo);
                success(this.userInfo);
            }
        } else {
            this._login(success, fail, type);
        }
    }

    public static login(): Promise<any> {
        return new Promise((resolve, reject) => {
            qq.login({
                success: (res) => {
                    if (res.code) {
                        let codeRes = res;
                        HDDefaultUserInfo.code = codeRes.code;
                        let params = {
                            platform_id: appConfig.platform_id,
                            app_id: appConfig.app_id,
                            user_info: HDDefaultUserInfo,
                            channel_code: QQ.channel_code
                        }
                        HD_MODULE.getNet().postMiniGameLogin(params, (res) => {
                            let token = res.data.token;
                            HD_MODULE.getPlatform().setToken(token);
                            QQ.loginCode = 1;
                            QQ.isLogin = true;
                            let decode = res.data.token.split('.');
                            let info = JSON.parse(Base64.Base64.decode(decode[1]));
                            if (res.data.token && QQ.channel_code) {
                                if (info.new_user) {
                                    QQ.countAgain = 3;
                                    QQ.confirmAgainDelay();
                                }
                            };
                            resolve();
                        }, (err) => {
                            QQ.loginCode = 0;
                            reject();
                        });
                    } else {
                        reject();
                    }
                },
                fail: (err) => {
                    reject();
                }
            });
        });
    }

    /**
	 * 静默登录
	 */
    private static _silenceLogin(success: Function = () => { }, fail: Function = () => { }) {
        // console.log('[登录队列0]', QQ.loginCode, QQ.loginCode != 0, QQ.loginCallBackList.length)
        QQ.loginFailCallBackList.push(fail);
        if (QQ.loginCode != 0) {
            QQ.loginCallBackList.push(success);
            // console.log('[登录队列1]', QQ.loginCallBackList.length, QQ.loginFailCallBackList.length)
            if (QQ.loginCallBackList.length > 1) {
                return;
            }
        }
        qq.login({
            success: (res) => {
                if (res.code) {
                    // console.log("[hd_sdk_QQ]------>静默登录:", res);
                    let codeRes = res;
                    HDDefaultUserInfo.code = codeRes.code;
                    if (!HD_MODULE.getPlatform().getToken()) {
                        // console.log("[hd_sdk_QQ]------>本地token为空或者已过期,重新登录小游戏服务器:");
                        let params = {
                            platform_id: appConfig.platform_id,
                            app_id: appConfig.app_id,
                            user_info: HDDefaultUserInfo,
                            channel_code: QQ.channel_code
                        }
                        HD_MODULE.getNet().postMiniGameLogin(params, (res) => {
                            // console.log('[hd_sdk_QQ]------>登录小游戏服务器', res, QQ.loginCallBackList.length);
                            let token = res.data.token;
                            HD_MODULE.getPlatform().setToken(token);
                            localStorage.setItem("token" + appConfig.platform_id + appConfig.env, token);
                            QQ.loginCode = 1;
                            QQ.loginCallBack(res);
                            let decode = res.data.token.split('.');
                            let info = JSON.parse(Base64.Base64.decode(decode[1]));
                            // console.error(info.new_user, QQ.channel_code)
                            if (res.data.token && QQ.channel_code) {
                                if (info.new_user) {
                                    QQ.countAgain = 3;
                                    QQ.confirmAgainDelay();
                                }
                            }
                        }, (err) => {
                            // console.log('[hd_sdk_QQ]------>登录小游戏服务器失败', err, QQ.loginCallBackList.length);
                            QQ.loginCode = 0;
                            QQ.loginFailCallBack(err);
                        });
                    } else {
                        // console.log("token exits", res, QQ.loginCallBackList.length);
                        QQ.loginCallBack(res);
                    }
                } else {
                    QQ.loginCallBackList = [];
                    QQ.loginFailCallBack(res);
                }
            },
            fail: (err) => {
                // fail();
                QQ.loginFailCallBack(err);
                QQ.loginCallBackList = [];
            }
        });
    }

	/**
	 * 大授权登录
	 */
    private static _login(success: Function, fail?: Function, type: number = 1) {
        // console.log("[hd_sdk_QQ]------>大授权登录:", res);
        let updateUserInfo = (res) => {
            QQ.userInfo = res.userInfo;
            // console.log(`[hd_sdk_QQ]------>获取用户信息`, QQ.userInfo);
            GameVoManager.getInstance.myUserVo.isAuthorize = 1;
            {
                HDDefaultUserInfo.avatar_url = QQ.userInfo.avatarUrl;
                HDDefaultUserInfo.city = QQ.userInfo.city;
                // HDDefaultUserInfo.code = codeRes.code;
                HDDefaultUserInfo.country = QQ.userInfo.country;
                HDDefaultUserInfo.gender = QQ.userInfo.gender;
                HDDefaultUserInfo.nick_name = QQ.userInfo.nickName;
                HDDefaultUserInfo.province = QQ.userInfo.province;
                GameVoManager.getInstance.myUserVo.nickName = QQ.userInfo.nickName;
                GameVoManager.getInstance.myUserVo.avatarUrl = QQ.userInfo.avatarUrl;
            }
            QQ.userInfo = HDDefaultUserInfo;
            let params = {
                platform_id: appConfig.platform_id,
                app_id: appConfig.app_id,
                user_info: QQ.userInfo
            }
            // HD_MODULE.getNet().postMiniGameLogin(params);
            success(QQ.userInfo)
        }

        let btnLogin = () => {
            // console.log("[hd_sdk_QQ]------>创建按钮授权");
            var screenSize = cc.view.getVisibleSize();
            let wxSysInfo = qq.getSystemInfoSync()
            var widthRate = wxSysInfo.screenWidth / screenSize.width;
            var heightRate = wxSysInfo.screenHeight / screenSize.height;
            var btn = qq.createUserInfoButton({
                type: "image",
                // text: '获取',
                image: type == 1 ? "https://cdn.heidong.fun/gameres/t3/p1/release/wechat/loginBtn.png" : "https://cdn.heidong.fun/gameres/t3/p1/release/wechat/loginBtn_2.png",
                style: {
                    left: type == 1 ? (wxSysInfo.screenWidth / 2 - 720 * widthRate / 2) : 77 * widthRate - 100 * widthRate / 2,
                    top: type == 1 ? (wxSysInfo.screenHeight / 2 - 1280 * heightRate / 2) : wxSysInfo.screenHeight / 2 - 100,
                    width: type == 1 ? 720 * widthRate : 60,
                    height: type == 1 ? 1280 * heightRate : 55,
                    lineHeight: 40,
                    backgroundColor: '#ff0000',
                    fontSize: 16,
                    borderRadius: 10
                } as any,
                withCredentials: true,
                lang: "zh_CN"
            });
            if (type == 2) {
                QQ.userInfoBtn = btn;
            }
            var isWaiting = false;

            btn.onTap((userInfo) => {
                if (isWaiting) {
                    // console.info("waiting for update");
                    if (fail) fail("waiting");
                    return;
                }

                if (userInfo.errMsg != "getUserInfo:ok") {
                    fail(userInfo);
                } else {
                    (btn as any).destroy();
                    updateUserInfo(userInfo)
                }
            })
        }

        qq.getSetting({
            success: (res) => {
                // console.log('[hd_sdk_QQ]----->获取授权信息', res);
                this.authorizeInfo = res;
                let isAuthorize = res.authSetting['scope.userInfo'];
                if (!isAuthorize || !GameVoManager.getInstance.myUserVo.isAuthorize) {//是否已授权，未授权则按钮授权
                    btnLogin();
                } else {
                    qq.getUserInfo({
                        success: (userInfo) => {
                            if (type == 1) {
                                updateUserInfo(userInfo)
                            }
                        }
                    });
                }
            }
        });

    }

    public static getUserInfoBtn() {
        return QQ.userInfoBtn;
    }

    private static _shareAppMessage(data: any) {
        if (wx.aldShareAppMessage) {
            wx.aldShareAppMessage(data)
        } else {
            qq.shareAppMessage(data);
        }
    }

    static getIsLogin() {
        return this.isLogin;
    }

    /**
     * 
     * @param data 初始化右上角转发
     */
    public static setShareAppMsg(data: any) {
        let title = data.title;
        let imageUrl = data.imageUrl;
        let query = "channel_code=" + data.channel_code;
        qq.onShareAppMessage(function () {
            HD_MODULE.getNet().postGameEvent({ event_name: '分享成功右上角', counter: 1 });
            return {
                title: title,
                imageUrl: imageUrl,
                query: query + '&share=右上角' + "&openId=" + HD_MODULE.getPlatform().getOpenId(),
            };
        });
    }

    /**
     * 小游戏跳转
     */
    public static navigateToMiniProgram(data: any) {
        qq.navigateToMiniProgram(data);
    }

    /** 客服 */
    public static openCustomerServiceConversation(data: any) {
        qq.openCustomerServiceConversation(data);
    }

    /** 获取分享模板 */
    private static getShareTemplate(version: string, success?: Function, fail?: Function) {
        if (!QQ.shareTemplate) {
            BaseProtocol.requestByConfig('shareConfig', { version: version }).then((res) => {
                // console.log("[hd_sdk_QQ]----->获取分享模板", res);
                QQ.shareTemplate = res.data.share;
                if (success)
                    success(QQ.shareTemplate);
            }).catch(err => {
                fail && fail(err);
            });
        } else {
            if (success)
                success(QQ.shareTemplate);
        }
    }

    /** 根据类型随机获取分享 */
    public static getOneShareInfoByType(type: string, success: Function, fail?: Function) {
        let info = null;
        if (QQ.shareTemplate) {
            let shareArr = QQ.shareTemplate[type];
            if (shareArr) {
                let rand = Math.floor(Math.random() * shareArr.length);
                info = shareArr[rand];
                if (success)
                    success(info);
            } else {
                fail && fail();
            }
        } else {
            QQ.getShareTemplate(appConfig.app_version, (res) => {
                if (!res) return;
                let shareArr = res[type];
                if (shareArr) {
                    let rand = Math.floor(Math.random() * shareArr.length);
                    info = shareArr[rand];
                    if (success)
                        success(info);
                }
            }, fail);
        }
    }

    /** 拉起分享,素材随机 */
    public static openShareByShareTemplateRand(type: string, data?: { scene?: string, success?: Function, fail?: Function }) {
        QQ.getOneShareInfoByType(type, (shareInfo) => {
            if (shareInfo) {
                let nquery = shareInfo.channel_code ? "channel_code=" + shareInfo.channel_code : "";
                let shareData = {
                    title: shareInfo.title,
                    imageUrl: shareInfo.image_url,
                    scene: data && data.scene || "分享",
                    success: data && data.success,
                    fail: data && data.fail,
                    query: nquery

                }
                QQ.share(shareData);
            }
        });
    }

    /** 获取启动参数 */
    static getOnShowRes() {
        return this.onShowRes;
    }

    /** 激励视频 */
    static showVideo(videoId: string, success: () => {}, fail: (res) => {}, isShow: boolean = true) {
        if (!QQ.isVideo) {
            QQ.isVideo = true;

            let load = (complate?: Function, err?: Function) => {
                if (!isShow || this.isLoadVideo) {
                    this.isLoadVideo = false;
                    this.videoAd.load().then(() => {
                        this.isLoadVideo = true;
                        this.isHaveVideo = true;
                        //console.log("-------------加载视频成功")
                        complate && complate();
                    }).catch(() => {
                        this.isLoadVideo = true;
                        err && err();
                    });
                }
            }

            let show = () => {
                if (isShow) {
                    this.videoAd.show();
                    cc.audioEngine.pauseAll();
                    Manager.audio.pauseMusic();
                } else {
                    QQ.isVideo = false;
                }
            }

            let suc = () => {
                QQ.isVideo = false;
                // cc.game.resume();
                Manager.audio.resumeMusic();
                cc.audioEngine.resumeAll();
                load();
                success && success();
            }

            let fai = (res) => {
                QQ.isVideo = false;
                // cc.game.resume();
                load();
                fail && fail(res);
            }

            if (!this.videoAd) {
                this.videoAd = qq.createRewardedVideoAd({
                    adUnitId: videoId
                });
                load(() => {
                    show();
                }, () => {
                    fai({ errCode: 0 });
                });
            } else {
                if (this.isLoadVideo)
                    show();
                else {
                    fai(null);
                    // console.log("[hd_sdk_QQ]----->视频还没被加载完，请稍后");
                }
            }
            let onClose = (res: { isEnded: boolean }) => {
                if ((res && res.isEnded) || res == undefined) {
                    // console.log('[hd_sdk_QQ]----->视频正常播放结束');
                    suc();
                } else {
                    console.log('[hd_sdk_QQ]----->视频中途播放结束或视频错误');
                    fai(null);
                }
                this.videoAd.offClose(onClose);
            }
            let error = (err) => {
                //console.log("======视频onError", err);
                if (err && err.errCode && (err.errCode == 1004 || err.errCode == 1005 || err.errCode == 1006 || err.errCode == 1007 || err.errCode == 1008)) {
                    this.isHaveVideo = false;
                }
                fai(err);
                this.videoAd.offError(error);
            }
            this.videoAd.onClose(onClose);
            this.videoAd.onError(error);
        }
    }

    public static getIsHaveVideo(): boolean {
        return this.isHaveVideo;
    }

    /**获取系统信息 */
    static systemInfo(): any {
        return QQ.getSysInfo();
    }

    static notifyOnShowEvent(onShowCallBack: Function) {
        QQ.onShowFuncList.push(onShowCallBack);
    }

    static notifyOnHideEvent(onHideCallBack: Function) {
        QQ.onHideFuncList.push(onHideCallBack);
    }

    static updateNotityEvent(type: 'onshow' | 'onhide') {
        switch (type) {
            case 'onshow': {
                for (let i = 0; i < QQ.onShowFuncList.length; i++) {
                    QQ.onShowFuncList[i](QQ.onShowRes);
                }
                break;
            }
            case 'onhide': {
                for (let i = 0; i < QQ.onHideFuncList.length; i++) {
                    QQ.onHideFuncList[i](QQ.onHideRes);
                }
                break;
            }
        }
    }

    static checkQueryEvent() {
        if (!QQ.onShowRes) return;
        let res = QQ.onShowRes;
        let query = res.query;

        /** 分享进来打点 */
        if (query['share']) {
            HD_MODULE.getNet().postGameEvent({ event_name: 'shareIn' + res.scene + query['share'], counter: 1 });
        }
    }

    static getGameSwitchConfig(): Promise<any> {
        return BaseProtocol.requestByConfig('shareSwitchGet', { version: appConfig.app_version });
    }

    public static showToast(text: string, mask: boolean = false, icon: string) {
        qq.showToast({
            title: text,
            mask: mask,
            icon: icon,
        })
    }
    public static hideToast() {
        qq.hideToast();
    }
    /** 短震 */
    static vibrateShort(success?: () => void, fail?: () => void) {
        qq.vibrateShort({
            success: success,
            fail: fail
        });
    }

    /** 设置默认右上角分享 */
    static setDefaultRightTopShare() {
        QQ.getOneShareInfoByType('common', (shareInfo) => {
            if (shareInfo) {
                let title = shareInfo.title;
                let imageUrl = shareInfo.imageUrl;
                let query = shareInfo.query;
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
    static checkIsOpenShare(node: cc.Node, type: string) {
        if (!node || ((node instanceof cc.Node) == false)) {
            return;
        }
        if (QQ.shareSwitch) {
            let actice = Number(QQ.shareSwitch[type] || 0);
            node.active = node.active && !!actice;
        }
    }

    private static _wxSystemInfo: any;
    static isIphoneX(): boolean {
        if (!QQ._wxSystemInfo) {
            QQ._wxSystemInfo = qq.getSystemInfoSync();
        }
        if (QQ._wxSystemInfo.model.indexOf("iPhone X") != -1 ||
            QQ._wxSystemInfo.model.indexOf("iPhone1") != -1) {
            return true;
        } else return false;
    }

    /** 注册登陆后执行的动作，如果未登录，则登录时执行，如果注册该方法时已经登录了，则立即执行 */
    static rigisterEventAfterLogin(cb: () => any) {
        QQ.isLogin ? cb() : this.afterLoginCallBackList.push(cb);
    }

    /** banner广告 */
    static showBanner(bannerId: string): Promise<any> {
        return new Promise((sucf, errf) => {
            let { screenWidth, screenHeight } = qq.getSystemInfoSync();
            if (this.bannerAd) {
                if (this.bannerAd.adUnitId == bannerId) {
                    this.bannerAd.show().then(() => { sucf && sucf() }).catch(() => { errf && errf() });
                    return;
                } else {
                    this.bannerAd.destroy();
                }
            }
            this.bannerAd = qq.createBannerAd({
                adUnitId: bannerId,
                adIntervals: 30,
                style: {
                    left: 0,
                    top: screenHeight - 88,
                    width: screenWidth,
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
            this.bannerAd.onError(() => { });
        });
    }

    static hideBanner(): Promise<any> {
        return new Promise((sucf, errf) => {
            if (this.bannerAd)
                this.bannerAd.hide();
            sucf && sucf();
        });
    }

    static getSysInfo() {
        let info = QQ._wxSystemInfo;
        if (!info) {
            this.isIphoneX();
        }
        return QQ._wxSystemInfo;
    }

    static setLoadingVisible(bool: boolean) {
        if (bool)
            qq.showLoading({ title: "加载中" });
        else
            qq.hideLoading();
    }

    private static countAgain: number = 3;
    static confirmAgainDelay(time: number = 30000) {
        let id = setTimeout(() => {
            BaseProtocol.requestByConfig('confirmAgain', {}).then(res => {
                //console.log("confirmAgainDelay ok ");
            }).catch(err => {
                clearTimeout(id);
                console.error("catch confirmAgainDelay");
                if (QQ.countAgain > 0) {
                    QQ.countAgain--;
                    QQ.confirmAgainDelay(2000);
                }
            })
        }, time)
    }

    /**是否退出游戏 */
    public static isQuickGame(res: any): boolean {
        if (cc.sys.os != cc.sys.OS_ANDROID) {
            if (res && res.mode && res.mode == "back") {
                return true;
            } else return false;
        } else {
            if (res && res.mode && (res.mode == "close" || res.mode == "back")) {
                return true;
            } else return false;
        }
    }

    public static uiPasteBoard(str: string, callback?) {
        qq.setClipboardData({
            data: str,
            success(res) {
                callback && callback();
            }
        })
    }

    public static stageLog(type: number, data: any) {
        if (wx.aldStage) {
            if (type == 0) {
                wx.aldStage.onStart({
                    stageId: data.stageId,
                    stageName: data.stageName,
                })
            }
            else if (type == 1) {
                wx.aldStage.onEnd({
                    stageId: data.stageId,
                    stageName: data.stageName,
                    event: data.stageWin ? "complete" : "fail",
                    params: {
                        desc: data.stageWin ? "关卡完成" : "关卡失败",
                    }
                })
            } else if (type == 2) {
                wx.aldStage.onRunning({
                    stageId: data.stageId,
                    stageName: data.stageName,
                    event: "relive",
                    params: {
                        itemName: "复活",
                    }
                })
            }
        }
    }
}
