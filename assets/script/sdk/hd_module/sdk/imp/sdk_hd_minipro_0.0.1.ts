/**
 * 黑洞微信小程序SDK TS版
 */

declare let wx: any;

// const EPlatform = {
// 	WeChat: 1,
// 	ZiJie: 2,
// }

// /** APP配置 可在setup时修改*/
// export let appConfig = {
// 	app_id:"tt8005f6b81f2f37fd",
// 	app_secret:"a56161a5e2c332172158936419325198",
// 	program_id:"8f0e8950-9a3f-e650-741e-9777bb3f538b",
// 	program_secret:"e170d3d4e39ed71e9ee7d19708d4bfd7",
// 	sdk_version:"0.0.1",
// 	app_version:"1.0.0",
// 	platform_id: EPlatform.ZiJie,
// 	app_path: "/t1/train/release/",
// 	banner_id: 0,
// 	video_id: 0,
// };

// const serverUrlConfig = {
// 	serverUrl: "http://192.168.10.157:10000/", //数据地址
// 	commonUrl: "http://192.168.10.157:10001/", //公共服务地址
// }

// const requestConfig: {[key: string]: HDRequestItem} = {
// 	/** 登录 */
// 	login: {
// 		url: serverUrlConfig.serverUrl + 'login',
// 		method: 'POST', 
// 		header: null,
// 	},
// 	/** 获取服务器时间 */
// 	serverTime: {
// 		url: serverUrlConfig.commonUrl + 'v1/server/timestamp',
// 		method: 'GET',
// 		header: null
// 	},
// 	/** 获取KVData */
// 	kvDataGet: {
// 		url: serverUrlConfig.commonUrl + 'v1/custom_data',
// 		method: 'GET',
// 		header: null
// 	},
// 	/** 上报KVData */
// 	kvDataPut: {
// 		url: serverUrlConfig.commonUrl + 'v1/custom_data',
// 		method: 'PUT',
// 		header: null
// 	},
// 	/** 获取排行榜 */
// 	rankGet: {
// 		url: serverUrlConfig.commonUrl + 'v1/ranking',
// 		method: 'GET',
// 		header: null
// 	},
// 	/** 上报排行榜 */
// 	rankPost: {
// 		url: serverUrlConfig.commonUrl + 'v1/ranking',
// 		method: 'POST',
// 		header: null
// 	},
// 	/** 获取其他用户信息 */
// 	otherUser: {
// 		url: serverUrlConfig.commonUrl + 'v1/custom_data/others',
// 		method: 'GET',
// 		header: null
// 	},
// }

// export let HDDefaultUserInfo = {
// 	auth: false,
// 	code: "",
// 	encryptedData: "",
// 	errMsg: "",
// 	iv: "",
// 	rawData: {"nickName":"","avatarUrl":"","gender":0,"city":"","province":"","country":"中国","language":""},
// 	signature: "",
// 	userInfo: {
// 		avatarUrl: "",
// 		city: "",
// 		country: "中国",
// 		gender: 0,
// 		language: "",
// 		nickName: "",
// 		province: "",
// 	}
// }

// /** 黑洞平台SDK相关URL */
// const sdkURL = {
// 	// root: "https://xyx.9377.com/sdk/", //"http://192.168.8.175:8089",
// 	root: "http://192.168.10.157:10000/",
// 	path: {
// 		LOGIN: "/login",
// 		UPDATE_USERINFO: "/user/updateUser",
// 	}
// };

// /** 资源下载相关URL */
// const resURL = {
// 	root: "https://cdn-hdgames.9377.com/gameres/", //"http://192.168.8.132:8089",
// 	path: {
// 		CONFIG_SHARE_TEMPLATE: appConfig.app_path + appConfig.app_version + "/shareTemplates/templates.json",
// 		CONFIG_SWITCH: appConfig.app_path + appConfig.app_version + "/switch/switches.json",
// 	}
// };

