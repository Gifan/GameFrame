import { HD_MODULE } from "../../../hd_module";
import { appConfig, HDDefaultUserInfo } from "../../../config/AppConfig";
import BaseProtocol from "../../../net/protocol/baseprotocol";
import { Manager } from "../../../../../manager/Manager";
import Base64 = require('../../../utils/base64.js');
import { GameVoManager } from "../../../../../manager/GameVoManager";

let shareSuccess = 2.5; //默认切后台多少秒后视为成功分享
const wx = window["tt"];
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
 * SDK接入, 微信信息注册
 */
export default class ZiJie {
    /** 用户信息 */
    public static userInfo: any = null;

    /** 分享模板信息 */
    public static shareInfo: any = [];

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

    /** query */
    public static query: any = {};

    /** 是否在录制 */
    public static isRecordVideo: boolean = false;

    public static isInitRecord: boolean = false;

    /** 授权信息 */
    public static settingRes: any = null;

    /** 初始化 */
    public static init() {
        /** 开启右上角转发 */
        tt.showShareMenu({
            withShareTicket: true
        });
        /** SDK初始化 */
        tt.onShow((res) => {
            ZiJie.onShowCallBack(res);
        });
        tt.onHide((res) => {
            ZiJie.onHideCallBack(res);
        });
    }

    /** onShow */
    public static onShowCallBack(res) {
        /** query */
        console.log('[hd_sdk_zijie]------>onShowCallBack', res);
        ZiJie.onShowRes = res;
        if (res && res.query.openId) {
            ZiJie.getUserInfo((userInfo) => {
                HD_MODULE.getNet().postInvitation({
                    inviter_open_id: res.query.openId,
                    mark: userInfo.avatar_url
                }, () => {
                    console.log("=====邀请进入成功====", res.query.openId, userInfo);
                }, (err) => {
                    console.log("=====邀请进入失败====", err);
                })
            }, () => {
                //console.log("==授权失败==")
            })
        }

        /** 获取分享模板 */
        // ZiJie.getShareTemplate(appConfig.app_version);

        /** 清除切后台计时器 */
        if (false && ZiJie.shareFunc) {
            if ((Date.now() - ZiJie.hideTime) >= shareSuccess * 1000) {
                ZiJie.shareFunc(0);
            } else {
                ZiJie.shareFunc(-1);
            }
        }
        ZiJie.shareFunc = null;
        ZiJie.updateNotityEvent('onshow');

        ZiJie.checkQueryEvent();
    }

    /** onHide */
    public static onHideCallBack(res) {
        ZiJie.onHideRes = res;
        ZiJie.hideTime = Date.now();
        ZiJie.updateNotityEvent('onhide');
    }

    /** 登陆成功回调 */
    public static loginCallBack(res) {
        // if (ZiJie.isLogin) return;
        runFuncFormArray(this.loginCallBackList, res);
        runFuncFormArray(this.afterLoginCallBackList, res);
    }

    public static loginFailCallBack(res) {
        while (this.loginFailCallBackList.length > 0) {
            (this.loginFailCallBackList.pop())(res);
        }
    }
    public static share(data) {
        /** 分享类型 */
        let channel = data.channel;
        /** 标题 */
        let title = data.title || '';
        /** 分享图 */
        let imageUrl = data.imageUrl || "https://cdn-hdgames.9377.com/gameres/t3/p1/release/wechat/1.0.0/shareTemplates/res/share.jpg";//cc.url.raw('Texture/start/logo' + "?a=a.jpg");
        /** 分享出去的数据 */
        let query = data.query || '';
        /** 附加信息 */
        let extra = data.extra || undefined;
        /** 当前分享场景 */
        let scene = data.scene || '未定义场景';

        /** 分享回调, code: 0为成功，-1为失败 */
        ZiJie.shareFunc = (code: number) => {
            if (code == 0) {
                if (data.success)
                    data.success();
                HD_MODULE.getNet().postGameEvent({ event_name: '分享成功' + scene, counter: 1 });
            } else if (code == -1) {
                if (data.fail) {
                    data.fail()
                }
                ZiJie.showWxTips("提示", "请分享不同群获得奖励", "确定");
                HD_MODULE.getNet().postGameEvent({ event_name: '分享失败' + scene, counter: 1 });
            }
        };

        /** 不是微信环境，直接退出分享 */
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            if (ZiJie.shareFunc)
                ZiJie.shareFunc(0);
            return;
        }
        //console.log('[hd_sdk_zijie]----->分享', imageUrl)

