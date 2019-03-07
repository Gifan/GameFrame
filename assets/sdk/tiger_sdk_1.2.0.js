module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 28);
/******/ })
/************************************************************************/
/******/ ({

/***/ 28:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _API = __webpack_require__(29);

var _API2 = _interopRequireDefault(_API);

var _constants = __webpack_require__(32);

var _DATA = __webpack_require__(33);

var _DATA2 = _interopRequireDefault(_DATA);

var _UTIL = __webpack_require__(30);

var _UTIL2 = _interopRequireDefault(_UTIL);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TIGER = function () {
    var errorLooperSendTiger = 0;
    /**
     * @description 限制tiger每分钟上报一次
     */
    var LIMIT_TIGER_SEND_STAMP = 1 * 60 * 1000;

    /**
     * @description 每种日志最多上报100次
     */
    var LIMIT_TIGER_SEND_TIMES = _constants.SDK_CONFIG.ENV === 'test' ? 10 : 100;

    /**
     * @description 保存当前发送tiger日志的时间, key为广告id——创意id-日志类型
     */
    var tigerLogHasSendTimes = {};

    /**
     * @description 保存当前发送tiger日志的时间, key为广告id——创意id-日志类型
     */
    var tigerLogHasSendTimeStamp = {};
    /**
     * [getEnvironmentDataPromise 一个储存获取基本信息的promise,防止多次调用浪费资源]
     */
    var getEnvironmentDataPromise = null;

    /**
     * [getEnvironmentData 获取SDK常用参数
     * @Author   Lucas
     * @DateTime 2018-08-11
     * @param    {Object}   options onLaunch和onShow里面自带的options参数
     * @return   {Object}           一个promise,当其为resolve状态时,证明所有数据都拿到并已经存在DATA里面
     */
    function getEnvironmentData(options) {
        //获取进入小程序时的参数，只有场景值为1037(从小程序进入), 1048(长按图片识别小程序码), 1012(长按图片识别二维码)才获取参数
        if (options) {
            if (options.scene) {
                options.scene = Number(options.scene); //某些机型会是字符串
            }
            _DATA2.default.set({
                tiger_options: options
            });
        }

        if (!getEnvironmentDataPromise) {
            getEnvironmentDataPromise = Promise.all([getSDKCookieId(), _UTIL2.default.getSystemInfo()]).then(function (_ref) {
                var _ref2 = _slicedToArray(_ref, 2),
                    cookieId = _ref2[0],
                    systemInfo = _ref2[1];

                _DATA2.default.set({
                    tiger_cookieId: cookieId,
                    //获取客户端设备信息
                    tiger_systemInfo: systemInfo
                });
            });
        }
        return getEnvironmentDataPromise;
    }

    /**
     * [getCookieId 获取用户的cookieid]
     * @Author     Lucas
     * @DateTime 2018-08-08
     * @return     {String}     一个用户唯一标识,存在客户端,每次进来都会检查储存里面是否有cookieid,如果没有则返回,否则创建一个并存进储存,再返回
     */
    function getSDKCookieId() {
        var USER_TID_STORAGE_KEY = _constants.STORAGE_KEYS.USER_TID_STORAGE_KEY;
        return Promise.resolve().then(function () {
            return _UTIL2.default.getStorage(USER_TID_STORAGE_KEY);
        }).then(function (cookieId) {
            if (!cookieId) {
                cookieId = "" + Date.now() + Math.floor(Math.random() * 1e7);
                return _UTIL2.default.setStorage(USER_TID_STORAGE_KEY, cookieId);
            } else {
                return cookieId;
            }
        });
    }

    /**
     * @description 获取options中传过来的tiger信息，从referrerInfo上面获取，并且场景值为1037（从小程序进入）
     */
    function getTigerInfo() {
        var tiger_options = _DATA2.default.get('tiger_options') || {};
        if (tiger_options.scene && [1037].indexOf(tiger_options.scene) > -1) {
            var referrerInfo = tiger_options.referrerInfo || {};
            var extraData = referrerInfo.extraData || {};
            var tiger_info = extraData.tiger_info || {};
            return tiger_info;
        } else {
            return {};
        }
    }

    /**
     * @description 获取options中传过来的tiger列表，从referrerInfo上面获取，并且场景值为1037（从小程序进入）
     */
    function getTigerList() {
        var tiger_options = _DATA2.default.get('tiger_options') || {};
        if (tiger_options.scene && [1037].indexOf(tiger_options.scene) > -1) {
            var referrerInfo = tiger_options.referrerInfo || {};
            var extraData = referrerInfo.extraData || {};
            var tiger_list = extraData.tiger_list || [];
            return tiger_list;
        } else {
            return [];
        }
    }

    /**
     * @description 获取二维码跳转后的参数, 并且场景值为二维码跳转场景值1048（长按识别小程序码），1012（长按识别二维码）
     */
    function getQrcodeTiger() {
        var tiger_options = _DATA2.default.get('tiger_options') || {};
        if (tiger_options.scene && [1048, 1012].indexOf(tiger_options.scene) > -1) {
            var query = tiger_options.query || {};
            var scene = _UTIL2.default.parseQuery(decodeURIComponent(query.scene));
            return scene;
        } else {
            return {};
        }
    }

    /**
     * @author derick
     * @description 上报行为数据
     * @param {String} logType 类型
     *
     */
    function sendTigerBehaviour(logType) {
        var qrCodeTiger = getQrcodeTiger();
        var list = getTigerList();
        var isQrocdeType = qrCodeTiger.qcid && qrCodeTiger.qpid;
        var nowStamp = Date.now();
        if (isQrocdeType) {
            logType = logType == 'call' ? 'qrcodeCall' : logType == 'register' ? 'qrcodeRegister' : logType;
            list = [{
                tiger_position_id: qrCodeTiger.qpid,
                creative_id: qrCodeTiger.qcid
            }];
        }
        list = list.filter(function (_ref3) {
            var tiger_position_id = _ref3.tiger_position_id,
                creative_id = _ref3.creative_id;
            //过滤掉还在1分钟内的
            var tigerUnitKey = tiger_position_id + '_' + creative_id + '_' + logType;
            var hasSendStamp = tigerLogHasSendTimeStamp[tigerUnitKey];
            if (hasSendStamp && nowStamp - hasSendStamp < LIMIT_TIGER_SEND_STAMP ||
            //限制一分钟一种日志只有一次上报
            tigerLogHasSendTimes[tigerUnitKey] >= LIMIT_TIGER_SEND_TIMES) {
                //限制最大次数
                return false;
            } else {
                return true;
            }
        });
        if (list.length) {
            return Promise.resolve().then(function () {
                return packLogData(logType, { list: list });
            }).then(function (data) {
                return _API2.default.postTigerBehaviour(data);
            }).then(function (data) {
                list.forEach(function (_ref4) {
                    var tiger_position_id = _ref4.tiger_position_id,
                        creative_id = _ref4.creative_id;

                    var tigerUnitKey = tiger_position_id + '_' + creative_id + '_' + logType;
                    tigerLogHasSendTimeStamp[tigerUnitKey] = Date.now();
                    tigerLogHasSendTimes[tigerUnitKey] = tigerLogHasSendTimes[tigerUnitKey] || 0;
                    tigerLogHasSendTimes[tigerUnitKey] += 1;
                });
                errorLooperSendTiger = 0;
                return data;
            }).catch(function () {
                if (errorLooperSendTiger < 5) {
                    errorLooperSendTiger += 1;
                    return sendTigerBehaviour(logType);
                } else {
                    errorLooperSendTiger = 0;
                }
            });
        }
    }

    /**
     * [packLogData 打包发LOG时的参数]
     * @Author     Lucas
     * @DateTime 2018-08-09
     * @param    {String}                    logType 打点的类型, login_in login_out share等
     * @param    {Object}                    当logType为event的时候,此参数为时间打点的参数；否则,则为覆盖ext的参数
     * @return     {Object}                     打点时需要的传的参数
     */
    function packLogData(logType, options) {
        var filterExt = function filterExt(ext) {
            for (var key in ext) {
                if (_UTIL2.default.getVariableType(ext[key]) === 'Object') ext[key] = filterExt(ext[key]);
                if (ext[key] === null || ext[key] === undefined || ext[key] === '' || _UTIL2.default.isEmptyObject(ext[key])) {
                    delete ext[key];
                }
            }
            return ext;
        };

        var tiger_info = getTigerInfo(),
            _DATA$get = _DATA2.default.get('tiger_systemInfo'),
            system = _DATA$get.system,
            brand = _DATA$get.brand,
            version = _DATA$get.version,
            model = _DATA$get.model,
            platform = _DATA$get.platform,
            SDKVersion = _DATA$get.SDKVersion,
            dspType = ['call', 'register', 'qrcodeRegister', 'qrcodeCall'],
            deviceData = logType && dspType.indexOf(logType) > -1 ? { // 当loginType属于dsp类型下的时候，才需要对device进行过滤
            'system': system,
            'brand': brand,
            'version': version,
            'model': model,
            'platform': platform,
            'SDKVersion': SDKVersion
        } : _DATA2.default.get('tiger_systemInfo'),
            data = {
            n: 'tiger_sdk',
            v: tiger_info.v,
            v2: _constants.SDK_CONFIG.VERSION,
            device: deviceData
        };


        var ext = {
            ak: tiger_info.ak,
            aid: tiger_info.aid,
            path: _UTIL2.default.isRuningMiniPro() ? _UTIL2.default.getCurrentFullUrl() : '',
            type: logType,
            tid: tiger_info.tid,
            tid2: _DATA2.default.get('tiger_cookieId'),
            uid: tiger_info.uid,
            pid: tiger_info.pid,
            uidfp: tiger_info.uidfp,
            uid2: _DATA2.default.get('tiger_uid')
        };

        if (options) {
            Object.assign(ext, options);
        }

        data.ext = filterExt(ext);
        return {
            userLog: data
        };
    }

    /**
     * [lifeCycleHooksCalls 如果开发者在页面中调用多次onHide/onShow等监听后，则onHide/onShow后会发多条log，这里需要做一个记录防止重复]
     * @type {Object}
     */
    var lifeCycleHooksCalls = {};

    /**
     * [lifeCycleHooks 定义小程序/游戏中生命自周期的统计事件]
     * @type {Object}
     */
    var lifeCycleHooks = {
        /**
         * [onAppLaunch App onLaunch的时候调用]
         * @Author   Lucas
         * @DateTime 2018-08-11
         * @param    {Object}   options onLauch带入的参数
         */
        onAppLaunch: function onAppLaunch(options) {},


        /**
         * [onAppShow App onShow的时候调用]
         * @Author   Lucas
         * @DateTime 2018-08-11
         * @param    {Object}   options onShow带入的参数
         */
        onAppShow: function onAppShow(options) {
            console.log('tiger appShow options: ', options);
            getEnvironmentData(options).then(function () {
                sendTigerBehaviour('call');
            });
        },


        /**
         * [onGameShow 给小游戏用的onShow事件，劫持做log发送]
         * @Author   Lucas
         * @DateTime 2018-08-18
         */
        onGameShow: function onGameShow() {
            wx.onShow(function (options) {
                console.log('tiger appShow options: ', options);
                getEnvironmentData(options).then(function () {
                    sendTigerBehaviour('call');
                });
            });
        }
    };

    /**
     * @description 监听应用onLanuch后的promise， 用于某些在lanuch之后执行的函数
     */
    var appLanuchPromise = new Promise(function (resolve, reject) {
        if (_UTIL2.default.isRuningMiniPro()) {
            _UTIL2.default.addPreHook('App', {
                'onLaunch': function onLaunch(options) {
                    resolve(options);
                }
            });
        } else if (_UTIL2.default.isRuningMiniGame()) {
            var launchOptions = wx.getLaunchOptionsSync();
            resolve(launchOptions);
        } else {
            console.error('当前环境不是微信小程序环境');
        }
    });

    /**
     * [miniGameHooks 小游戏需要打点的钩子]
     */
    var miniGameHooks = {
        onShow: lifeCycleHooks.onGameShow

        /**
         * Statistic类构造器
         */
    };
    var _TIGER_SDK = function () {
        function _TIGER_SDK() {
            _classCallCheck(this, _TIGER_SDK);

            if (_UTIL2.default.isRuningMiniPro()) {
                /**
                 * 劫持App的钩子函数,打点用
                 */
                _UTIL2.default.addPreHook('App', {
                    'onLaunch': lifeCycleHooks.onAppLaunch,
                    'onShow': lifeCycleHooks.onAppShow
                });
            }

            if (_UTIL2.default.isRuningMiniGame()) {
                /**
                 * 要把里面的钩子先执行一遍，防止开发者没有初始化这些钩子。部分钩子需要初始化，比如onSHow/onHide，防止开发者没有定义。但是shareAppMessage初始化，因为这是主动分享
                 */
                for (var hookName in miniGameHooks) {
                    this[hookName] = miniGameHooks[hookName];
                    if (hookName !== 'shareAppMessage') miniGameHooks[hookName]();
                }
            }
        }

        /**
         * @author derick
         * @description tiger注册事件，注意，只有新用户才需要调用该接口，上报注册日志（老用户无需调用该接口）
         * @param {string} openId 微信小程序登录的唯一用户标识
         */


        _createClass(_TIGER_SDK, [{
            key: 'sendRegisterInfo',
            value: function sendRegisterInfo() {
                var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                    openId = _ref5.openId;

                if (!openId) {
                    console.error('请传入正确的openId, 传入的格式为{openId: open_id}, open_id的是微信小程序登录的唯一用户标识');
                } else {
                    _DATA2.default.set({
                        tiger_uid: openId
                    });
                    appLanuchPromise.then(function (data) {
                        getEnvironmentData().then(function () {
                            sendTigerBehaviour('register');
                        });
                    });
                }
            }
        }]);

        return _TIGER_SDK;
    }();

    return new _TIGER_SDK();
}();

module.exports = TIGER;

/***/ }),

