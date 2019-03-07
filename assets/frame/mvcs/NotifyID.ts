/// <summary>
/// 内部通知消息定义 1 ~ 999
/// 格式说明:模块名称_函数名称 = XXX, 首字母大写，最好加上函数参数说明
/// </summary>
export enum NotifyID {
    // ----- 系统消息，1~999
    App_Start = 1,
    //游戏暂停 (bool pause)
    App_Pause,
    //游戏窗口聚焦 (bool focus)
    App_Focus,    
    App_Quit,    

    Game_Enter,
    Game_Update,
    Game_Pause,
    View_Opened,
    View_Closed,

    Subpackage_Loaded,
    DownLoad_Fail,
    Day_Changed,

    Time_Scale,
    Mobile_Shake,
 
    SDK_IsSwitchOpen,
    SDK_SwitchConfig,
    SDK_PayResult,
    SDK_ReqShare,
    SDK_WhenShare,
    SDK_CreateTiger,
    SDK_CleanTiger,
    SDK_ReqAuth,        //请求授权
    SDK_LoadingLog,
    SDK_QueryArgs,      //打开时参数

    Invite_Feedback,
    Invite_CheckInvite,
    Invite_CheckInviteBack,
    RewardTips_OpenTxt,
    Flow_Num,

    Fight_CurAttrChanged, 
    Fight_ScoreChanged,
    Fight_ComboChanged,
    Fight_MissChanged,
    Fight_AttackFx,
    
    Role_Die,
    Actor_Init,
    Actor_Dispose,

    Login_Again,
}
