/// <summary>
/// 模块调用消息定义 >= 1000
/// 格式说明:模块名称_函数名称 = XXX, 首字母大写，最好加上函数参数说明
/// 每个模块id占用必须都是1000的整数倍
/// 例如 Game_Start = 1000,
/// </summary>
export enum CallID {
    _Start = 999,

    Setting_IsMuteMusic,
    Setting_IsMuteAudio,
    Setting_IsBlockShake,
    Setting_IsHurtShow,
    Setting_GetRealDesignSize,

    Shop_HaveUnLockGoods,
}


