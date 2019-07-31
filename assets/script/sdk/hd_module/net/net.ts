import BaseProtocol from "./protocol/baseprotocol";
import { DefaultUserInfo } from "../config/AppConfig";
const wx = window["wx"];
const eventNameToDesc = {
    "home_shop": "枪械库icon 点击次数 ",
    "home_start": "开始游戏按钮",
    "home_moregold": "福利iocn 点击次数",
    "check":"签到页领取按钮 点击次数",
    "check_double": "签到页双倍领取 点击次数",
    "check_double_shard": "签到双倍分享领取 成功次数",
    "check_double_video": "签到双倍视频领取 成功次数",
    "stop": "游戏中，暂停按钮",
    "continue": "暂停中，继续游戏按钮",
    "stop_home": "暂停中，返回主页",
    "revive_end": "复活跳过次数",
    "settlement_home": "结算-普通领取按钮",
    "time_gold_menu": "计时收益icon 点击次数",
    "time_gold_normal": "计时收益领取按钮 点击次数",
    "time_gold_triple_share": "计时三倍分享领取 成功次数",
    "time_gold_triple_video": "计时三倍视频领取 成功次数",
    "draw": "结算转盘 打开次数",
    "super_reward": "结算转盘领取 点击次数",
    "draw_finish": "结算转盘视频领取 成功次数",
    "draw_finish_share": "结算转盘分享领取 成功次数",
    "invite_menu": "福利-邀请有礼页签 点击次数",
    "invite_share": "邀请有礼分享按钮 点击次数",
    "diamond_invite": "钻石邀请",
    "rank": "排行榜icon 点击次数",
    "share_rank": "排行榜分享按钮 点击次数",
    "tryfullLevel": "视频满级试用",
    "share_tryfullLevel": "死亡后武器满级试用 分享成功次数",
    "video_tryfullLevel": "死亡后武器满级试用 视频成功次数",
    "home_gold": "金币兑换页 打开次数",
    "exchange_coin": "金币兑换页 兑换成功次数",
    "home_power": "体力兑换页 打开次数",
    "exchange_power": "体力兑换页 兑换成功次数",
    "diamond_collect": "收藏奖励 领取成功次数",
    "diamond_service": "钻石客服",
    "home_draw": "主页转盘icon 点击次数",
    "home_draw_success ": "主页转盘 领取成功次数",
    "home_draw_close": "主页转盘 关闭次数",
    "home_free_diamond": "免费钻石icon 点击次数",
    "home_free_diamond_success": "免费钻石 领取成功次数",
    "home_free_diamond_close": "免费钻石 关闭次数",
    "free_gold": "免费金币额外界面 弹出次数",
    "free_gold_success": "免费金币领取 成功次数",
    "free_gold_close": "免费金币关闭 点击次数",
    "free_weapon_start_success": "开始游戏武器试用成功",
    "free_weapon_start_close": "开始游戏武器试用界面 关闭次数",
    "preview_weapon_click": "预告武器icon 点击",
    "preview_weapon_success": "预告武器试用 领取成功",
    "preview_weapon_close": "预告武器试用 关闭次数",
    "extra_reward_success": "关卡解锁额外奖励 领取成功次数",
    "extra_reward_close": "关卡解锁额外奖励 关闭次数",
    "guide_step_1": "完成新手指引1 人数",
    "guide_step_2": "完成新手指引2 人数",
    "guide_step_3": "完成新手指引3 人数",
    "guide_step_4": "完成新手指引4 人数",
    "guide_step_5": "完成新手指引5 人数",
    "share_relive": "复活成功 分享次数",
    "video_relive": "复活成功 视频次数",
    "diamond_relive": "复活成功 使用钻石次数",
    "loadstart": "位于微信加载页流失人数",
    "loadend": "位于loading页流失人数",
    "load_quit": "用户加载时退出",
    "one_qui": "用户在第一关中退出（关闭引导操作后未进入结算页）",
    "oneload_quit": "用户在加载后未关闭操作引导即退出",
    "firepower": "人物火力升级 点击次数",
    "Upfirepower": "人物火力升级成功 次数",
    "lifevolume": "人物生命升级按钮 点击次数",
    "Uplifevolume": "人物生命升级成功 次数",
    "firingrate": "武器射速按钮 点击次数",
    "Upfiringrate": "武器射速升级成功 次数",
    "weaponpower": "武器火力加成按钮 点击次数",
    "Upweaponpower": "武器火力加成升级成功 次数",
    "timegold": "计时金币收益按钮 点击次数",
    "Uptimegold": "计时金币收益升级 成功次数",
    "huntinggold": "狩猎金币收益按钮 点击次数",
    "Uphuntinggold": "狩猎金币收益升级 成功次数",
    "goldexchangeui": "金币兑换页 经升级按钮打开次数",
    "serializeError": "序列化出错",
    "PreLoadResultError": "预加载结算页出错",
    "LoadViewError": "加载页面异常",
    "triple_Settlement_share": "三倍按钮分享领取次数",
    "triple_Settlement_video": "结算-三倍按钮视频领取次数",
    "gunAway": "武器赠送",
    "gunTry": "武器试用",
    "home_boss_p":"头目战未开放前点击次数",
    "home_boss_p15":"头目战开放后点击次数",
    "boss_rank_p":"头目战开始挑战",
    "boss_result_p1":"头目战炫耀战绩",
    "boss_result_p2":"头目战相机按钮点击",
    "home_bubble_p":"主页漂浮武器点击次数",
}
export default class Net {
    /** 获取  服务器时间 */
    getServerTime(success?: (res?) => any, fail?: (err?) => any) {
        BaseProtocol.requestByConfig('serverTime', {}).then(success).catch(fail);
    }