/***/ 29:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _UTIL = __webpack_require__(30);

var _UTIL2 = _interopRequireDefault(_UTIL);

var _general = __webpack_require__(31);

var _general2 = _interopRequireDefault(_general);

var _constants = __webpack_require__(32);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /**
                                                                                                                                                           * make API
                                                                                                                                                           * @Author     Lucas
                                                                                                                                                           * @DateTime 2018-08-08
                                                                                                                                                           * @return     {OBJECT}     [API类,在SDK内使用,API在里面定义]
                                                                                                                                                           */


var API = function () {
    /**
     * [findUsableHostPromise 一个储存获取可用域名的promise,防止多次调用浪费资源]
     * @type {[type]}
     */
    var findUsableHostPromise = null;

    /**
     * [LOG_HOST 打LoG接口域名]
     * @type {Object}    打LOG请求的HOST列表
     */
    var LOG_HOST = {
        test: 'https://test.kuaiyugo.com',
        prod: 'https://h5game-log.kuaiyugo.com'

        /**
         * [API_LIST 接口地址]
         * @type {Object}    API请求的地址列表
         */
    };var API_LIST = {
        tigerBehaviour: function tigerBehaviour() {
            return LOG_HOST[_constants.SDK_CONFIG.ENV] + '/api/tiger/v1/collect_user_behaviour';
        }

        /**
         * [normalApiList 接口参数定义]
         * @type {Object}    API请求的METHOD DATA 等参数处理
         */
    };var normalApiList = {
        /**
         * @description 发送记录
         */
        postTigerBehaviour: {
            method: 'POST',
            urlMaker: function urlMaker(options) {
                return API_LIST.tigerBehaviour();
            },
            dataMaker: function dataMaker(data) {
                return data;
            }
        }

        /**
         * [generateNormalApi 接口生成器,根据normalApiList构造接口]
         * @Author     Lucas
         * @DateTime 2018-08-08
         * @param        {String}        options.apiName            API的名字, 比如invitation_share_materials
         * @param        {Function}     options.urlMaker            该API的请求地址处理方法,return值为最终请求地址,return值一般为String
         * @param        {Function}     options.dataMaker        该API的请求参数处理方法,return值为最终请求参数,return值一般为Object
         * @param        {String}        options.method                GET POST PUT等
         * @param        {Function}     options.headerMaker    该API的请求头的处理方法,return值为最终请求头参数,return值一般为Object
         * @return     {Object}                                                        一个Promise对象,请求成功时resolve, 否则reject
         */
    };function generateNormalApi(_ref) {
        var apiName = _ref.apiName,
            urlMaker = _ref.urlMaker,
            dataMaker = _ref.dataMaker,
            _ref$method = _ref.method,
            method = _ref$method === undefined ? 'GET' : _ref$method,
            _ref$noLog = _ref.noLog,
            noLog = _ref$noLog === undefined ? false : _ref$noLog,
            headerMaker = _ref.headerMaker;
        // 默认所有API都需要登录
        return function () {
            var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
            return Promise.resolve().then(function () {
                return _general2.default.networkRelink();
            }).then(function () {
                return _UTIL2.default.promiseFy(wx.request, {
                    url: urlMaker(options),
                    method: method,
                    data: dataMaker && dataMaker(options),
                    header: headerMaker ? headerMaker(options) : getHeader()
                });
            }).then(function (res) {
                var result = _UTIL2.default.normalizeRes(res);
                try {
                    if (!noLog) {
                        console.warn('发起请求:' + method + urlMaker(options));
                        console.warn('请求Header: ' + JSON.stringify(headerMaker ? headerMaker(options) : getHeader()));
                        console.warn('请求body: ' + JSON.stringify(dataMaker && dataMaker(options)));
                        console.warn('请求response: ', res);
                        console.warn('返回: ', result);
                    }
                } catch (e) {
                    console.error('请求日志打印时报错' + e);
                }
                if (result.code === 200) {
                    return Promise.resolve(result.data);
                } else {
                    return Promise.reject(result);
                }
            }).catch(function (res) {
                var result = _UTIL2.default.normalizeRes(res);
                try {
                    console.warn('发起请求:' + method + urlMaker(options));
                    console.warn('请求Header: ' + JSON.stringify(headerMaker ? headerMaker(options) : getHeader()));
                    console.warn('请求body: ' + JSON.stringify(dataMaker && dataMaker(options)));
                    console.warn('请求response: ', res);
                    console.warn('返回: ', result);
                } catch (e) {
                    console.error('请求日志打印时报错' + e);
                }
                return Promise.reject(result);
            });
        };
    }

    /**
     * [makeApis 根据normalApiList快速制造API接口]
     * @Author     Lucas
     * @DateTime 2018-08-08
     * @return     {undefined}     该方法把上面定义的normalApiList的列表构造成真正的api接口,挂在_API里面,其实例便拥有所以这些API方法
     */
    function makeApis() {
        for (var fnName in normalApiList) {
            var config = normalApiList[fnName];
            config.apiName = fnName;
            this[fnName] = generateNormalApi(config);
        }
        for (var url in API_LIST) {
            this.API_LIST = this.API_LIST || {};
            this.API_LIST[url] = API_LIST[url];
        }
    }

    /**
     * [getHeader 发送请求时,获取默认header参数]
     * @Author     Lucas
     * @DateTime 2018-08-08
     * @return     {Object}     一个构造默认请求头对象的方法
     */
    function getHeader() {
        var HEADER = {
            'content-type': 'application/json'
        };
        return HEADER;
    }

    /**
     * API类构造器
     */

    var _API = function _API() {
        _classCallCheck(this, _API);

        makeApis.call(this);
    };

    return new _API();
}();

