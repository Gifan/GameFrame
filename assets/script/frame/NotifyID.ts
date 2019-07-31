/// <summary>
/// 通知消息定义
/// 格式说明:模块名称_函数名称 = XXX, 首字母大写，最好加上函数参数说明
/// 每个模块id占用必须都是1000的整数倍
/// 例如 Game_Start = 1000,
/// </summary>
export enum NotifyID {
    // ----- 系统消息，1~999
    App_Start = 1,
    //游戏暂停 (bool pause)
    App_Pause,
    Game_Update,
    SDK_Banner_Resize,    // 广告大小变更
    Time_Scale,
    Game_onHide,
    Game_OnShow,
    OPEN_PANEL,
    CLOSE_PANEL
}


