
import { GameVoManager } from "../manager/GameVoManager";
import { ListenID } from "../ListenID";
import BaseProtocol, { serverUrlConfig } from "../../sdk/hd_module/net/protocol/baseprotocol";
import { appConfig } from "../../sdk/hd_module/config/AppConfig";
import BaseNet from "../frame/BaseNet";
import { Notifier } from "../frame/Notifier";
import Net, { PutKVData, GetRankData, PostRankData, PostMiniGameLogin, GetDSPInfo } from "../../sdk/hd_module/net/net";

export class ErrCode {
    public static code = {
        // "2001": "角色不存在",
        // "2002": "用户不存在",
        // "2010": "宝箱不存在",
        // "2011": "时间未到，无法领取宝箱",
        // "2012": "今日观看视频次数已达上限",
        // "2013": "宝箱已达到最高等级，无法升级",
        // "2014": "该道具不存在，请确认",
        // "2015": "数量不足，无法升级",
        // "2016": "无法重复升级宝箱",
        // "2017": "无法重复刷新宝箱奖励",
        // "2018": "宝箱还不能开启",
        // "2019": "宝箱尚未开启，无法刷新奖励",
        // "2020": "加速功能休息中！",
        // "2021": "不满足条件，请参与战斗获得奖杯!",
    };
}

let _instance: NetAdapter;

export default class NetAdapter extends Net {
    public static Init(): void {
        _instance = new NetAdapter();
    }

    /** 获取  服务器时间 */
    public static getServerTime(): Promise<any> {
        return _instance._getServerTime();
    }

    /** 获取  KVDATA */
    public static getKVData(): Promise<any> {
        return _instance._getKVData();
    }

    /** 
     * 上报  KVDATA 
     */
    public static putKVData(params: PutKVData): Promise<any> {
        /** 保存本地数据 */
        let data = params.custom_data;
        /** 上报数据 */
        if (GameVoManager.getInstance.myUserVo.isGetData) {
            return _instance._putKVData(params);
        }
        else {
            NetAdapter.getKVData().then(res => {
                if (res.data) {
                    try {
                        let data = JSON.parse(res.data.custom_data.public);
                        GameVoManager.getInstance.myUserVo.updatetUserVo(data);
                        Notifier.send(ListenID.Login_User);
                    } catch (error) {
                        console.error(error);
                    }
                }
            }).catch(err => {
                //console.log("resolve", err);
            })
            return null;
        }

    }

    /** 
     * 获取  排行榜 
     * @param params type:自定义的排行榜类型, cycle:清榜周期  'week'为一周，'forever'为永久，page：请求页数，page_size:每页的数据个数
     */
    public static getRankData(params: GetRankData): Promise<any> {
        return _instance._getRankData(params);
    }

    /** 
     * 上报  排行榜 
     * @param params type:自定义的排行榜类型, cycle:清榜周期，'week'为一周，'forever'为永久，score：分数，customData:自定义数据，例如头像
     */
    public static postRankData(params: PostRankData): Promise<any> {
        return _instance._postRankData(params);
    }

    /**
     * 上报  登录小游戏服务器(微信静默登录时自动登录)
     */
    public static postMiniGameLogin(params: PostMiniGameLogin): Promise<any> {
        return _instance._postMiniGameLogin(params);
    }

    /**
     * 获取  交叉推广数据
     */
    public static getDSPInfo(param: GetDSPInfo): Promise<any> {
        return _instance._getDSPInfo(param);
    }

    public static onlineTime(time: number = 10): Promise<any> {
        return _instance._onLineTIme(time);
    }

    /***************内部实现************************/

    /** 获取  服务器时间 */
    _getServerTime(): Promise<any> {
        return BaseProtocol.requestByConfig('serverTime', {}, null, false);
    }

    /** 获取  KVDATA */
    _getKVData(): Promise<any> {
        return BaseProtocol.requestByConfig('kvDataGet', {});
    }

    /** 
     * 上报  KVDATA 
     */
    _putKVData(params: PutKVData): Promise<any> {
        return BaseProtocol.requestByConfig('kvDataPut', params);
    }

    /** 
     * 获取  排行榜 
     * @param params type:自定义的排行榜类型, cycle:清榜周期  'week'为一周，'forever'为永久，page：请求页数，page_size:每页的数据个数
     */
    _getRankData(params: GetRankData): Promise<any> {
        return BaseProtocol.requestByConfig('rankGet', params);
    }

    /** 
     * 上报  排行榜 
     * @param params type:自定义的排行榜类型, cycle:清榜周期，'week'为一周，'forever'为永久，score：分数，customData:自定义数据，例如头像
     */
    _postRankData(params: PostRankData): Promise<any> {
        return BaseProtocol.requestByConfig('rankPost', params);
    }

    /**
     * 上报  登录小游戏服务器(微信静默登录时自动登录)
     */
    _postMiniGameLogin(params: PostMiniGameLogin): Promise<any> {
        return BaseProtocol.requestByConfig('login', params, null, false);
    }

    /**
     * 获取  交叉推广数据
     */
    _getDSPInfo(param: GetDSPInfo): Promise<any> {
        return BaseProtocol.requestByConfig('dspGet', param);
    }

    /**
     * 在线时长统计
     */
    _onLineTIme(time: number): Promise<any> {
        return BaseProtocol.requestByConfig('online', { duration: time });
    }
}
