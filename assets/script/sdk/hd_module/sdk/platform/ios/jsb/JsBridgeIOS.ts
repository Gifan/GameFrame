
declare let window;
declare let cc: any;
declare let ocres: {mobile: string, email: string, nickName: string, memberId: string, userName: string, userToken: string};

let jsbCall = window.jsb ? jsb.reflection.callStaticMethod : () => {};
/**
 * js调用Android原生平台方法
 */
export default class JsBridgeIOS {
    /** IOS方法的类名 */
    private static _className: String = "HDModule";

    private static _userInfo: typeof ocres = null;

    private static _OCCall = (method: string) => {
        jsbCall(JsBridgeIOS._className, method);
    }

    /** 登陆回调 */
    private static _loginCallBack: Function = null;

    /** 内购回调 */
    private static _inAppPurchaseCallBack: Function = null;

    /** 初始化 */
    public static init(){
        // this._OCCall('init');
    }

    /** 短震 */
    public static vibrateShort(){
        this._OCCall('vibrateShort');
    }

    /** 第三方渠道SDK登陆 */
    public static agentSDKLogin(suc?: Function){
        this._loginCallBack = suc;
        //console.log("[js------>oc]---------->agentSDKLogin");
        // if(!this._userInfo)
            this._OCCall('agentSDKLogin');
        // else
        //     this.agentSDKLoginCallBack(this._userInfo);
    }

    public static agentSDKLoginCallBack(data: typeof ocres){
        //console.log("[JsBridgeIOS]----->agentSDKLoginCallBack")
        this._userInfo = data;
        this._loginCallBack && this._loginCallBack(data);
    }

    /** 获取设备信息 */
    public static getDevicesInfo(){
        // let infoT = {};
        // let infoStr = jsbCall(this._className, 'getDevicesInfo', "()Ljava/lang/String;");
        // if(infoStr){
        //     let infoArr = infoStr.split('\n');
        //     if(infoArr){
        //         for(let i = 0; i < infoArr.length; ++i){
        //             if(infoArr[i]){
        //                 let infoKVArr = infoArr[i].split(' = ');
        //                 if(infoKVArr)
        //                     infoT[infoKVArr[0]] = infoKVArr[1];
        //             }
        //         }
        //     }
        // }
        // return infoT;
    }

    public static inAppPurchaseWithOrderInfo(): Promise<any>{
        return new Promise((resolve) => {
            this._inAppPurchaseCallBack = resolve;
            this._OCCall('inAppPurchaseWithOrderInfo');
            this.inAppPurchaseWithOrderInfoCallBack();
        });
    }

    public static inAppPurchaseWithOrderInfoCallBack(){
        let isSuc = true;
        isSuc && this._inAppPurchaseCallBack && this._inAppPurchaseCallBack();
        this._inAppPurchaseCallBack = null;
    }
}

cc.nativeIOS = {
    /** res: {mobile: string, email: string, nickName: string, memberId: string, userName: string, userToken: string} */
    agentSDKLoginCallBack: (res) => {
        let data = (JSON.parse(res) as typeof ocres);
        JsBridgeIOS.agentSDKLoginCallBack(data);
    }
}