exports.default = API;

/***/ }),

/***/ 30:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * make UTIL
 * @Author     Lucas
 * @DateTime 2018-08-08
 * @return     {OBJECT}     [UTIL类,在SDK内部使用]
 */
var UTIL = function () {
    /**
     * UTIL类构造器
     */
    var _UTIL = function () {
        function _UTIL() {
            _classCallCheck(this, _UTIL);
        }

        /**
         * [addPreHook 劫持Page对象里的钩子函数]
         * @Author     Lucas
         * @DateTime 2018-08-08
         * @param        {String}     nativeObject 需要更改的全局native对象, 比如： 'App', 'Page'
         * @param        {Object}     preHookConfigs 需要添加preHook的配置对象
         */


        _createClass(_UTIL, [{
            key: 'addPreHook',
            value: function addPreHook(nativeObject, preHookConfigs) {
                var NEED_RETURN_HOOKS = ['onShareAppMessage']; //需要return的小程序函数, 用Page定义的覆盖默认设定的
                var NATIVE_CONSTRUCTOR = null;
                if (nativeObject === 'App') NATIVE_CONSTRUCTOR = App;
                if (nativeObject === 'Page') NATIVE_CONSTRUCTOR = Page;
                var NATIVE_FUNCTION = function NATIVE_FUNCTION() {
                    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                    var _loop = function _loop(hookName) {
                        var preHookFn = preHookConfigs[hookName] || function () {};
                        if (options[hookName]) {
                            var oldHook = options[hookName];
                            options[hookName] = function () {
                                var _this = this;

                                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                                    args[_key] = arguments[_key];
                                }

                                if (NEED_RETURN_HOOKS.indexOf(hookName) > -1) {
                                    var oldHookReturnValue = oldHook.apply(this, args);
                                    return preHookFn.call.apply(preHookFn, [this, oldHookReturnValue].concat(args));
                                } else {
                                    var preHookFnRes = preHookFn.apply(this, args);
                                    var isPreHookPromise = preHookFnRes && preHookFnRes.then;
                                    if (isPreHookPromise) {
                                        preHookFnRes.then(function () {
                                            return oldHook.apply(_this, args);
                                        });
                                    } else {
                                        oldHook.apply(this, args);
                                    }
                                }
                            };
                        } else {
                            options[hookName] = preHookFn;
                        }
                    };

                    for (var hookName in preHookConfigs) {
                        _loop(hookName);
                    }
                    NATIVE_CONSTRUCTOR(options);
                };
                if (nativeObject === 'App') App = NATIVE_FUNCTION;
                if (nativeObject === 'Page') Page = NATIVE_FUNCTION;
            }

            /**
             * @description 解析?a=b&c=d为{a:b,c:d}
             */

        }, {
            key: 'parseQuery',
            value: function parseQuery(query) {
                if (typeof query == 'string' && query.indexOf('=') > -1) {
                    var outPutList = {};
                    try {
                        var queryArr = query.indexOf('?') > -1 ? query.split('?')[1].split('&') : query.split('&');
                        queryArr.forEach(function (item) {
                            var queryItem = item.split('=');
                            if (queryItem && queryItem.length > 1) {
                                outPutList[queryItem[0]] = queryItem[1];
                            }
                        });
                    } catch (err) {}
                    return outPutList;
                } else {
                    return {};
                }
            }

            /**
             * [normalizeRes 标准化接口返回值]
             * @Author     Lucas
             * @DateTime 2018-08-08
             * @param        {Object}     res API返回的结果
             * @return     {Object}             [API返回结果标准化输出结果]
             */

        }, {
            key: 'normalizeRes',
            value: function normalizeRes(res) {
                var isMiniProgramRes = res.errMsg || res.statusCode;
                var result = {};
                if (isMiniProgramRes) {
                    if (res.data) {
                        result = {
                            err: res.data.err || 0,
                            code: res.statusCode,
                            message: res.data.msg,
                            data: res.data.data
                        };
                    } else {
                        result = {
                            err: 1,
                            code: res.statusCode || 999,
                            message: res.errMsg
                        };
                    }
                } else {
                    result = {
                        err: res.err,
                        code: res.statusCode,
                        message: typeof res === 'string' ? res : res.msg,
                        data: res.data
                    };
                }
                return result;
            }

            /**
             * [promiseFy 把wx对象里面的方法封装成promise]
             * @Author     Lucas
             * @DateTime 2018-08-08
             * @param        {function}     miniProgramFn 小程序方法,比如：wx.request
             * @param        {Object}     options             正成使用该方法时需要穿的参数,比如: {url: 'xx', data: {}}
             * @return     {Object}                                 返回一个Promise对象,把第一个传进来的方法包装成promise
             */

        }, {
            key: 'promiseFy',
            value: function promiseFy(miniProgramFn, options) {
                var _this2 = this;

                var args = {};
                if (options) {
                    for (var key in options) {
                        args[key] = options[key];
                    }
                }
                return new Promise(function (resolve, reject) {
                    args.success = function (res) {
                        if (res.statusCode === 200 || res.errMsg.indexOf(':ok') > -1) {
                            resolve(res);
                        }
                    };
                    args.fail = function (res) {
                        reject(_this2.normalizeRes(res));
                    };
                    if (miniProgramFn) {
                        miniProgramFn.call(wx, args);
                    } else {
                        reject({
                            message: 'miniProgramFn is not defined'
                        });
                    }
                });
            }

            /**
             * [addQuery 把url参数加到url上]
             * @Author     Lucas
             * @DateTime 2018-08-08
             * @param        {String}     url    需要添加参数的url地址, 比如：/pages/index/index?a=1
             * @param        {Object}     args 需要加的参数, 比如: {b:2, c:3}
             * @return     {String}     加完参数后的url,比如：/pages/index/index?a=1&b=2&c=3
             */

        }, {
            key: 'addQuery',
            value: function addQuery() {
                var url = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
                var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

                var queryString = this.stringifyQuery(args);
                if (queryString) {
                    if (url.indexOf('?') > -1) {
                        return url + '&' + queryString;
                    } else {
                        return url + '?' + queryString;
                    }
                } else {
                    return url;
                }
            }

            /**
             * [stringifyQuery 把对象里面的参数转化成url参数,以&链接]
             * @Author     Lucas
             * @DateTime 2018-08-09
             * @param        {Object}     args 需要序列化的参数对象,比如：{a:1, b:2}
             * @return     {String}                序列化后的参数,以&连接, 比如：a=1&b=2
             */

        }, {
            key: 'stringifyQuery',
            value: function stringifyQuery() {
                var args = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                var queryArray = [];
                for (var argName in args) {
                    var arg = args[argName];
                    if (typeof arg === 'string') {
                        arg = arg;
                    } //JSON.stringify('xx') !== "xx"
                    else if (typeof arg === 'number' && isNaN(arg)) {
                            arg = 'NaN';
                        } //JSON.stringify(NaN) === null
                        else if (typeof arg === 'undefined') {
                                arg = 'undefined';
                            } //JSON.stringify(undefined) === undefined
                            else {
                                    arg = JSON.stringify(arg);
                                }
                    queryArray.push([argName + '=' + arg]);
                }
                return queryArray.join('&');
            }

            /**
             * [getCurrentRoute 获取当前小程序路径]
             * @Author     Lucas
             * @DateTime 2018-08-08
             * @return     {String}     当前页面路径,比如： /pages/index/index；注意：不带?以及后面参数
             */

        }, {
            key: 'getCurrentRoute',
            value: function getCurrentRoute() {
                var pages = getCurrentPages();
                return pages[pages.length - 1] ? '/' + pages[pages.length - 1].route : 'pages/index/index';
            }

            /**
             * [getCurrentOptions 获取当前小程序页面参数]
             * @Author     Lucas
             * @DateTime 2018-08-08
             * @return     {Object}     获取当前页面的页面参数,如为空则返回{}
             */

        }, {
            key: 'getCurrentOptions',
            value: function getCurrentOptions() {
                var pages = getCurrentPages();
                var currentOptions = pages[pages.length - 1] ? pages[pages.length - 1].options : {};
                return currentOptions;
            }

            /**
             * [getCurrentFullUrl 获取当前小程序完整url,包括路径和参数]
             * @Author     Lucas
             * @DateTime 2018-08-08
             * @return     {String}     当前页面地址,包括路径和参数,比如： /pages/index/index?a=1
             */

        }, {
            key: 'getCurrentFullUrl',
            value: function getCurrentFullUrl() {
                var currentRoute = this.getCurrentRoute();
                var currentOptions = this.getCurrentOptions();
                return this.addQuery(currentRoute, currentOptions);
            }

            /**
             * [getNetWorkStatus 获取当前当前网络状态]
             * @Author     Lucas
             * @DateTime 2018-08-08
             * @return     {Object}     获取网络状态的promise
             */

        }, {
            key: 'getNetWorkStatus',
            value: function getNetWorkStatus() {
                var _this3 = this;

                if (!this.getNetWorkStatusPromise) {
                    this.getNetWorkStatusPromise = this.promiseFy(wx.getNetworkType);
                    wx.onNetworkStatusChange(function (res) {
                        _this3.currNetWorkType = res.networkType;
                    });
                };
                return Promise.resolve().then(function () {
                    return _this3.getNetWorkStatusPromise;
                }).then(function (res) {
                    if (_this3.currNetWorkType) {
                        return _this3.currNetWorkType;
                    } else {
                        return res.networkType;
                    }
                }).catch(function (res) {
                    return {};
                });
            }

            /**
             * [getSystemInfo 获取当前当前设备信息]
             * @Author     Lucas
             * @DateTime 2018-08-08
             * @return     {Object} 获取客户端信息的promise
             */

        }, {
            key: 'getSystemInfo',
            value: function getSystemInfo() {
                return this.promiseFy(wx.getSystemInfo).catch(function (res) {
                    return {};
                });
            }

            /**
             * [getLocationInfo 获取用户地理位置]
             * @Author     Lucas
             * @DateTime 2018-08-08
             * @return     {Object}     获取用户地址的promise
             */

        }, {
            key: 'getLocationInfo',
            value: function getLocationInfo() {
                return this.promiseFy(wx.getLocation, { type: "wgs84" }).catch(function (res) {
                    return {};
                });
            }

            /**
             * [setStorage 把数据设进storage]
             * @Author     Lucas
             * @DateTime 2018-08-08
             * @param        {String}     key            需要set进storage的键
             * @param        {String|Object}        data 需要set进storage的值
             * @return    {Object}                        设置Storage的promise
             */

        }, {
            key: 'setStorage',
            value: function setStorage(key, data) {
                return this.promiseFy(wx.setStorage, { key: key, data: data }).then(function () {
                    return data;
                }).catch(function () {});
            }

            /**
             * [getStorage 异步从storage里面拿数据]
             * @Author     Lucas
             * @DateTime 2018-08-09
             * @param        {String}     key    需要获取的储存的键
             * @return     {String|Object}    获取Storage的promise
             */

        }, {
            key: 'getStorage',
            value: function getStorage(key) {
                return this.promiseFy(wx.getStorage, { key: key }).then(function (res) {
                    return res.data;
                }).catch(function () {
                    return '';
                });
            }

            /**
             * [getStorageSync 从storage里面拿数据]
             * @Author     derick
             * @DateTime 2018-08-09
             * @param        {String}     key    需要获取的储存的键
             */

        }, {
            key: 'getStorageSync',
            value: function getStorageSync(key) {
                try {
                    return wx.getStorageSync(key);
                } catch (err) {
                    return '';
                }
            }

            /**
             * [isRuningMiniPro 是否在小程序环境]
             * @Author   Lucas
             * @DateTime 2018-08-11
             * @return   {Boolean}  true为在小程序内,false为不在
             */

        }, {
            key: 'isRuningMiniPro',
            value: function isRuningMiniPro() {
                return typeof getApp === 'function' && typeof GameGlobal == 'undefined' && typeof wx !== 'undefined';
            }

            /**
             * [isRuningMiniGame 是否在小游戏环境里]
             * @Author   Lucas
             * @DateTime 2018-08-11
             * @return   {Boolean}  true为在小游戏内,false为不在
             */

        }, {
            key: 'isRuningMiniGame',
            value: function isRuningMiniGame() {
                return typeof getApp !== 'function' && typeof GameGlobal !== 'undefined' && typeof wx !== 'undefined';
            }

            /**
             * [isEmptyObject 验证是否空对象]
             * @Author   Lucas
             * @DateTime 2018-08-11
             * @param    {Object}   obj 需要检验的对象
             * @return   {Boolean}      是否为空对象
             */

        }, {
            key: 'isEmptyObject',
            value: function isEmptyObject() {
                var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                return JSON.stringify(obj) === '{}';
            }

            /**
             * [getVariableType 获取变量的准确数据类型]
             * @Author   Lucas
             * @DateTime 2018-08-14
             * @param    {Object}   varable [变量]
             * @return   {String}           [数据类型,比如: String, Object, Array 等]
             */

        }, {
            key: 'getVariableType',
            value: function getVariableType(variable) {
                return Number.isNaN(variable) ? NaN : Object.prototype.toString.call(variable).slice(8, -1);
            }

            /**
             * [deepClone 深拷贝对象]
             * @Author   Lucas
             * @DateTime 2018-08-14
             * @param    {Object}   obj [需要被拷贝的对象]
             * @return   {Object}       [拷贝完毕后的对象]
             */

        }, {
            key: 'deepClone',
            value: function deepClone(obj) {
                var objType = this.getVariableType(obj);
                var result = void 0;
                if (objType === 'Object') result = {};
                if (objType === 'Array') result = [];
                if (!result) return obj;
                for (var k in obj) {
                    var child = obj[k];
                    var childType = this.getVariableType(child);
                    var needDeepClone = childType === 'Object' || childType === 'Array';
                    if (needDeepClone) {
                        result[k] = this.deepClone(child);
                    } else {
                        result[k] = child;
                    }
                }
                return result;
            }
        }]);

        return _UTIL;
    }();

    return new _UTIL();
}();

