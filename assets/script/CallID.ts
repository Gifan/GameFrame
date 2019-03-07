/// <summary>
/// 模块调用消息定义 >= 1000
/// 格式说明:模块名称_函数名称 = XXX, 首字母大写，最好加上函数参数说明
/// 每个模块id占用必须都是1000的整数倍
/// 例如 Game_Start = 1000,
/// </summary>
export enum CallID {
    // ----- 系统消息，1~999
    _Start = 999,

    //----  红点系统
    Badge_Exist, //红点是否存在
    Badge_Count, //红点数量    

    //------新手引导
    Guide_IsFristTimes,

    // ----  场景系统
    Scene_GetPrevId,
    Scene_GetCurId,
    Scene_IsEnter,

    Stage_GetTotalStar,
    Stage_GetAlbumStar,
    Stage_GetCurId,
    Stage_GetNextId,
    Stage_GetLastId,    //获取可以挑战的最后一个关卡
    Stage_GetAlbumId,
    Stage_GetStage,
    Stage_IsFavor,
    Stage_GetFavors,
    Stage_GetMonsterMax,

    //----  物品系统
    Item_Get, //获取物品
    Item_FilterByType, //根据类型获取物品列表
    Item_IsEnough, //物品是否足够
    Item_IsEnoughList, //物品列表是否足够
    Item_CheckTrack, //物品是否需要追踪

    Skin_GetCurId,
    Skin_Get,

    Shop_GetList,
    Shop_GetUseId,

    Raffle_GetNum,
    Raffle_FirstTime,
    Raffle_BadgeCount,

    Chest_GetTimes,

    Setting_IsMuteMusic,
    Setting_IsMuteAudio,
    Setting_IsBlockShake,

    Sign_GetTimes,
    Sign_GetLastTime,
    Sign_BadgeCount,
    Sign_Show,

    Func_GetShareNum,
    Func_GetFirstTime,

    Invite_GetList,
    Invite_GetTurn,
    Invite_BadgeCount,

    //背景系统
    BG_GetCurId,
    BG_Get,
}
