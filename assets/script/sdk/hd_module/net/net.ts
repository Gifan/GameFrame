import BaseProtocol from "./protocol/baseprotocol";
import { DefaultUserInfo } from "../config/AppConfig";
const wx = window["wx"];
const eventNameToDesc = {
    
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