exports.default = UTIL;

/***/ }),

/***/ 31:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * @description 用于SDK通用逻辑模块，一般为非业务接口
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */

var _UTIL = __webpack_require__(30);

var _UTIL2 = _interopRequireDefault(_UTIL);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * @description 缓存断线重连处理函数promise
 */
var networkRelinkPromise = null;

exports.default = new (function () {
    function general() {
        _classCallCheck(this, general);

        /**
         * @description 全局记录网络状态变化时上一次的网络状态
         */
        this.API_RETRY_NETWORK_STATUS = 'none';
    }

    /**
     *
     * @param {}
     * @Author wuzy
     * @DateTime 2018-12-20
     * @description 网络断线重连处理逻辑
     */


    _createClass(general, [{
        key: 'networkRelink',
        value: function networkRelink() {
            var _this = this;

            if (!networkRelinkPromise) {
                networkRelinkPromise = new Promise(function (resolve, reject) {
                    _UTIL2.default.getNetWorkStatus().then(function (networkType) {
                        if (networkType != 'none') {
                            // 网络已连接，直接执行下一步
                            resolve();
                        } else {
                            // 网络未连接 则监听，
                            wx.onNetworkStatusChange(function (res) {
                                if (res.isConnected && _this.API_RETRY_NETWORK_STATUS == 'none') {
                                    // 当从无网到有网
                                    resolve();
                                }
                                _this.API_RETRY_NETWORK_STATUS = res.networkType;
                            });
                        }
                    }).catch(function (res) {
                        return {};
                    });
                });
            }
            return networkRelinkPromise;
        }
    }]);

    return general;
}())();

