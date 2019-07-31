/// <summary>
/// 模块调用消息定义 >= 1000
/// 格式说明:模块名称_函数名称 = XXX, 首字母大写，最好加上函数参数说明
/// 每个模块id占用必须都是1000的整数倍
/// 例如 Game_Start = 1000,
/// </summary>
export enum ListenID {
    _Start = 999,
    // ----  登录系统
    Login_Start,
    Login_Finish,
    Login_User,

    Fight_BulletFinish,
    Fight_RecycleBullet,
    Fight_RecycleMonster,
    Fight_RecycleTool,
    Fight_RecycleBomb,
    Fight_RoleMove,         //人物移动
    Fight_RoleStand,        //人物站立
    Fight_MonAttack,
    Fight_SHOWEFFECT,
    Fight_SHOWEFFECT_NUM,
    Fight_Start,
    Fight_Pause,
    Fight_End,
    Fight_Restart,
    Fight_ShowGuide,
    Fight_AddTool,
    Fight_KillNumChange,    //击杀数量变化
    Fight_MonsterWarn,
    Fight_ReliveSuccess,
    Fight_StartNextStep,
    Fight_ChangeGun,
    Fight_GunUpdate,
    Fight_GunCD,
    Fight_ShowFlyGold,
    Fight_ShowImproveUI,
    Fight_Result,           //结算
    Fight_BloodWarn,
    Fight_ShowBuffUI,
    Fight_ShowShake,
    Fight_QTE_STOP,
    Fight_RecycleObj,
    Fight_QTE_STATE,
    Fight_ShowNomalTips,
    Fight_StartQte,
    Fight_ShowBossBlood,
    Fight_MonsterInfoList,
    Fight_KeepBoss,
    Fight_DownTime,
    Fight_DownTimeFinish,
    Game_UpdatePower,
    Game_UpdateGold,
    Game_FightBackToHome,
    Game_UpdateDiamond,

    GetRewardClose,

    Setting_MuteMusic,
    Setting_MuteAudio,
    Setting_BlockShake,
    Setting_HurtShow,
    Setting_Open,

    Shop_Open,
    Shop_Close,
    Shop_SelectItem,
    Shop_UnLock,
    MoreGold_Open,
    Group_UpdateSelected,
    BtnMore_Open,

    Draw_AnimEnd,           //抽奖结束
    Show_WeaponUpgrade,
    Change_Weapon,
    GoldEffect_Show,
    GoldEffect_End,
    Update_GoldRewardNum,
    Result_BackHome,        //结算页返回主界面

    Menu_Login,             //进入主界面并且已登录
    Menu_Open,
    Menu_Collect,
    UnlockNewWeapon,
    Close_MoreGoldPanel,
    Close_InviteAndService,
    Close_FreeWeapon,
    Show_GoldUpgrade,
    Show_PlayerUpgrade,
    Show_WeaponLight,

    Guide_RigisterNodeTag,
    GroupView_Open,
    NoPower,
    Stop_CountDown,
    Resume_CountDown,
    Life_On_Show,
    Life_On_Hide,
    GetInviteReward,

    SecondDay,          //第二天
    Guide_Step1_Compelete,
    ShowBanner,
    HideBanner,
    ClickBanner,
    Servive_Close,
    Invite_Close,
    GetShareTimes,
    Refresh_ShareTimes,
    Show_WeaponLockNode,
    Close_SurpassFriendView,
    Close_GetDiamondPanel,
    GetSignReward,
    Refresh_InviteWeaponNum,
    showRank,
    Refresh_Point,
    ShowBossRank,
    Open_TreasureBox,
    Refresh_Select,
    Refresh_Canopen,
    Shop_OpenBox,
    Hide_InviteWeaponIcon,
    Refresh_ShopPoint,
    Refresh_TreasureBoxPoint,
    Refresh_MoreGoldPoint,
}


