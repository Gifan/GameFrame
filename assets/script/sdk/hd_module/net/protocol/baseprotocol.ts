import { appConfig, EPlatform } from "../../config/AppConfig";
import { HD_MODULE } from "../../hd_module";
declare let qq;
export const serverUrlConfig = [
	/** 本地服 */
	{
		serverUrl: "http://192.168.5.94:10000",  	//登录服务器
		commonUrl: "http://192.168.5.94:10001", 	//公共功能服务器
		counterUrl: "http://192.168.5.94:10002"	//打点服务器
	},
	/** 测试服 */
	{
		serverUrl: "https://platform-test.heidong.fun", 		//登录服务器
		commonUrl: "https://public-service-test.heidong.fun",	//公共功能服务器
		counterUrl: "https://statistics-test.heidong.fun"	//打点服务器
	},
	/** 正式服 */
	{
		serverUrl: "https://platform.heidong.fun", 		//登录服务器
		commonUrl: "https://public-service.heidong.fun",	//公共功能服务器
		counterUrl: "https://statistics.heidong.fun"	//打点服务器
	},
]

const requestConfig: { [key: string]: HDRequestItem } = {
	/** 登录 */
	login: {
		url: serverUrlConfig[appConfig.env].serverUrl + '/v1/user/login',
		method: 'POST',
		header: null,
	},
	/** 获取服务器时间 */
	serverTime: {
		url: serverUrlConfig[appConfig.env].commonUrl + '/v1/server/timestamp',
		method: 'GET',
		header: null
	},
	/** 获取KVData */
	kvDataGet: {
		url: serverUrlConfig[appConfig.env].commonUrl + '/v1/custom_data',
		method: 'GET',
		header: null
	},
	/** 上报KVData */
	kvDataPut: {
		url: serverUrlConfig[appConfig.env].commonUrl + '/v1/custom_data',
		method: 'PUT',
		header: null
	},
	/** 获取排行榜 */
	rankGet: {
		url: serverUrlConfig[appConfig.env].commonUrl + '/v1/ranking',
		method: 'GET',
		header: null
	},
	/** 上报排行榜 */
	rankPost: {
		url: serverUrlConfig[appConfig.env].commonUrl + '/v1/ranking',
		method: 'POST',
		header: null
	},
	/** 获取其他用户信息 */
	otherUserGet: {
		url: serverUrlConfig[appConfig.env].commonUrl + '/v1/custom_data/others',
		method: 'GET',
		header: null
	},
	/** 查看计数器 */
	counterGet: {
		url: serverUrlConfig[appConfig.env].commonUrl + '/v1/counter',
		method: 'GET',
		header: null
	},
	/** 获取DSP */
	dspGet: {
		url: serverUrlConfig[appConfig.env].commonUrl + '/v1/dsp',
		method: 'GET',
		header: null
	},
	/** DSP打点 */
	counterPost: {
		url: serverUrlConfig[appConfig.env].counterUrl + '/v1/source/dsp',
		method: 'POST',
		header: null
	},
	/** 跳出 */
	dspOut: {
		url: serverUrlConfig[appConfig.env].counterUrl + '/v1/source/dsp/out',
		method: 'POST',
		header: null
	},
	/** 跳入 */
	dspIn: {
		url: serverUrlConfig[appConfig.env].counterUrl + '/v1/source/dsp/in',
		method: 'POST',
		header: null
	},
	/** 游戏事件打点 */
	gameEventPost: {
		url: serverUrlConfig[appConfig.env].counterUrl + '/v1/event',
		method: 'POST',
		header: null
	},
	/** 分享配置 */
	shareConfig: {
		url: serverUrlConfig[appConfig.env].commonUrl + '/v1/server/share',
		method: 'GET',
		header: null,
	},

	/**开关配置 */
	shareSwitchGet: {
		url: serverUrlConfig[appConfig.env].commonUrl + '/v1/server/switch',
		method: 'GET',
		header: null
	},
	/**
     * 建立邀请
     */
	postInvitation: {
		url: serverUrlConfig[appConfig.env].commonUrl + '/v1/invitation',
		method: 'POST',
		header: null
	},
    /**
     * 获取邀请列表
     */
	getInvitationList: {
		url: serverUrlConfig[appConfig.env].commonUrl + '/v1/invitation',
		method: 'GET',
		header: null
	},
	/**
	 * 买量二次确认
	 */
	confirmAgain: {
		url: serverUrlConfig[appConfig.env].commonUrl + '/v1/source/confirm',
		method: 'POST',
		header: null
	},
	/** 记录分享关系 */
	sharePost: {
		url: serverUrlConfig[appConfig.env].commonUrl + '/v1/share',
		method: 'POST',
		header: null,
	},
	/** 获取今日分享次数 */
	shareGet: {
		url: serverUrlConfig[appConfig.env].commonUrl + '/v1/share/times',
		method: 'GET',
		header: null,
	},
	online: {
		url: serverUrlConfig[appConfig.env].counterUrl + '/v1/online-time',
		method: 'POST',
		header: null,
	},
	onStageStart: {
		url: serverUrlConfig[appConfig.env].counterUrl + '/v1/level/start',
		method: 'POST',
		header: null,
	},
	onStageEnd: {
		url: serverUrlConfig[appConfig.env].counterUrl + '/v1/level/end',
		method: 'POST',
		header: null,
	}
}

