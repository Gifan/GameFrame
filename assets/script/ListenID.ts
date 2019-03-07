/// <summary>
/// 模块通知消息定义 >= 1000
/// 格式说明:模块名称_函数名称 = XXX, 首字母大写，最好加上函数参数说明
/// 每个模块id占用必须都是1000的整数倍
/// 例如 Game_Start = 1000,
/// </summary>
export enum ListenID {
    // ----- 系统消息，1~999
    _Start = 999,

    //----  红点系统
    Badge_Changed, //红点改变
    Badge_Update, //红点单个更新

    // ----  场景系统
    Scene_AskSwitch,
    Scene_Switch,
    Scene_Loading,
    Scene_Loaded,
    Scene_RoleLoaded,
    Scene_SwitchFinish,
    Scene_LoadingViewClose,
    Scene_BackToCity,
    Scene_PlayAgain,

    // ----  功能管理系统
    Func_Unlock,
    Func_Open,
    Func_Close,

    // ----  二次确认系统
    Affirm,

    //飘字
    Flow_Num,
    Flow_Txt,
    Flow_Icon,

    // ----  登录系统
    Login_Start,
    Login_Finish,
    Login_Again,

    //----  物品系统，9000~9999
    Item_Inited, //物品初始化
    Item_Changed, //物品改变
    Item_Update, //物品单个更新
    Item_UpdateList, //物品列表更新
    Item_Awards,    //发送物品奖励,是方便填表奖励转换到Item_Update接口参数的函数
    Item_Track,

    Skin_Inited,
    Skin_Changed,
    Skin_EquipChanged,
    Skin_Update,
    Skin_Equip,

    Stage_Inited,
    Stage_Changed,
    Stage_SelectChanged,
    Stage_AlbumChanged,
    Stage_FavorChanged,
    Stage_Update,
    Stage_Start,
    Stage_ChangeAlbum,
    Stage_ChangeStage,
    Stage_ChangeFavor,
    Stage_Win,
    Stage_Fail,
    Stage_GetRose,

    Setting_MuteMusic,
    Setting_MuteAudio,
    Setting_BlockShake,

    Raffle_UpdateNum,
    Raffle_ResetNum,
    Raffle_SetTime,
    Raffle_RefreshData,

    Sign_Update,
    Sign_SetTimes,
    Sign_RefreshData,

    Shop_Use,
    Shop_Buy,
    Shop_RefreshData,

    Chest_RefreshData,
    Chest_UpdateTimes,

    Func_UpdateShareNum,
    Func_SetTime,
    Func_ResetNum,
    Func_RefreshData,

    Invite_SetGet,
    Invite_RoundEnd,
    Invite_RefreshData,
    Invite_SetTurn,

    BG_Inited,
    BG_Changed,
    BG_EquipChanged,
    BG_Update,
    BG_Equip,

    Stage_LightOff,
    Stage_TurnOffLight,
    Stage_BombLight,
    Stage_LightCursh,
    Stage_CheckFail,
}
