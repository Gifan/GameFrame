/// <summary>
/// 网络消息定义
/// 格式说明:模块名称_函数名称 = XXX, 首字母大写，最好加上函数参数说明
/// 每个模块id占用必须都是1000的整数倍
/// 例如 Game_Start = 1000;
/// </summary>
export namespace MsgID {

    export const Login_Start              = 1;
    export const C2G_Sign_Info            = 2;  //请求初始化签到信息
    export const G2C_Sign_Info            = 3;  //返回初始化签到信息
    export const C2G_Sign_sign            = 4;  //请求签到
    export const G2C_Sign_sign            = 5;  //返回签到信息
    export const C2G_Shop_Info            = 6;  //请求初始化商店信息
    export const G2C_Shop_Info            = 7;  //返回初始化商店信息
    export const C2G_Shop_Buy             = 8;  //请求购买商品
    export const G2C_Shop_Buy             = 9;  //返回购买商品信息
    export const C2G_Invite_Info          = 10; //请求邀请信息
    export const G2C_Invite_Info          = 11; //返回邀请信息
    export const C2G_Invite_Award         = 12; //请求邀请领奖
    export const G2C_Invite_Award         = 13; //返回邀请领取物品
    export const C2G_Invite_Request       = 14; //接受邀请
    export const G2C_Invite_Request       = 15; //接受邀请返回
    export const C2G_Lottery_Activity     = 16; //请求抽奖
    export const G2C_Lottery_Activity     = 17; //抽奖返回
    export const C2G_Stage_Requst         = 18; //关卡结算请求
    export const G2C_Stage_Requst         = 19; //关卡结算返回
    export const C2G_Lottery_Reward       = 20; //抽奖奖励
    export const G2C_Lottery_Reward       = 21; //抽奖奖励返回
    export const C2G_Achieve_Requst       = 22; //成就结算请求
    export const G2C_Achieve_Requst       = 23; //成就结算返回
    export const C2G_Skin_Unlock          = 24; //皮肤解锁    
    export const C2G_Skin_Upgrade         = 26; //皮肤升级
    export const C2G_Skin_Equip           = 28; //皮肤选中
    export const C2G_Hero_Unlock          = 30; //伙伴解锁    
    export const C2G_Hero_Upgrade         = 32; //伙伴升级
    export const C2G_Hero_Equip           = 34; //伙伴选中
    export const C2G_Item_Use             = 36; //物品使用
    export const C2G_StageStart_Requst    = 38; //关卡开始请求
    export const G2C_StageStart_Requst    = 39; //关卡开始返回
}