/***/ }),

/***/ 32:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.SDK_CONFIG = {
    ENV: 'prod',
    VERSION: '1.2.0'

    /**
     * [STORAGE_KEYS 统一管理storage的key值]
     * @type {Object}
     */
};exports.STORAGE_KEYS = {
    USER_TID_STORAGE_KEY: 'XH_USER_TID'

    /**
     * [RESPONSE 出现错误时,返回给用户的信息与错误码]
     * @type {Object}
     */
};exports.RESPONSE = {
    NO_AVAILABLE_HOST: {
        message: 'NO_AVAILABLE_HOST'
    }
};

/***/ }),

/***/ 33:
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _UTIL = __webpack_require__(30);

var _UTIL2 = _interopRequireDefault(_UTIL);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /**
                                                                                                                                                                                                                   * make DATA
                                                                                                                                                                                                                   * @Author	 Lucas
                                                                                                                                                                                                                   * @DateTime 2018-08-08
                                                                                                                                                                                                                   * @return	 {OBJECT}	 [DATA类,在SDK内部使用的数据都在此类里面]
                                                                                                                                                                                                                   */


var DATA = function () {
    /**
     * [_DATA 存储全局数据的地方]
     * @type {Object}
     */
    var INNER_DATA = {
        app_options: {} //进入小程序时带的url参数


        /**
         * [setData 设置全局变量的方法]
         * @Author   Lucas
         * @DateTime 2018-08-14
         * @param    {Object}   newData [description]
         * @param    {Object|String|Number...}   value [如果第一个参数是字符串,第二个值才生效]
         */
    };function setData(newData, value) {
        if (_UTIL2.default.getVariableType(newData) === 'String') {
            return setData(_defineProperty({}, newData, value));
        } else {
            INNER_DATA = Object.assign({}, INNER_DATA, newData);
        }
    }

    /**
     * [getData 获取INNER_DATA]
     * @Author   Lucas
     * @DateTime 2018-08-14
     * @return   {Object}   [获取深拷贝后的的INNER_DATA]
     */
    function getData(queryString) {
        var object = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : INNER_DATA;

        if (queryString) {
            var splits = queryString.split('.');
            if (splits.length > 1) {
                var firstQueryValue = object[splits[0]];
                var isFirstQueryValid = firstQueryValue !== undefined;
                if (isFirstQueryValid) {
                    return getData(splits.slice(1).join('.'), firstQueryValue);
                } else {
                    return undefined;
                }
            } else {
                return _UTIL2.default.deepClone(object[queryString]);
            }
        } else {
            return _UTIL2.default.deepClone(object);
        }
    }

    /**
     * DATA类构造器
     */

    var _DATA = function () {
        function _DATA() {
            _classCallCheck(this, _DATA);
        }

        _createClass(_DATA, [{
            key: 'set',
            value: function set() {
                return setData.apply(undefined, arguments);
            }
        }, {
            key: 'get',
            value: function get() {
                return getData.apply(undefined, arguments);
            }
        }]);

        return _DATA;
    }();

    return new _DATA();
}();

exports.default = DATA;

/***/ })

/******/ });