interface requestParam {
	login: null,
	serverTime: null,
	kvDataGet: null,
	kvDataPut: {
		custom_data: string, //custom_data 为 JSON 字符串
		type: number //1为公开数据 0为私有数据
	},
	rankGet: {
		type: string, //排行榜类型(自己规定)
		cycle: string,  //清榜周期  'week'为一周，'forever'为永久
		page: number,  //请求页数
		page_size: number, //每页的数据个数
	},
	rankPost: {
		type: string, //排行榜类型(自己规定)
		score: number, //分数
		cycle: string, //清榜周期  'week'为一周，'forever'为永久
		data?: string //data为自定义数据(例如头像，名称，还有各种自己需要用的数据)的 JSON 字符串
	}
	otherUserGet: null, //此方法特殊, 参数在url拼接 拼接参数为users_open_id=xxx&users_open_id=xxx&users_open_id=xxx， 通过BaseProtocol.requestByConfig()的urlBindParams可以将对象转成&的形式
}

export interface HDRequestItem {
	url: string, //请求地址
	method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT",
	header: { [name: string]: string }
}

export default class BaseProtocol {
    /** 
	 * 请求
	 * @param requestType 请求类型，填写requestConfig里面的key
	 * @param params 请求参数，请求数据所需要的参数，具体格式参考requestParam
	 * @param urlBindParams 将对象内的key-value转成 key=value&key=value&key=value的形式拼接在url后面
	 * @param needToken 是否需要token,默认需要，默认请求都需要，除了请求获取token不需要token
	 */
	public static requestByConfig(requestType: string, params: any, urlBindParams?: { [key: string]: any }, needToken: boolean = true): Promise<any> {
		return new Promise((resolve, reject) => {
			// console.log("request----->", serverUrlConfig[appConfig.env].serverUrl);
			// let request = () => {
			let config = requestConfig[requestType];
			if (!config) return;
			let url = config.url;
			// url += BaseProtocol.urlBindParams(urlBindParams);
			this._request(url, params, config.method, config.header).then((res) => {
				if (resolve) resolve(res);
			}).catch((err) => {
				if (reject) reject(err);
			});
			// }
			// if (needToken) {
			// 	/** 检查token是否已过期 */
			// 	let isExpire = HD_MODULE.getPlatform().getTokenIsExpire();
			// 	if (isExpire) {
			// 		EventManager.emit('login-req', { success: request, fail: request });
			// 	} else {
			// 		request();
			// 	}
			// } else {
			// 	request();
			// }
		});
	}

