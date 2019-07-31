const NetLogger = console;
const wx = window["wx"];


/**
 * Http连接
 */
export default class BaseNet {
    /**
     * Post 请求
     *
     * @author 
     * @static
     * @param {*} url
     * @param {*} [header]
     * @param {*} [body]
     * @returns
     * @memberof BaseNet
     */
    public static httpPost(url, body?, authon?) {
        return this._http('POST', url, body, authon)
    }

    /**
     * Get 请求
     * @param url 请求地址
     * @param header header
     * @param body body
     */
    public static httpGet(url, body?, authon?) {
        return this._http('GET', url, body, authon)
    }

    public static httpDelete(url, body?, authon?) {
        return this._http('DELETE', url, body, authon);
    }

    public static httpPut(url, body?, authon?) {
        return this._http('PUT', url, body, authon);
    }

    /**
     * 微信环境会使用 wx.request
     * 非微信环境使用 XMLHttpRequest
     *
     * @private
     * @static
     * @memberof BaseNet
     */
    private static __http: (method, url, body?, authon?) => Promise<any> = null
    public static get directHttp(): (
        method,
        url,
        body?,
        authon?
    ) => Promise<any> {
        if (!this.__http) {
            this.__http = (() => {
                if (this._isWechat()) {
                    return this._wxHttp
                } else {
                    return this._webHttp
                }
            })()
        }
        return this.__http
    }

    private static _isWechat(): boolean {
        return !(typeof wx == 'undefined')
    }

    private static _http(method, url, body?, authon?): Promise<any> {
        return new Promise((resolve, reject) => {
            this.directHttp(method, url, body, authon)
                .then(res => {
                    // NetLogger.info(res)
                    if ((res.err && res.err != 0) || res.code && res.code != 0) {
                        NetLogger.warn(
                            `request ${method} ${url} ${body} res error res.err = ${
                            res.err
                            }, res.msg = ${res.msg}`
                        )
                        reject(res)
                    } else {
                        // NetLogger.debug(
                        //     `request ${method} ${url} ${body} success res = ${JSON.stringify(
                        //         res
                        //     )}`
                        // )
                        resolve(res.data)
                    }
                })
                .catch(err => {

                    NetLogger.warn(
                        `request ${method} ${url} ${body} error ${err}`
                    )
                    reject(err);
                })
        })
    }

    /**
     * 微信环境下的请求
     *
     * @author 
     * @private
     * @static
     * @param {*} method
     * @param {*} url
     * @param {*} [body]
     * @returns {Promise<any>}
     * @memberof BaseNet
     */
    private static _wxHttp(method, url, body?, authon?): Promise<any> {
        return new Promise((resolve, reject) => {
            wx.request({
                url: url,
                data: body,
                method: method,
                header: {
                    'content-type': 'application/json',
                    Authorization: authon,
                },
                success: res => {
                    // 微信的回调外面还封了一层data
                    // NetLogger.debug(res);
                    var a = res.data.code;
                    let b = res.data.err;
                    (0 == a) || (0 == b) ? resolve(res.data) : reject(res.data);
                },
                fail: err => {
                    reject({ code: -1, msg: "request请求失败", data: err });
                }
            })
        })
    }

    /**
     *浏览器环境下的请求
     *
     * @author 
     * @private
     * @static
     * @param {*} method
     * @param {*} url
     * @param {Object} [body]
     * @returns {Promise<any>}
     * @memberof BaseNet
     */
    private static _webHttp(
        method,
        url,
        body?: Object,
        authon?: string,
        rspType: XMLHttpRequestResponseType = 'json'
    ): Promise<any> {
        return new Promise((resolve, reject) => {
            let xmlHttp = new XMLHttpRequest();
            xmlHttp.timeout = 7000;
            if (method == 'GET' && body) {
                let str = "?";
                for (let k in body) {
                    if (str != "?") {
                        str += "&";
                    }
                    str += k + "=" + body[k];
                }
                url = url + str;
            }
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
                    NetLogger.debug(`xmlhttp readystate ${xmlHttp.readyState}`)
                }
            }
            xmlHttp.onerror = function () {
                reject({ code: -1, msg: Error('xmlhttp something error'), data: {} })
            }

            // set request header
            switch (rspType) {
                case 'json':
                    xmlHttp.setRequestHeader('content-type', 'application/json')
                    xmlHttp.setRequestHeader('Authorization', authon)
                    break
            }
            // set reponse type ，如果是二进制，则最好是arraybuffer或者blob
            if (rspType == 'blob' || rspType == 'arraybuffer') {
                xmlHttp.responseType = rspType
            }

            xmlHttp.send(body ? JSON.stringify(body) : '')
        })
    }
}