    /** 获取  KVDATA */
    getKVData(success?: (res?) => any, fail?: (err?) => any) {
        BaseProtocol.requestByConfig('kvDataGet', {}).then(success).catch(fail);
    }

    /** 
     * 上报  KVDATA 
     */
    putKVData(params: PutKVData, success?: (res?) => any, fail?: (err?) => any) {
        BaseProtocol.requestByConfig('kvDataPut', params).then(success).catch(fail);
    }

    /** 
     * 获取  排行榜 
     * @param params type:自定义的排行榜类型, cycle:清榜周期  'week'为一周，'forever'为永久，page：请求页数，page_size:每页的数据个数
     */
    getRankData(params: GetRankData, success?: (res?) => any, fail?: (err?) => any) {
        BaseProtocol.requestByConfig('rankGet', params).then(success).catch(fail);
    }

    /** 
     * 上报  排行榜 
     * @param params type:自定义的排行榜类型, cycle:清榜周期，'week'为一周，'forever'为永久，score：分数，customData:自定义数据，例如头像
     */
    postRankData(params: PostRankData, success?: (res?) => any, fail?: (err?) => any) {
        BaseProtocol.requestByConfig('rankPost', params).then(success).catch(fail);
    }

    /**
     * 上报  登录小游戏服务器(微信静默登录时自动登录)
     */
    postMiniGameLogin(params: PostMiniGameLogin, success?: (res?) => any, fail?: (res?) => any) {
        BaseProtocol.requestByConfig('login', params, null, false).then(success).catch(fail);
    }


    /**
     * 获取  交叉推广数据
     */
    getDSPInfo(param: GetDSPInfo, success?: (res?) => any, fail?: (res?) => any) {
        BaseProtocol.requestByConfig('dspGet', param).then(success).catch(fail);
    }

    /**
     * 交叉推广跳出打点
     */
    postDSPOut(param: PostDspOut, success?: (res?) => any, fail?: (res?) => any) {
        BaseProtocol.requestByConfig('dspOut', param).then(success).catch(fail);
    }

    /**
     * 交叉推广跳入打点
     */
    postDSPIn(param: PostDspIn, success?: (res?) => any, fail?: (res?) => any) {
        BaseProtocol.requestByConfig('dspIn', param).then(success).catch(fail);
    }

    /**
     * 上报游戏事件打点
     */
    postGameEvent(param: PostGameEvent, success?: (res?) => any, fail?: (res?) => any) {
        // if (wx && wx.aldSendEvent) {
        //     let desc = eventNameToDesc[param.event_name];
        //     if (!desc) desc = param.event_name;
        //     wx.aldSendEvent(desc);
        // }
        BaseProtocol.requestByConfig('gameEventPost', param).then(success).catch(fail);
        // }
    }

    /**
     * 获取分享配置
     */
    getShareConfig(param: GetShareConfig): Promise<any> {
        return BaseProtocol.requestByConfig('shareConfig', param);
    }