        let shareMsg = {
            // channel: channel,
            title: title,
            imageUrl: imageUrl,
            query: query + '&share=' + scene + "&openId=" + HD_MODULE.getPlatform().getOpenId(),
            extra: extra,
            ald_desc: scene,
            success() {
                console.log('分享成功-----');
                ZiJie.shareFunc(0);
            },
            fail(e) {
                console.log('分享失败------');
                ZiJie.shareFunc(-1);
            }
        }
        this._shareAppMessage(shareMsg);
    }

    /** 
     * 微信提示框 没有 cancelText 则只显示一个按钮
    */
    public static showWxTips(title: string, content: string, okText: string = "确定", cancelText?: string, success?: any) {
        let showCancel = Boolean(cancelText);
        let tipsData = {
            title: title,
            content: content,
            showCancel: showCancel,
            confirmText: okText,
            cancelText: cancelText,
            success: success
        }
        tt.showModal(tipsData);
    }

    /** 获取用户数据,没授权则询问授权 */
    public static getUserInfo(success: Function, fail?: Function, info = null, force: boolean = false) {
        if (ZiJie.userInfo) {
            if (success) {
                console.log("Zijie.userInfo", ZiJie.userInfo);
                success(ZiJie.userInfo);
            }
        } else {
            ZiJie._login(success, fail, info, force);
        }
    }


    public static login(): Promise<any> {
        return new Promise((resolve, reject) => {
            tt.login({
                force: false,
                success: (res) => {
                    ZiJie.isLogin = res.isLogin;
                    if (res.code) {
                        let codeRes = res;
                        HDDefaultUserInfo.code = codeRes.code;
                        let params = {
                            platform_id: appConfig.platform_id,
                            app_id: appConfig.app_id,
                            user_info: HDDefaultUserInfo,
                            channel_code: ZiJie.channel_code
                        }
                        HD_MODULE.getNet().postMiniGameLogin(params, (res) => {
                            let token = res.data.token;
                            HD_MODULE.getPlatform().setToken(token);
                            ZiJie.loginCode = 1;
                            // ZiJie.loginCallBack(res);
                            let decode = res.data.token.split('.');
                            let info = JSON.parse(Base64.Base64.decode(decode[1]));
                            if (res.data.token && ZiJie.channel_code) {
                                if (info.new_user) {
                                    ZiJie.countAgain = 3;
                                    ZiJie.confirmAgainDelay();
                                }
                            }
                            resolve();
                        }, (err) => {
                            ZiJie.loginCode = 0;
                            reject();
                        });

                    } else if (res.anonymousCode) {
                        let codeRes = res;
                        HDDefaultUserInfo.code = codeRes.anonymousCode;
                        let params = {
                            platform_id: appConfig.platform_id,
                            app_id: appConfig.app_id,
                            user_info: HDDefaultUserInfo,
                            channel_code: ZiJie.channel_code
                        }
                        HD_MODULE.getNet().postMiniGameLogin(params, (res) => {
                            let token = res.data.token;
                            HD_MODULE.getPlatform().setToken(token);
                            ZiJie.loginCode = 1;
                            let decode = res.data.token.split('.');
                            let info = JSON.parse(Base64.Base64.decode(decode[1]));
                            if (res.data.token && ZiJie.channel_code) {
                                if (info.new_user) {
                                    ZiJie.countAgain = 3;
                                    ZiJie.confirmAgainDelay();
                                }
                            }
                            resolve();
                        }, (err) => {
                            ZiJie.loginCode = 2;
                            reject();
                        });
                    }
                },
                fail: (err) => {
                    console.error('fail = ', err);
                    ZiJie.loginCode = 2;
                    reject();
                }
            });
        });
    }

    /**
	 * 静默登录
	 */
    private static _silenceLogin(success: Function = () => { }, fail: Function = () => { }) {
        // console.error('[登录队列0]', ZiJie.loginCode, ZiJie.loginCallBackList.length)
        if (ZiJie.loginCode == 2) {//已经登录失败
            ZiJie.loginFailCallBack(null);
            fail();
            return;
        }
        ZiJie.loginFailCallBackList.push(fail);
        if (ZiJie.loginCode < 0) {
            ZiJie.loginCallBackList.push(success);
            if (ZiJie.loginCallBackList.length > 1) {
                return;
            }
        }
        tt.login({
            force: false,
            success: (res) => {
                ZiJie.isLogin = res.isLogin;
                if (res.code) {
                    // console.log("[hd_sdk_WeChat]------>静默登录:", res);
                    let codeRes = res;
                    HDDefaultUserInfo.code = codeRes.code;
                    if (!HD_MODULE.getPlatform().getToken()) {
                        //console.log("[hd_sdk_WeChat]------>本地token为空或者已过期,重新登录小游戏服务器:");
                        let params = {
                            platform_id: appConfig.platform_id,
                            app_id: appConfig.app_id,
                            user_info: HDDefaultUserInfo,
                            channel_code: ZiJie.channel_code
                        }
                        HD_MODULE.getNet().postMiniGameLogin(params, (res) => {
                            // console.log('[hd_sdk_WeChat]------>登录小游戏服务器', res, ZiJie.loginCallBackList.length);
                            let token = res.data.token;
                            HD_MODULE.getPlatform().setToken(token);
                            // try {
                            //     tt.setStorageSync("token" + appConfig.platform_id + appConfig.env, token);
                            // } catch (error) {
                            //     console.log(`setStorageSync调用失败`);
                            // }
                            ZiJie.loginCode = 1;
                            ZiJie.loginCallBack(res);
                            let decode = res.data.token.split('.');
                            let info = JSON.parse(Base64.Base64.decode(decode[1]));
                            // console.log(info.new_user, WeChat.channel_code)
                            if (res.data.token && ZiJie.channel_code) {
                                if (info.new_user) {
                                    ZiJie.countAgain = 3;
                                    ZiJie.confirmAgainDelay();
                                }
                            }
                        }, (err) => {
                            //console.log('[hd_sdk_WeChat]------>登录小游戏服务器失败', err, WeChat.loginCallBackList.length);
                            ZiJie.loginCode = 0;
                            ZiJie.loginFailCallBack(err);
                        });
                    } else {
                        ZiJie.loginCode = 1;
                        // console.log("token exits", res, ZiJie.loginCallBackList.length);
                        ZiJie.loginCallBack(res);
                    }
                } else if (res.anonymousCode) {
                    let codeRes = res;
                    HDDefaultUserInfo.code = codeRes.anonymousCode;
                    // if (!HD_MODULE.getPlatform().getToken()) {
                    //console.log("[hd_sdk_WeChat]------>本地token为空或者已过期,重新登录小游戏服务器:");
                    let params = {
                        platform_id: appConfig.platform_id,
                        app_id: appConfig.app_id,
                        user_info: HDDefaultUserInfo,
                        channel_code: ZiJie.channel_code
                    }
                    HD_MODULE.getNet().postMiniGameLogin(params, (res) => {
                        // console.log('[hd_sdk_WeChat]------>登录小游戏服务器', res, ZiJie.loginCallBackList.length);
                        let token = res.data.token;
                        HD_MODULE.getPlatform().setToken(token);
                        // try {
                        //     tt.setStorageSync("token" + appConfig.platform_id + appConfig.env, token);
                        // } catch (error) {
                        //     console.log(`setStorageSync调用失败`);
                        // }
                        ZiJie.loginCode = 1;
                        ZiJie.loginCallBack(res);
                        let decode = res.data.token.split('.');
                        let info = JSON.parse(Base64.Base64.decode(decode[1]));
                        if (res.data.token && ZiJie.channel_code) {
                            if (info.new_user) {
                                ZiJie.countAgain = 3;
                                ZiJie.confirmAgainDelay();
                            }
                        }
                    }, (err) => {
                        //console.log('[hd_sdk_WeChat]------>登录小游戏服务器失败', err, WeChat.loginCallBackList.length);
                        ZiJie.loginCode = 2;
                        ZiJie.loginFailCallBack(err);
                    });
                    // } else {
                    //     console.log("token exits", res, ZiJie.loginCallBackList.length);
                    //     ZiJie.loginCallBack(res);
                    // }
                }
            },
            fail: (err) => {
                console.error('fail = ', err);
                ZiJie.loginCode = 2;
                ZiJie.loginFailCallBack(err);
            }
        });
    }


    /**
     * 获取实际的设计分辨率
     */
    private static designSize: cc.Size = null;
    public static getRealDesignSize(): cc.Size {
        if (!ZiJie.designSize) {
            let size = cc.view.getCanvasSize();
            let realheight = 720 * size.height / size.width;
            ZiJie.designSize = new cc.Size(cc.winSize.width, realheight);
        }
        return ZiJie.designSize;
    }


    public static getSetting() {
        tt.getSetting({
            success(res) {
                ZiJie.authorizeInfo = res;
            }
        })
    }

    public static getAuthorizeInfo() {
        if (JSON.stringify(ZiJie.authorizeInfo) != "{}" && ZiJie.authorizeInfo.authSetting['scope.userInfo'])
            return true
        return false
    }

	/**
	 * 大授权登录
	 */
    private static _login(success: Function, fail?: Function, info = null, force: boolean = false) {

        let updateUserInfo = (res) => {
            ZiJie.userInfo = res.userInfo;
            GameVoManager.getInstance.myUserVo.isAuthorize = 1;
            {
                HDDefaultUserInfo.avatar_url = ZiJie.userInfo.avatarUrl;
                HDDefaultUserInfo.city = ZiJie.userInfo.city;
                // HDDefaultUserInfo.code = codeRes.code;
                HDDefaultUserInfo.country = ZiJie.userInfo.country;
                HDDefaultUserInfo.gender = ZiJie.userInfo.gender;
                HDDefaultUserInfo.nick_name = ZiJie.userInfo.nickName;
                HDDefaultUserInfo.province = ZiJie.userInfo.province;
                GameVoManager.getInstance.myUserVo.nickName = ZiJie.userInfo.nickName;
                GameVoManager.getInstance.myUserVo.avatarUrl = ZiJie.userInfo.avatarUrl;
            }
            ZiJie.userInfo = HDDefaultUserInfo;
            success(ZiJie.userInfo);
        }

        tt.getSetting({
            success: (res) => {
                console.log('[hd_sdk_ZiJie]----->获取授权信息', res);
                this.authorizeInfo = res;
                let isAuthorize = res.authSetting['scope.userInfo'];
                if (!isAuthorize || !GameVoManager.getInstance.myUserVo.isAuthorize) {//是否已授权，未授权则按钮授权
                    tt.getUserInfo({
                        success: (userInfo) => {
                            ZiJie.userInfo = userInfo.userInfo;
                            console.log("userInfo", userInfo);
                            updateUserInfo(userInfo);
                        },
                        fail: () => {
                            fail && fail();
                        }
                    });
                } else {
                    if (!ZiJie.userInfo) {
                        tt.getUserInfo({
                            success: (userInfo) => {
                                ZiJie.userInfo = userInfo.userInfo;
                                updateUserInfo(userInfo);
                            },
                            fail: () => {
                                fail && fail();
                            }
                        });
                    }
                }
            },
            fail: (err) => {
                console.log("获取设置失败", err);
            }
        });

    }

    public static getUserInfoBtn() {
        // return ZiJie.userInfoBtn;
    }

    private static _shareAppMessage(data) {
        // if (wx.aldShareAppMessage) {
        //     wx.aldShareAppMessage(data)
        // } else {
        tt.shareAppMessage(data);
        // }
    }

    static getIsLogin() {
        return this.isLogin && this.loginCode == 1;
    }

    /**
     * 
     * @param data 初始化右上角转发
     */
    public static setShareAppMsg(data: tt.types.ShareOption) {
        let title = data.title;
        let imageUrl = data.imageUrl;
        let query = "channel_code=" + data.channel_code;
        // //console.log("setShareAppMsg", title, imageUrl, query);
        // if (wx.aldOnShareAppMessage) {
        //     wx.aldOnShareAppMessage(() => {
        //         HD_MODULE.getNet().postGameEvent({ event_name: '分享成功右上角', counter: 1 });
        //         return {
        //             title: title,
        //             imageUrl: imageUrl,
        //             query: query + '&share=右上角',
        //         };
        //     });
        // }
        // else {
        tt.onShareAppMessage(() => {
            HD_MODULE.getNet().postGameEvent({ event_name: '分享成功右上角', counter: 1 });
            return {
                title: title,
                imageUrl: imageUrl,
                query: query + '&share=右上角' + "&openId=" + HD_MODULE.getPlatform().getOpenId(),
            };
        });
        // }
    }

    /**
     * 小游戏跳转
     
    public static navigateToMiniProgram(data: wx.types.navigateToMiniProgramParam) {
        wx.navigateToMiniProgram(data);
    }*/

    /** 客服 
    public static openCustomerServiceConversation(data: wx.types.CustomParam) {
        wx.openCustomerServiceConversation(data);
    }*/

    /** 获取分享模板 */
    private static getShareTemplate(version: string, success?: Function, fail?: Function) {
        if (!ZiJie.shareTemplate) {
            BaseProtocol.requestByConfig('shareConfig', { version: version }).then((res) => {
                //console.log("[hd_sdk_wechat]----->获取分享模板", res);
                ZiJie.shareTemplate = res.data.share;
                if (success)
                    success(ZiJie.shareTemplate);
            }).catch(err => {
                fail && fail(err);
            });
        } else {
            if (success)
                success(ZiJie.shareTemplate);
        }
    }

    /** 根据类型随机获取分享 */
    public static getOneShareInfoByType(type: string, success: Function, fail?: Function) {
        let info = null;
        if (ZiJie.shareTemplate) {
            let shareArr = ZiJie.shareTemplate[type];
            if (shareArr) {
                let rand = Math.floor(Math.random() * shareArr.length);
                info = shareArr[rand];
                if (success)
                    success(info);
            } else {
                fail && fail();
            }
        } else {
            ZiJie.getShareTemplate(appConfig.app_version, (res) => {
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
        ZiJie.getOneShareInfoByType(type, (shareInfo) => {
            if (shareInfo) {
                let newquery = "channel_code =" + shareInfo.channel_code;
                let shareData = {
                    title: shareInfo.title,
                    imageUrl: shareInfo.image_url,
                    scene: data && data.scene || "分享",
                    success: data && data.success,
                    fail: data && data.fail,
                    query: newquery
                }
                ZiJie.share(shareData);
            } else {
                let shareData = {
                    title: "热血猎手",
                    scene: data && data.scene || "本地分享",
                    success: data && data.success,
                    fail: data && data.fail
                }
                ZiJie.share(shareData);
            }
        }, () => {
            let shareData = {
                title: "热血猎手",
                scene: data && data.scene || "本地分享",
                success: data && data.success,
                fail: data && data.fail
            }
            ZiJie.share(shareData);
        });
    }

    /** 获取启动参数 */
    static getOnShowRes() {
        return this.onShowRes;
    }

    /** 激励视频 */
    static showVideo(videoId: string, success: () => {}, fail: (res) => {}, isShow: boolean = true) {
        console.log('showVideo', ZiJie.isVideo);
        if (!ZiJie.isVideo) {
            ZiJie.isVideo = true;
            try {
                let load = (complate?: Function, err?: Function) => {
                    if (!isShow || ZiJie.isLoadVideo) {
                        ZiJie.isLoadVideo = false;
                        ZiJie.videoAd.load().then(() => {
                            ZiJie.isLoadVideo = true;
                            ZiJie.isHaveVideo = true;
                            complate && complate();
                        }).catch(() => {
                            ZiJie.isLoadVideo = true;
                            console.error("catch load");
                            err && err();
                            // this.videoAd.offClose(onClose);
                        });
                    }
                }

                let show = () => {
                    if (isShow) {
                        ZiJie.videoAd.show().catch(err => {
                            // this.videoAd.offClose(onClose);
                            console.error("catch", err);
                            ZiJie.isVideo = false;
                        });
                        cc.audioEngine.pauseAll();
                        Manager.audio.pauseMusic();
                    } else {
                        ZiJie.isVideo = false;
                    }
                }

                let suc = () => {
                    ZiJie.isVideo = false;
                    // cc.game.resume();
                    Manager.audio.resumeMusic();
                    cc.audioEngine.resumeAll();
                    load();
                    success && success();
                }

                let fai = (res) => {
                    ZiJie.isVideo = false;
                    // load();
                    fail && fail(res);
                }
                if (!tt.createRewardedVideoAd) {
                    ZiJie.showWxTips("提示", "版本过低无法创建视频广告", "确定");
                    ZiJie.isVideo = false;
                    return;
                }
                if (!ZiJie.videoAd) {
                    ZiJie.videoAd = tt.createRewardedVideoAd({
                        adUnitId: videoId
                    });
                    load(() => {
                        show();
                    }, () => {
                        fai({ errCode: 0 });
                    });
                } else {
                    if (ZiJie.isLoadVideo)
                        show();
                    else {
                        fai(null);
                    }
                }
                let close = res => {
                    if ((res && res.isEnded) || res == undefined) {
                        suc && suc();
                    } else {
                        Manager.audio.resumeMusic();
                        fai && fai(null);
                    }
                    if (ZiJie.videoAd && ZiJie.videoAd.offClose)
                        ZiJie.videoAd.offClose(close);
                }
                let error = err => {
                    // console.error('err=', err, JSON.stringify(err));
                    if (this.videoAd && this.videoAd.offClose)
                        ZiJie.videoAd.offClose(close);
                    ZiJie.videoAd.offError(error);
                    if (err && err.errCode && (err.errCode == 1004 || err.errCode == 1005 || err.errCode == 1006 || err.errCode == 1007 || err.errCode == 1008)) {
                        ZiJie.isHaveVideo = false;
                        ZiJie.videoAd = null;
                    }
                    fai(err);
                }
                ZiJie.videoAd.onClose(close);
                ZiJie.videoAd.onError(error);
            } catch (error) {
                // console.log("error = ", error);
            }
        }
    }
    private static stopcb: Function = null;
    static recordVideo(onStartCallBack?: Function, onStopCallBack?: Function) {
        let self = ZiJie;
        ZiJie.stopcb = onStopCallBack;
        let authCamera = (suc) => {
            //console.log('[hd_sdk_zijie]----->询问授权摄像机');
            tt.authorize({
                scope: 'scope.camera',
                success: suc,
                fail: () => {
                    ZiJie.showWxTips('提示', '请授权访问相册', '确定', '取消', (res) => {
                        //console.log('[hd_sdk_zijie]----->提示框', res);
                        if (res.confirm) {
                            tt.openSetting({
                                success: (res) => {
                                    //console.log('[hd_sdk_zijie]----->打开授权设置', res);
                                }
                            });
                        }
                    });
                }
            })
        }

        let record = () => {
            if (!self.isInitRecord) {
                self.isInitRecord = true;
                const recorder = tt.getGameRecorderManager();
                //console.log('[hd_sdk_zijie]----->注册录屏事件');
                recorder.onStart((res) => {
                    //console.log('[hd_sdk_zijie]----->录制开始事件', res);
                    if (onStartCallBack)
                        onStartCallBack();
                    // recorder.recordClip({
                    //     timeRange: [3, 3]
                    // })
                });

                recorder.onStop((res) => {
                    self.isRecordVideo = false;
                    // console.log('[hd_sdk_zijie]----->录制停止事件', res, onStopCallBack);
                    if (onStopCallBack)
                        onStopCallBack(null);
                    tt.shareVideo({
                        videoPath: res.videoPath,
                        success: () => {
                            if (ZiJie.stopcb)
                                ZiJie.stopcb(1);
                        },
                        fail: (err) => {
                            // console.log('[hd_sdk_zijie]----->弹窗');
                            ZiJie.showWxTips('提示', '分享视频已取消', '确定', '取消', (res) => {

                            });
                            if (ZiJie.stopcb)
                                ZiJie.stopcb(1);
                        }
                    });
                    // recorder.clipVideo({
                    //     path: res.videoPath,
                    //     success: (res) => {
                    //         //console.log('[hd_sdk_zijie]----->生成视频', res);
                    //     },
                    //     fail: (err) => {
                    //         //console.log('[hd_sdk_zijie]----->生成视频失败', err);
                    //     }
                    // });
                });
                recorder.onError((res) => {
                    ZiJie.isRecordVideo = false;
                    ZiJie.showWxTips('提示', '录屏出错' + res, '确定');
                })

                recorder.onInterruptionBegin(res => {
                    console.log('[hd_sdk_zijie]----->录制视频中断开始');
                    if (self.isRecordVideo) recorder.pause();
                })

                recorder.onInterruptionEnd(res => {
                    console.log('[hd_sdk_zijie]----->录制视频中断结束');
                    if (self.isRecordVideo) recorder.resume();
                })
            }
            if (!self.isRecordVideo) {
                self.recordVideoStart();
            } else {
                self.recordVideoStop();
            }
            self.isRecordVideo = !self.isRecordVideo;
            console.log('[hd_sdk_zijie]----->正在录制', self.isRecordVideo);
        }

        authCamera(() => {
            record();
        });

        // if(ZiJie.settingRes){
        //     // let camera = ZiJie.settingRes['scope.camera'];
        //     authCamera(() => {
        //         record();
        //     });
        //     // if(!camera){
        //     //     authCamera(() => {
        //     //         record();
        //     //     });
        //     // }else{
        //     //     record();
        //     // }
        // }else{
        //     tt.getSetting({
        //         success: (settingRes) => {
        //             ZiJie.settingRes = settingRes;
        //             //console.log('授权状态', settingRes);
        //             authCamera(() => {
        //                 record();
        //             });
        //             // let write = settingRes['scope.writePhotosAlbum'];
        //             // if(!write){
        //             //     authWrite(() => {
        //             //         let camera = settingRes['scope.camera'];
        //             //         if(!camera){
        //             //             authCamera(() => {
        //             //                 record();
        //             //             });
        //             //         }
        //             //     })
        //             // }else{
        //             // let camera = settingRes['scope.camera'];
        //             // if(!camera){
        //             //     authCamera(() => {
        //             //         record();
        //             //     });
        //             // }
        //             // }
        //         }
        //     })
        // }
    }

    /** 录屏开始 */
    public static recordVideoStart() {
        const recorder = tt.getGameRecorderManager();
        //console.log('[hd_sdk_zijie]----->开始录制', recorder.onStart);
        if (recorder) {
            recorder.start({
                // microphoneEnabled: false,
                duration: 120,
            });
        } else {
            console.log('[hd_sdk_zijie]----->tt.getGameRecorderManager()返回值为空');
        }
    }

    /** 录屏停止 */
    public static recordVideoStop() {
        const recorder = tt.getGameRecorderManager();
        //console.log('[hd_sdk_zijie]----->停止录制', recorder);
        if (recorder) {
            recorder.stop();
        } else {
            console.log('[hd_sdk_zijie]----->tt.getGameRecorderManager()返回值为空');
        }
    }

    /** 是否正在录屏状态 */
    public static getIsRecord() {
        return this.isRecordVideo;
    }

    public static getIsHaveVideo(): boolean {
        return this.isHaveVideo;
    }

    /**获取系统信息 */
    static systemInfo(): any {
        return ZiJie.getSysInfo();
    }

    static notifyOnShowEvent(onShowCallBack: Function) {
        ZiJie.onShowFuncList.push(onShowCallBack);
    }

    static notifyOnHideEvent(onHideCallBack: Function) {
        ZiJie.onHideFuncList.push(onHideCallBack);
    }

    static updateNotityEvent(type: 'onshow' | 'onhide') {
        switch (type) {
            case 'onshow': {
                for (let i = 0; i < ZiJie.onShowFuncList.length; i++) {
                    ZiJie.onShowFuncList[i](ZiJie.onShowRes);
                }
                break;
            }
            case 'onhide': {
                for (let i = 0; i < ZiJie.onHideFuncList.length; i++) {
                    ZiJie.onHideFuncList[i](ZiJie.onHideRes);
                }
                break;
            }
        }
    }

    static checkQueryEvent() {
        if (!ZiJie.onShowRes) return;
        let res = ZiJie.onShowRes;
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
        tt.showToast({
            title: text,
            mask: mask,
            icon: icon,
        })
    }
    public static hideToast() {
        tt.hideToast();
    }
    /** 短震 */
    static vibrateShort(success?: () => void, fail?: () => void) {
        tt.vibrateShort({
            success: success,
            fail: fail
        });
    }

    /** 设置默认右上角分享 */
    static setDefaultRightTopShare() {
        ZiJie.getOneShareInfoByType('common', (shareInfo) => {
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
        if (ZiJie.shareSwitch) {
            let actice = Number(ZiJie.shareSwitch[type] || 0);
            node.active = node.active && !!actice;
        }
    }

    private static _ttSystemInfo;
    static isIphoneX(): boolean {
        if (!ZiJie._ttSystemInfo) {
            ZiJie._ttSystemInfo = tt.getSystemInfoSync();
        }
        if (ZiJie._ttSystemInfo.model.indexOf("iPhone X") != -1 ||
            ZiJie._ttSystemInfo.model.indexOf("iPhone1") != -1) {
            return true;
        } else return false;
    }

    /** 注册登陆后执行的动作，如果未登录，则登录时执行，如果注册该方法时已经登录了，则立即执行 */
    static rigisterEventAfterLogin(cb: () => any) {
        ZiJie.isLogin ? cb() : this.afterLoginCallBackList.push(cb);
    }

    static getSysInfo() {
        let info = ZiJie._ttSystemInfo;
        if (!info) {
            ZiJie._ttSystemInfo = tt.getSystemInfoSync();
        }
        return ZiJie._ttSystemInfo;
    }

    static setLoadingVisible(bool: boolean) {
        if (bool)
            tt.showLoading({ title: "加载中" });
        else
            tt.hideLoading();
    }

    private static countAgain: number = 3;
    static confirmAgainDelay(time: number = 30000) {
        let id = setTimeout(() => {
            BaseProtocol.requestByConfig('confirmAgain', {}).then(res => {
                //console.log("confirmAgainDelay ok ");
            }).catch(err => {
                clearTimeout(id);
                if (ZiJie.countAgain > 0) {
                    ZiJie.countAgain--;
                    ZiJie.confirmAgainDelay(2000);
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
        tt.setClipboardData({
            data: str,
            success(res) {
                callback && callback();
            }
        })
    }
}
