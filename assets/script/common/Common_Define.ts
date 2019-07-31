import { Const } from "../config/Const";

export class Common_HttpInterface {
    /**登录 */
    public static UserLogin = "user/login";

    /**宝箱操作 */
    public static BoxTodo = "user/boxsTodo";

    /**匹配对手 */
    public static MatchPlayer = "user/getRandomUser";

    /**战斗结算 */
    public static BattleFinish = "user/battleFinish";

    /**道具升级 */
    public static GoodsUp = "user/goodsUp";

    /**获取用户用户数据 */
    public static GetUser = "/v1/custom_data";

    /**更新用户信息 */
    public static UpdateUser = "/v1/custom_data";

    /**记录日志 */
    public static Report = "report";

    /**改造 */
    public static Reform = "reform";

    /**获取token */
    public static GetJWT = "getJWT";

    /**提交分数 */
    public static updateRankScore = "ranklist";

    /**获取排行榜列表 */
    public static getRankList = "ranklist";

    /**改造 */
    public static UpdateReform = "user/reform";

    /**金手指 */
    public static testUpdate = "user/testUpdate";

    /**获取服务器时间 */
    public static serverTime = "serverTime";
}

export class Common_UIPath {
    /**设置界面ui */
    public static SettingUI = "ui/setting/SettingView";

    /**主菜单页面ui */
    public static MenuUI = "ui/menu/MenuView";

    /**战斗页面ui */
    public static FightUI = "ui/fight/FightUI";

    /**结算界面 */
    public static ResultUI = "ui/result/ResultView";

    /**复活界面 */
    public static ReliveUI = "ui/fight/ReliveView";

    /**暂停界面 */
    public static PauseUI = "ui/fight/PauseView";

    /**商店界面 */
    public static ShopUI = "ui/shop/ShopView";

    /**更多金币界面 */
    public static MoreGoldUI = "ui/moregold/MoreGoldView";

    /**邀请和客服界面 */
    public static InviteAndServiceUI = "ui/moregold/InviteAndService";

    /**成长界面 */
    public static GroupUI = "ui/group/GroupView";

    /**获得奖励展示界面 */
    public static GetRewardUI = "ui/common/GetRewardPanel";

    /**获得奖励展示界面 */
    public static GetDiamondUI = "ui/common/GetDiamondPanel";

    /**兑换金币界面 */
    public static ExchangeDiamondUI = "ui/common/ExchangeDiamond";
    
    /**免费获得金币界面 */
    public static GetFreeGold = "ui/common/GetFreeGold";
    
    /**免费试用武器界面 */
    public static GetFreeWeapon = "ui/common/GetFreeWeapon";
    
    /**解锁额外奖励界面 */
    public static GetExtraReward = "ui/common/GetExtraReward";

    /**邀请的枪界面 */
    public static InviteWeaponUI = "ui/common/InviteWeaponUI";
    
    /**前10关免费复活界面 */
    public static ReliveTipsUI = "ui/common/ReliveTipsUI";

    /**秘籍界面 */
    public static CheatUI = "ui/cheat/CheatView";

    /**新手引导界面 */
    public static GuideUI = "ui/guide/GuideView";
    
    /**新手动画引导界面 */
    public static AnimationGuideView = "ui/guide/AnimationGuideView";

    /** 新结算界面 */
    public static ResultNewUI = 'ui/result/ResultNewView';

    /** 抽奖界面 */
    public static DrawUI = 'ui/draw/DrawView';
    
    /** 主页抽奖界面 */
    public static MainDrawUI = 'ui/draw/MainDrawView';

    /**新手引导界面 */
    public static ServiceUI = "ui/service/ServiceView";

    /** 公告界面 */
    public static NoticeUI = 'ui/notice/NoticeView';

    /** 领取计时奖励 */
    public static TimeGold = 'ui/common/GetTimeGold';
    
    /** 邀请界面 */
    public static InviteUI = 'ui/invite/InvitePanel';
    
    /** 排行界面 */
    public static RankUI = 'ui/rank/RankView';
    
    /** 超越好友界面 */
    public static SurpassFriend = 'ui/rank/SurpassFriendView';

    /** 新引导系统 */
    // public static GuideNewView = 'ui/guide/GuideNewView';
    
    /** 体力兑换 */
    public static ExchangePowerUI = 'ui/common/ExchangePower';

    /** 购买武器成功界面 */
    public static WeaponRewardUI = 'ui/common/WeaponReward';

    /** banner界面 */
    public static BannerPanel = 'ui/common/BannerPanel';

    /** DSP界面 */
    public static DSPPanel = 'ui/dsp/DSPPanel';

    /** 会员UI */
    public static MemberUI = 'ui/member/MemberView';

    /** 会员每日领取界面 */
    public static MemberRewardView = 'ui/member/MemberRewardView';

    /** 主界面IOS才开启的按钮view */
    public static MenuIOSBtnView = 'ui/menu/MenuIOSButtonView';
    /**其他途径获取奖励UI */
    public static GetRewardOtherUI = 'ui/common/GetRewardOtherUI';

    /**录屏UI */
    public static RecordVideoUI = 'ui/ZiJie/ZiJieRecord';

    /**过关小诀窍ui */
    public static UpgradePanelUI = 'ui/common/UpgradePanel';

    /**boss界面 */
    public static BossRankUI = 'ui/boss/BossView';

    public static BossHelpUI = 'ui/boss/BossHelpView';
}

export declare interface AttackVo {
    insId: number,  //
    hurt: number,   //伤害值
    hitRadius?: number,//伤害半径
    bulletType?: number,//子弹类型
    belongto?: Const.BulletBelong, //0 我的，1 敌方
    hitPos?: cc.Vec2,    //攻击目标点
    hitEffectId?:number,    //受击效果id
    hitAudioId?:number,
    doubleReward?:number,
    doubleHit?:number,   //暴击
    hitDir?:cc.Vec2,         //击退方向
    hitBack?:number,        //击退距离
    showDamage?:number,
}

/**分享渠道码 */
export class ShareCode {
    public static result: string = "result";    //结算分享
    public static regular: string = "regular";  //常规分享
    public static invite: string = "invite";    //邀请
    public static shop:string = "shop"; //商店解锁
    public static service:string = "service";//客服分享
    public static home:string = "home"; //主页分享
    public static box:string = "box"; //宝箱
    public static rank:string = "rank"; //排行榜
    public static gunAway: string = "gunAway";
    public static gunTry: string = "gunTry";
    public static bossresult:string = "bossresult";//炫耀boss战
}

/**分享场景值 打点需要 */
export class ShareScene {
    public static inviteReward: string = "分享邀请进入游戏";
}