    /**
     * 获取游戏开关
     */
    getShareSwitch(param: GetShareSwitch): Promise<any> {
        return BaseProtocol.requestByConfig('shareSwitchGet', param);
    }

    /** 获取  分享模板 */
    getShareTemplate(param: GetShareTemplate): Promise<any> {
        return BaseProtocol.requestByConfig('shareTemplateGet', param);

    }

    // 获取客服次数
    getServiceCounter(param: GetServiceCount, success?: (res?) => any, fail?: (res?) => any) {
        BaseProtocol.requestByConfig('counterGet', param).then(success).catch(fail);
    }

    /**
     * 建立邀请
     */
    postInvitation(param: Invitation, success?: (res?) => any, fail?: (res?) => any) {
        BaseProtocol.requestByConfig('postInvitation', param).then(success).catch(fail);
    }

    /**
     * 获取邀请列表
     */
    getInvitationList(success?: (res?) => any, fail?: (res?) => any) {
        BaseProtocol.requestByConfig('getInvitationList', null).then(success).catch(fail);
    }

    /**
     * 买量二次确认
     */
    buySomeConfirmAgain(): Promise<any> {
        return BaseProtocol.requestByConfig('confirmAgain', null);
    }

    /**
     * 退出游戏
     */
    quitGameConfirm(param: any): Promise<any> {
        return BaseProtocol.requestByConfig('quitGame', param);
    }

    /**
     * 开始游戏记录
     */
    logStartGame(param: any): Promise<any> {
        return BaseProtocol.requestByConfig('onStageStart', param);
    }
    // /**
    //  * 游戏中
    //  * @param param 
    //  */
    // logGameRun(param: any): Promise<any> {
    //     return BaseProtocol.requestByConfig('gameRun', param);
    // }
    /**
     * 游戏结束
     * @param param 
     */
    logEndGame(param: any): Promise<any> {
        return BaseProtocol.requestByConfig('onStageEnd', param);
    }

    // loadStart(param: any): Promise<any> {
    //     return BaseProtocol.requestByConfig('loadStart', param);
    // }
    // loadEnd(param: any): Promise<any> {
    //     return BaseProtocol.requestByConfig('loadEnd', param);
    // }
    sharePost(param: any, success?: (res?) => any, fail?: (res?) => any): Promise<any> {
        return BaseProtocol.requestByConfig('sharePost', param).then(success).catch(fail);
    }
    shareGet(param: any, success?: (res?) => any, fail?: (res?) => any): Promise<any> {
        return BaseProtocol.requestByConfig('shareGet', param).then(success).catch(fail);
    }

}


export interface PutKVData {
    /** 上报类型，0：私有数据，1：公有数据 */
    type: number,
    /** 玩家数据JSON */
    custom_data: string,
}

export interface GetRankData {
    /** 自定义的排行榜类型 */
    type: string,
    /** 清榜周期  'week'为一周，'forever'为永久 */
    cycle: string,
    /** 请求页数 */
    page: number,
    /** 每页的数据个数 */
    page_size: number
}

export interface PostRankData {
    /** 自定义的排行榜类型 */
    type: string,
    /** 清榜周期  'week'为一周，'forever'为永久 */
    cycle: string,
    /** 分数 */
    score: number,
    /** 自定义JSON数据，例如头像 */
    data: string
}

export interface PostMiniGameLogin {
    /** 平台ID */
    platform_id: number,
    /** APPID */
    app_id: string,
    /** 用户数据 */
    user_info: DefaultUserInfo,
}

export interface GetDSPInfo {
    /** APP版本号 */
    version: string,
}
export interface PostDspOut {
    /** 跳转目标APPID */
    to_app_id: string
}

export interface PostDspIn {
    /** 来源APPID */
    from_app_id: string
}

export interface PostGameEvent {
    /** 游戏事件名称 */
    event_name: string,
    /** 游戏事件描述 */
    event_desc?: string,
    /** 点击次数 */
    counter: number
}

export interface GetShareConfig {
    /**游戏版本号 */
    version: string
}

export interface GetShareSwitch {
    /**游戏版本号 */
    version: string
}

export interface GetShareTemplate {
    /** 版本号 */
    version: string,
}

export interface GetServiceCount {
    name: string,
}

export interface Invitation {
    inviter_open_id: string,    //邀请用户 Open ID
    mark: string                //标记，例如可以该邀请关联什么道具
}