/** 对象转url参数格式 */
// let postDataFormat = function(kvObj) {
// 	if (!kvObj) {
// 		return null;
// 	}
// 	let retArr = [];
// 	for (const key in kvObj) {
// 		if (kvObj.hasOwnProperty(key)) {
// 			const element = kvObj[key];
// 			retArr.push(key + "=" + element);
// 		}
// 	}
// 	return retArr.join("&");
// };

/** 字符串格式化 */
export let stringFormat = function(str: string, args: any): string {
    let result = str;
    if (str.indexOf("{") < 0 || str.indexOf("}") < 0) {
        return result;
    }
    if (arguments.length > 1) {
        if (arguments.length == 2 && typeof (args) == "object") {
            for (var key in args) {
                if(args[key]!=undefined){
                    var reg = new RegExp("({" + key + "})", "g");
                    result = result.replace(reg, args[key]);
                }
            }
        }
        else {
            for (var i = 1; i < arguments.length; i++) {
                if (arguments[i] != undefined) {
                    var reg= new RegExp("({)" + i + "(})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
    }
    return result;
}

/** http请求 */
// let xmlHttp = function(method: string, url: string, data?: any, success?: Function, failed?: Function) {
// 	let req = new XMLHttpRequest();
// 	req.open(method, url, true);
// 	req.onreadystatechange = function() {
// 		if (req.readyState == 4 && (req.status >= 200 && req.status < 400)) {
// 			var response = req.responseText;
// 			try {
// 				if (!response && failed) {
// 					failed(failed);
// 				}else {
// 					if (success) {
// 						success(response);
// 					}
// 				}
// 			} catch (e) {
// 				if (failed) {
// 					failed(response);
// 				}
// 			}
// 		}
// 	};
// 	req.onerror = function (err) {
// 		if (failed) {
// 			failed(err);
// 		}
// 	};
// 	req.send(data);
// }

/** 用户信息结构 */
// export interface HDUserInfo {
// 	uid: string; // 用户在平台的统一索引
// 	app_id: string; // 所在应用的appId
// 	open_id: string; // 用户在该应用下的open_id
// 	union_id: string; // 用户的union_id
// 	nick_name: string; // 用户的微信昵称，若该用户未调用过updateUserInfo，此值为空字符串
// 	avatar_url: string; // 用户的微信头像地址，若该用户未调用过updateUserInfo，此值为空字符串
// 	gold: number; // 用户在平台的金币数
// 	diamond: number; // 用户在平台的钻石数
// 	is_new: boolean; // 用户是否新注册的用户
// 	gender: number; // 男：1 女：0
// 	country: string; //用户国家
// 	language: string; // 用户微信里面选择使用的语言
// 	city: string; // 用户城市
// 	province: string; // 用户省份
// 	ofp: string; // uid的指纹
// }

/** 在`shareAppMessage` 和 `onShareAppMessage`传入的类型 */
// export interface HDShareMsg {
// 	title: string;
// 	imageUrl: string;
// 	channelCode: string;
// 	query?: any;
// }

// export interface HDShareTemplateItem {
// 	channel_code: string; // 渠道码
// 	title: string; // 标题
// 	image: string; // 图片地址
// 	path: string; // 小程序路径
// 	scene: string; // 场景值
// }

export interface HDRequestItem {
	url: string, //请求地址
	method: string, //请求类型 POST GET PUT DELETE
	header: string
}

export class HDMiniPro {
	/** 用户信息 */
	public static userInfo: any = null;
	/** 设备信息 */
	public static systemInfo: any = null;
	/** token */
	public static token: string = '';

	// /** 是否是微信平台 */
	// public static isWeChat(){
	// 	return (cc.sys.platform == cc.sys.WECHAT_GAME) && appConfig.platform_id == EPlatform.WeChat;
	// }

	// /** 是否是字节跳动平台 */
	// public static isZiJie(){
	// 	return (cc.sys.platform == cc.sys.WECHAT_GAME) && appConfig.platform_id == EPlatform.ZiJie;
	// }

	/**
	 * 初始化
	 * @param onShowCallback 小程序显示回调
	 * @param onHideCallback 小程序隐藏回调
	 * @param appConfigInfo 配置
	 */
	public static setup(onShowCallback?: (res: any) => void, onHideCallback?: (res: any) => void) {
		this.systemInfo = wx.getSystemInfoSync();
		//console.log("[hd_sdk]----->设备信息 ", this.systemInfo);
		
		wx.onShow((res) => {
			if(onShowCallback){
				onShowCallback(res);
			}
		});

		wx.onHide((res) => {
			if(onHideCallback){
				onHideCallback(res);				
			}
		});
	};

	/** 
	 * 主动分享
	 * 属性	类型	默认值	必填	说明
	 * title	string		否	转发标题，不传则默认使用当前小游戏的昵称。	
	 * imageUrl	string		否	转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径。显示图片长宽比是 5:4	
	 * query	string		否	查询字符串，从这条转发消息进入后，可通过 wx.getLaunchInfoSync() 或 wx.onShow() 获取启动参数中的 query。必须是 key1=val1&key2=val2 的格式。	
	 * imageUrlId	string	否	审核通过的图片 ID，详见 使用审核通过的转发图片 v2.4.3
	 */
    // public static shareAppMessage(data: any) {
	// 	return new Promise(function (resolve, reject) {
	// 		if (wx) {
	// 			wx.shareAppMessage({
	// 				title: stringFormat(data.title || "", {
	// 					version: appConfig.app_version,
	// 					name: HDMiniPro.userInfo.nick_name || HDMiniPro.userInfo.nickName,
	// 				}),
	// 				imageUrl: stringFormat(data.imageUrl || "", {
	// 					version: appConfig.app_version,
	// 					name: HDMiniPro.userInfo.nick_name || HDMiniPro.userInfo.nickName,
	// 				}),
	// 				query: data.query || "",
	// 				imageUrlId: data.imageUrlId || "",
	// 			});
	// 		}
	// 	});
	// }
	
	// /**
	//  * 请求
	//  */
	// public static requestByConfig(requestType: string, params: any): Promise<any>{
    //     return new Promise((resolve, reject) => {
	// 		let request = () => {
	// 			let config = requestConfig[requestType];
	// 			if(!config) return;
	// 			wx.request({
	// 				url: config.url,
	// 				data: params,
	// 				method: config.method,
	// 				header: config.header || {"content-type": "application/json", Authorization: this.token}, 
	// 				success: res => {
	// 					console.debug(`[hd_sdk]---------->请求 ${config.method} ${config.url} ${params} success res = ${JSON.stringify(res)}`);
	// 					resolve(res.data);
	// 				},
	// 				fail: () => {
	// 					reject();
	// 				}
	// 			});
	// 		}
	// 		/** 检查token是否已过期 */
	// 		let isExpire = this.checkToken(this.token);
	// 		if(isExpire){

	// 		}else{
	// 			request();
	// 		}
	// 	});
	// }

	// /** 检查token是否已过期 */
	// public static checkToken(token){
	// 	let isExpire = true;
	// 	if(this.token){
	// 		let decode = this.token.split('.');
	// 		let info =JSON.parse(window.atob(decode[1]));
	// 		//console.log("[hd_sdk]----->检查本地token是否过期 ", info.exp - Date.now() / 1000 <= 300);
	// 		if(info.exp - Date.now() / 1000 <= 300){//小于5分钟则过期
	// 			this.token = null;
	// 		}else{
	// 			isExpire = false;
	// 		}
	// 	}
	// 	return isExpire;
	// }
}
// export class HDMiniPro1 {
// 	/** 用户信息 */
// 	public static userInfo: any = null;
// 	/** 设备信息 */
// 	public static systemInfo: any = null;

// 	/**
// 	 * 初始化
// 	 * @param version x.x.x格式
// 	 * @param onShowCallback 小程序显示回调
// 	 * @param onHideCallback 小程序隐藏回调
// 	 */
// 	public static setup(appConfigInfo: any, onShowCallback?: (res: any) => void, onHideCallback?: (res: any) => void) {
// 		for (const key in appConfig) {
// 			if (appConfigInfo[key] != undefined) {
// 				appConfig[key] = appConfigInfo[key];
// 			}
// 		}
// 		this.systemInfo = wx.getSystemInfoSync();
// 		//console.log("设备信息 ", this.systemInfo);
// 		wx.onShow(onShowCallback);
// 		wx.onHide(onHideCallback);
// 	};

// 	/** 
// 	 * 登录 
// 	 * @param params 额外对象参数
// 	 */
//     public static login(params?: any) {
// 		let _params = params || {};
// 		return new Promise(function (resolve, reject) {
// 			// 登录到sdk服务器
// 			let loginToServer = function(code) {
// 				let req = new XMLHttpRequest();
// 				req.open('POST', sdkURL.root + sdkURL.path.LOGIN, true);
// 				req.onload = function () {
// 					if (req.status === 200) {
// 						let result = JSON.parse(req.responseText);
// 						if (result && result.code != 0) {
// 							reject(result);
// 						}else {
// 							// // //console.log("[hdsdk]登录黑洞SDK服务器成功：", result.data);
// 							HDMiniPro.userInfo = result.data;
// 							if (resolve) {
// 								resolve(result.data);
// 							}
// 						}
// 					} else {
// 						if (reject) {
// 							reject(new Error(req.statusText));
// 						}
// 					}
// 				};
// 				req.onerror = function (err) {
// 					// // //console.log("[hdsdk]登录黑洞SDK服务器 onerror ", err);
// 					if (reject) {
// 						reject(new Error(req.statusText));
// 					}
// 				};
// 				let postData = postDataFormat(appConfig);
// 				postData += ("&" + postDataFormat(_params));
// 				postData += ("&code=" + code);
// 				// // //console.log("[hdsdk]登录SDK-Post数据:", postData);
// 				req.send(postData);
// 			};
// 			// 登录微信获得code
// 			// // //console.log("[hdsdk]登录SDK3:");
// 			wx.login({
// 				success: function(res) {
// 					// // //console.log("[hdsdk]登录SDK4:", res);
// 					if (res.code) {
// 						// // //console.log("[hdsdk]登录微信:", res);
// 						loginToServer(res.code);
// 					}else {
// 						if (reject) {
// 							reject(new Error("wx.login获取code失败: " + res.errMsg));
// 						}
// 					}
// 				},
// 				fail: function(err) {
// 					// // //console.log("[hdsdk]登录SDK5:", err);
// 					if (reject) {
// 						reject(new Error(err));
// 					}
// 				},
// 				complete: function() {
// 					// // //console.log("[hdsdk]登录SDK6");
					
// 				}
// 			});
// 		});
// 	}

// 	/**
// 	 * 更新用户信息
// 	 */
// 	public static updateUserInfo(userInfo: any) {
// 		HDMiniPro.userInfo = userInfo;
// 		// // //console.log("[hdsdk]更新用户信息携带的参数:", userInfo);
// 		return new Promise(function (resolve, reject) {
// 			xmlHttp('POST', sdkURL.root + sdkURL.path.UPDATE_USERINFO, userInfo, function(response) {
// 				let result = JSON.parse(response);
// 				if(!result || result.code) {
// 					// // //console.log("[hdsdk]更新用户信息错误", result);
// 					if (reject) {
// 						reject(response);
// 						return;
// 					}
// 				}
// 				// // //console.log("[hdsdk]更新用户信息成功：", result);
// 				if (resolve) {
// 					resolve(result);
// 				}
// 			}, function(err) {
// 				// // //console.log("[hdsdk]更新用户信息失败：", err);
// 				if (reject) {
// 					reject(err);
// 				}
// 			});
// 		});
// 	}

// 	/** 
// 	 * 获取分享模版
// 	 */
//     public static getShareTemplates() {
// 		return new Promise(function (resolve, reject) {
// 			xmlHttp('GET', resURL.root + resURL.path.CONFIG_SHARE_TEMPLATE, null, function(response) {
// 				let result = JSON.parse(response);
// 				if(!result) {
// 					// // //console.log("[hdsdk]分享模板JSON解析错误");
// 					if (reject) {
// 						reject(response);
// 						return;
// 					}
// 				}
// 				// // //console.log("[hdsdk]拉取分享模板成功：", result);
// 				if (resolve) {
// 					resolve(result);
// 				}
// 			}, function(err) {
// 				// // //console.log("[hdsdk]拉取分享模板失败：", err);
// 				if (reject) {
// 					reject(err);
// 				}
// 			});
// 		});

// 	}

// 	/** 
// 	 * 主动分享
// 	 * 属性	类型	默认值	必填	说明
// 	 * title	string		否	转发标题，不传则默认使用当前小游戏的昵称。	
// 	 * imageUrl	string		否	转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径。显示图片长宽比是 5:4	
// 	 * query	string		否	查询字符串，从这条转发消息进入后，可通过 wx.getLaunchInfoSync() 或 wx.onShow() 获取启动参数中的 query。必须是 key1=val1&key2=val2 的格式。	
// 	 * imageUrlId	string	否	审核通过的图片 ID，详见 使用审核通过的转发图片 v2.4.3
// 	 */
//     public static shareAppMessage(data: any) {
// 		return new Promise(function (resolve, reject) {
// 			if (wx) {
// 				// // //console.log("[hdsdk]已请求分享: ", data);
// 				wx.shareAppMessage({
// 					title: stringFormat(data.title || "", {
// 						version: appConfig.app_version,
// 						name: HDMiniPro.userInfo.nick_name || HDMiniPro.userInfo.nickName,
// 					}),
// 					imageUrl: stringFormat(data.imageUrl || "", {
// 						version: appConfig.app_version,
// 						name: HDMiniPro.userInfo.nick_name || HDMiniPro.userInfo.nickName,
// 					}),
// 					query: data.query || "",
// 					imageUrlId: data.imageUrlId || "",
// 				});
// 			}
// 		});
// 	}

// 	/** 
// 	 * 被动分享
// 	 * 属性	类型	默认值	必填	说明
// 	 * title	string		否	转发标题，不传则默认使用当前小游戏的昵称。	
// 	 * imageUrl	string		否	转发显示图片的链接，可以是网络图片路径或本地图片文件路径或相对代码包根目录的图片文件路径。显示图片长宽比是 5:4	
// 	 * query	string		否	查询字符串，从这条转发消息进入后，可通过 wx.getLaunchInfoSync() 或 wx.onShow() 获取启动参数中的 query。必须是 key1=val1&key2=val2 的格式。	
// 	 * imageUrlId	string	否	审核通过的图片 ID，详见 使用审核通过的转发图片 v2.4.3
// 	 */
//     public static passiveShareAppMessage(callback: Function) {
// 		return new Promise(function (resolve, reject) {
// 			if (wx) {
// 				// // //console.log("[hdsdk]已请求被动分享");
// 				wx.onShareAppMessage(function() {
// 					if (callback) {
// 						return callback();
// 					}
// 				});
// 			}
// 		});
		
// 	}

// 	/** 
// 	 * 获取开关配置
// 	 */
//     public static getSwitchConfig(param?: string) {
// 		return new Promise(function (resolve, reject) {
// 			if (wx) {
// 				xmlHttp('GET', resURL.root + resURL.path.CONFIG_SWITCH, param, function(response) {
// 					let result = JSON.parse(response);
// 					if(!result) {
// 						// // //console.log("[hdsdk]开关配置JSON解析错误");
// 						if (reject) {
// 							reject(response);
// 							return;
// 						}
// 					}
// 					// //console.log("[hdsdk]获取开关配置成功：", result);
// 					if (resolve) {
// 						resolve(result);
// 					}
// 				}, function(err) {
// 					// //console.log("[hdsdk]获取开关配置失败：", err);
// 					if (reject) {
// 						reject(err);
// 					}
// 				});
// 			}
// 		});
		
// 	}

// 	/** 
// 	 * 打开客服会话
// 	 */
//     public static openCustomerService(param: any = {}) {
// 		return new Promise(function (resolve, reject) {
// 			if (wx) {
// 				let object = {
// 					sessionFrom: param.sessionFrom || "",
// 					showMessageCard: param.showMessageCard || false,
// 					sendMessageTitle: param.sendMessageTitle || "",
// 					sendMessagePath: param.sendMessagePath || "",
// 					sendMessageImg: param.sendMessageImg || "",
// 					success: function() {
// 						//console.log("[hdsdk] 客服会话接口调用成功");
// 						param.success && param.success();
// 						if (resolve) {
// 							resolve();
// 						}
// 					},
// 					fail: function() {
// 						//console.log("[hdsdk] 客服会话接口调用失败");
// 						param.fail && param.fail();
// 						if (reject) {
// 							reject();
// 						}
// 					},
// 					complete: function() {
// 						//console.log("[hdsdk] 客服会话接口调用完成");
// 						param.complete && param.complete();
// 					},
// 				};
// 				wx.openCustomerServiceConversation(object);
// 			}
// 		});
// 	}

// 	/**
// 	 * 打开或关闭banner广告
// 	 */
// 	private static __adCaches = {};
// 	public static showBannerAD(param: any = {}) {
// 		let ad_id = param.ad_id || appConfig.banner_id;
// 		let show = param.show;
// 		let forceCover = param.forceCover;
// 		let success = param.success;
// 		let failed = param.failed;
// 		return new Promise(function (resolve, reject) {
// 			if (wx) {
// 				if (!this.systemInfo) {
// 					return;
// 				}
// 				let ad = this.__adCaches[ad_id];
// 				if (forceCover) {
// 					if (ad) {
// 						ad.destroy();
// 						this.__adCaches[ad_id] = null;
// 						ad = null;
// 					}
// 				}
// 				if (show) {
// 					if (!ad) {
// 						ad = wx.createBannerAd({
// 							adUnitId: ad_id,
// 							style: {
// 								left: 0,
// 								top: this.systemInfo.screenHeight,
// 								width: this.systemInfo.screenWidth,
// 								// height: 200
// 							}
// 						});
// 						ad.onResize(res => {
// 							//console.log(res.width, res.height)
// 							//console.log(ad.style.realWidth, ad.style.realHeight)
// 							ad.style.top = this.systemInfo.screenHeight - res.height;
// 							ad.style.height = res.height;
// 						});
// 						if (resolve) {
// 							resolve(ad_id);
// 						}
// 					}
// 					if (ad) {
// 						this.__adCaches[ad_id] = ad;
// 						ad.show().catch(err => {
// 							//console.log("拉起banner广告失败：" + ad_id);
// 							if (failed) {
// 								failed(err);
// 							}
// 							if (reject) {
// 								reject(ad_id);
// 							}
// 						}).then((res) => {
// 							//console.log("拉起banner广告成功：" + ad_id);
// 							if (success) {
// 								success(res);
// 							}
// 							if (resolve) {
// 								resolve(ad_id);
// 							}
// 						});
// 						ad.onResize(res => {
// 							//console.log(res.width, res.height)
// 							//console.log(ad.style.realWidth, ad.style.realHeight)
// 							ad.style.top = this.systemInfo.screenHeight - res.height;
// 							ad.style.height = res.height;
// 						});
// 					}
// 				}else {
// 					if (ad) {
// 						ad.destroy();
// 						this.__adCaches[ad_id] = null;
// 						ad = null;
// 						if (resolve) {
// 							resolve(ad_id);
// 						}
// 					}
// 				}
// 			}
// 		});
// 	}
// }