	private static _request(url: string, params: any, method: "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "TRACE" | "CONNECT", header): Promise<any> {
		return new Promise((resolve, reject) => {
			let reqFunc = null;
			if (cc.sys.platform == cc.sys.WECHAT_GAME)
				reqFunc = this._wxRequest;
			else if (appConfig.platform_id == EPlatform.ZiJie) {
				reqFunc = this._ttRequest;
			}
			else if (appConfig.platform_id == EPlatform.QQ)
				reqFunc = this._qqRequest;
			else
				reqFunc = this._webHttp;
			if (reqFunc)
				reqFunc(url, params, method, header).then((res) => { if (resolve) resolve(res); }).catch((err) => { if (reject) reject(err); });
		});
	}
	/** 微信请求 */
	private static _wxRequest(url, params, method, header): Promise<any> {
		return new Promise((resolve, reject) => {
			wx.request({
				url: url,
				data: params,
				method: method,
				header: header || { "content-type": "application/json", Authorization: HD_MODULE.getPlatform().getToken() },
				success: res => {
					// console.debug(`[hd_sdk_net]---------->请求 ${method} ${url} ${params} success res = ${JSON.stringify(res)}`);
					let a = res.data.code;
					let b = res.data.err;
					(0 == a) || (0 == b) ? resolve(res.data) : reject(res.data);
				},
				fail: (err) => {
					console.error("wxRequest fail", err);
					reject(err);
				}
			});
		})
	}
	/** 字节请求 */
	private static _ttRequest(url, params, method, header): Promise<any> {
		return new Promise((resolve, reject) => {
			tt.request({
				url: url,
				data: params,
				method: method,
				header: header || { "content-type": "application/json", Authorization: HD_MODULE.getPlatform().getToken() },
				success: res => {
					// console.debug(`[hd_sdk_net]---------->请求 ${method} ${url} ${params} success res = ${JSON.stringify(res)}`);
					let a = res.data.code;
					let b = res.data.err;
					(0 == a) || (0 == b) ? resolve(res.data) : reject(res.data);
				},
				fail: (err) => {
					console.error("ttRequest fail", err);
					reject(err);
				}
			});
		})
	}

	/** QQ请求 */
	private static _qqRequest(url, params, method, header): Promise<any> {
		return new Promise((resolve, reject) => {
			qq.request({
				url: url,
				data: params,
				method: method,
				header: header || { "content-type": "application/json", Authorization: HD_MODULE.getPlatform().getToken() },
				success: res => {
					// console.debug(`[hd_sdk_net]---------->请求 ${method} ${url} ${params} success res = ${JSON.stringify(res)}`);
					let a = res.data.code;
					let b = res.data.err;
					(0 == a) || (0 == b) ? resolve(res.data) : reject(res.data);
				},
				fail: (err) => {
					console.error("wxRequest fail", err);
					reject(err);
				}
			});
		})
	}

	/** Web请求 */
	private static _webHttp(url: string, params: any, method, header): Promise<any> {
		let rspType = "json";
		return new Promise((resolve, reject) => {
			let xmlHttp = new XMLHttpRequest();
			if (method == 'GET' && params) {
				url += BaseProtocol.urlBindParams(params);
			}
			xmlHttp.timeout = 7000;
			xmlHttp.open(method, url)
			xmlHttp.onreadystatechange = function () {
				if (xmlHttp.readyState == 4) {
					if (xmlHttp.status == 200) {
						if (rspType == 'json') {
							resolve(JSON.parse(xmlHttp.responseText))

						} else {
							resolve(xmlHttp.response)
						}
					} else {
						reject({ code: -1, msg: Error(`xmlHttp status = ${xmlHttp.status}`), data: {} })
					}
				} else {
					console.debug(`xmlhttp readystate ${xmlHttp.readyState}`)
				}
			}
			xmlHttp.onerror = function () {
				reject({ code: -1, msg: Error('xmlhttp something error'), data: {} })
			}

			// set request header
			switch (rspType) {
				case 'json':
					xmlHttp.setRequestHeader('content-type', 'application/json')
					xmlHttp.setRequestHeader('Authorization', HD_MODULE.getPlatform().getToken())
					break
			}
			// set reponse type ，如果是二进制，则最好是arraybuffer或者blob
			if (rspType == 'blob' || rspType == 'arraybuffer') {
				xmlHttp.responseType = rspType
			}

			xmlHttp.send(params ? JSON.stringify(params) : '');
		});
	}

	/** 拼接参数 */
	public static urlBindParams(params) {
		let postfix = "?";
		for (let key in params) {
			let value = params[key];
			postfix += `${key}=${value}&`;
		}
		postfix = postfix.slice(0, postfix.length - 1);
		return `${encodeURI(postfix)}`;
	}
}