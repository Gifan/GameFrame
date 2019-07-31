/// <summary>
/// 模块调用消息定义 >= 1000
/// 格式说明:模块名称_函数名称 = XXX, 首字母大写，最好加上函数参数说明
/// 每个模块id占用必须都是1000的整数倍
/// 例如 Game_Start = 1000,
/// </summary>
export enum ListenID {
    _Start = 999,
    // ----  登录系统

    Sdk_UpdateToken,
    Dsp_Get,
    Login_Start,
    Login_Finish,
    Login_User,

    Setting_MuteMusic,
    Setting_MuteAudio,
    Setting_BlockShake,
    Setting_HurtShow,
    Setting_Open,

    ShowBanner,
    HideBanner,
}


