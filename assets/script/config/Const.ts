import { ItemDefine } from "./ItemCfg";
import { IItem } from "../message/IItem";
import { SceneDefine } from "./SceneCfg";
import { AlbumDefine } from "./AlbumCfg";

export namespace Const {
    //重力加速度
    export const Gravity = -980;

    //发射力量范围,灯密度100
    export const ShootForceRange = [
        [6, 8],    //弹珠，密度0.01
        [250000, 300000],    //忍者镖，密度100
        [600, 4000],    //炸弹，密度1
        [800, 800],    //子弹，密度1
    ];

    //瞄准箭头移动范围
    export const FingerMoveRange = [50, 200];

    //每日体力
    export const DailyEnergy = 99;

    //分享获得体力数量
    export const ShareEnergy = 3;

    //每日体力分享次数
    export const EnergyShareTimes = 3;

    //每日抽奖次数
    export const DailyReward = 1;    

    //初始化数据
    export const InitSkin = {
        curSkin : 1001,
        skins :  [
            { id : 1001, lv : 1}
        ]
    }

    export const InitItem : IItem[] = [
        { id : ItemDefine.Gold, num : 0 },
        { id : ItemDefine.Energy, num : DailyEnergy, date : 0 }
    ];

    export const InitStage = {
        curAlbum : AlbumDefine.Default,
        curStage : 0,
        stages : [
            { id : SceneDefine.Frist, num : 0 },
        ]
    }

    export const InitBG = {
        curBG : 101,
        BGs :  [
            { id : 101, lv : 1}
        ]
    }

    export const SettingType = {
        music: 1,
        video: 2,
        shake: 3,
    }
}