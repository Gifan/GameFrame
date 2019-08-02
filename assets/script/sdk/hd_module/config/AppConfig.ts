export interface DefaultUserInfo {
	/** 登录码 */
	code: string,
	/** 玩家名字 */
	nick_name: string,
	/** 性别 */
	gender: number,
	/** 头像 */
	avatar_url: string,
	/** 国家 */
	country: string,
	/** 省份 */
	province: string,
	/** 城市 */
	city: string,

	open_id: string,
}

/** 默认用户信息结构 */
export let HDDefaultUserInfo: DefaultUserInfo = {
	code: "",
	nick_name: "匿名",
	gender: 0,
	avatar_url: "",
	country: "",
	province: "",
	city: "",
	open_id: "",
}

/** 平台id */
export const EPlatform = cc.Enum({
	WeChat: 1,
	ZiJie: 2,
	Android: 3,
	IOS_SiHao: 4,
	QQ: 5,
});

const appidList = {
	[EPlatform.WeChat]: "wxc93ee93882288748",
	[EPlatform.ZiJie]: "tt1e1168ac813b90a1",
	[EPlatform.IOS_SiHao]: "shrxls166",
	[EPlatform.QQ]: "1109310519",
}

/** 服务器环境 */
export const Environment = {
	native: 0,	//本地服
	test: 1,	//测试服
	release: 2,	//正式服
}

/** APP配置 */
export let appConfig = {
	platform_id: EPlatform.WeChat,			//平台
	app_id: appidList[EPlatform.WeChat], 	//APPID
	env: Environment.native,				//服务器环境
	app_version: "1.0.0",					//app版本号
	sdk_version: "0.0.1",					//sdk版本号
};

/** 激励视频配置 */
export let videoIdList = {
	[EPlatform.WeChat]: {
		0: "adunit-88d20fd9554af003",		//钻石获取
		1: "adunit-fec852ff1007ebad",		//转盘
		2: "adunit-84f9cfc348914114",       //结算页
	},
	[EPlatform.ZiJie]: {
		0: "377u36btbwg68ah8hn",		//钻石获取
		1: "5jci2jhcdhh6124fe2",		//转盘
		2: "9fa4g0ki0ffr0188r6",       //结算页
	}
}

export let bannerIdList = {
	[EPlatform.WeChat]: {
		0: "adunit-0a1a3754b51ed661",	//签到，在线三倍
		1: "adunit-113dacb641819017",	//结算，转盘
		2: "adunit-e388f552b4bebf55",	//金币，体力
		3: "adunit-538c54d5b0ee14be",	//设置
		4: "adunit-4060d8b6871a84de",	//客服
		5: "adunit-132ebdbdabce33c2",	//邀请
		6: "adunit-6ad9ebd67ae0d7b6",	//排行
		7: "adunit-a07f952c9de507f5",	//商店
	},
	[EPlatform.ZiJie]: {
		0: "2qgeprngx5h3500ek6",	//签到，在线三倍
		1: "2qgeprngx5h3500ek6",	//结算，转盘
		2: "2qgeprngx5h3500ek6",	//金币，体力
		3: "2qgeprngx5h3500ek6",	//设置
		4: "2qgeprngx5h3500ek6",	//客服
		5: "2qgeprngx5h3500ek6",	//邀请
		6: "2qgeprngx5h3500ek6",	//排行
		7: "2qgeprngx5h3500ek6",	//商店
	}
}