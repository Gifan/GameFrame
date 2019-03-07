import { XHSDK } from "../../sdk/XHSDK";
import { XHTiger } from "../../sdk/XHTiger";
import { WeChatSDK } from "../../sdk/WeChatSDK";
import { Notifier } from "../../frame/mvcs/Notifier";
import { NotifyID } from "../../frame/mvcs//NotifyID";
import { Manager } from "../manager/Manager";
import { ToggleCell } from "../../frame/extension/ToggleCell";
import { StorageID } from "../StorageID";
import { SDKKey } from "../SDKKey";
import { AppConfig } from "../../sdk/AppConfig";
import { Time } from "../../frame/Time";
import { CellPool } from "../../frame/extension/CellPool";
import { CallID } from "../CallID";

export class SDKLauncher {
    //首屏广告
    private _btnFirst : cc.Button;
    //广告节点
    private _nodeAd : cc.Node;
    //跳过按钮
    private _btnSkip : cc.Button;

    //授权
    private _nodeAuth : cc.Node;

    private _testRoot : cc.Node;
    private _curServer : ToggleCell;

    public constructor() {
        let node_first = cc.find("Canvas/btn_first");
        this._btnFirst = node_first.getComponent(cc.Button);
        this._nodeAd = cc.find("Canvas/Ad");
        this._nodeAd.active = false;
        let node_skip = this._nodeAd.getChildByName("btn_skip");
        this._btnSkip = node_skip.getComponent(cc.Button);

        this._nodeAuth = cc.find("auth");
        this._nodeAuth.active = false;
        cc.game.addPersistRootNode(this._nodeAuth);

        this._testRoot = cc.find("Canvas/TestLogin");
        this._testRoot.active = false;
        let btn_login = this._testRoot.getChildByName("btn_login");
        btn_login.on("click", this.onClickLogin, this);

        let input_account = this._testRoot.getChildByName("input_account");
        input_account.on('text-changed', this.onEditingReturn, this);

        let localId = Manager.storage.getString(StorageID.LocalId);
        if (isNullOrEmpty(localId)) {
            localId = Date.now().toString();
            Manager.storage.setString(StorageID.LocalId, localId);
        }
        let edit = input_account.getComponent(cc.EditBox);
        edit.string = localId;

        let serverIndex = Manager.storage.getNumber(StorageID.ServerIndex, 0);
        let menu_servers = this._testRoot.getChildByName("menu_servers");
        let toggle = new ToggleCell(menu_servers.children[0]);
        let pool = new CellPool<ToggleCell>(ToggleCell, toggle, menu_servers);
        for (let index = 0; index < AppConfig.Servers.length; index++) {
            const server = AppConfig.Servers[index];
            const item = pool.Pop();
            item.mainText.string = server.name;
            item.index = index;
            if (serverIndex == index) {
                item.isChecked = true;
                this._curServer = item;
            }
            item.SetListenerWithSelf(this.onClickServer, this);
        }

        //XHSDK.switchRequestLog(false);

        Notifier.setCall(NotifyID.SDK_IsSwitchOpen, this.isSwitchOpen, this);

        Notifier.addListener(NotifyID.SDK_ReqShare, this.share, this);
        Notifier.addListener(NotifyID.SDK_ReqAuth, this.WXLogin, this);
        Notifier.addListener(NotifyID.SDK_CreateTiger, this.createTiger, this);
        Notifier.addListener(NotifyID.SDK_CleanTiger, this.cleanTiger, this);
        Notifier.addListener(NotifyID.SDK_LoadingLog, this.loadingLog, this);
        Notifier.addListener(NotifyID.Mobile_Shake, this.mobileShake, this);

        this.FirstLogin();
    }

    //先进行平台登陆
    private async FirstLogin(){
        try {
            await XHSDK.FirstLogin();
            this.XHLogin();
        } catch(err) {
            console.error("FirstLogin ", err);
        }
    }

    /**
     * 
     * @param key 场景值是否屏蔽
     */
    private isSwitchOpen(key : SDKKey) : boolean {
        if (key == SDKKey.pay) {
            if (cc.sys.os == cc.sys.OS_IOS) {
                key = SDKKey.iOSPay;
            } else {
                key = SDKKey.androidPay;
            }
        }

        return XHSDK.isSwitchOpen(key);        
    }

    /**
     * 分享
     * @param callBack 
     */
    private share(key?:string, value ?: object, callBack?:Function, args ?: {}){
        XHSDK.WxShare(key, value, args).then(
            function(){
                if(callBack){
                    callBack();
                    console.log("分享成功回调")
                }
            }
        );
    }

    private _tiger : XHTiger;
    private createTiger(id : string, btnOpen : cc.Button, btnClose ?: cc.Button, completeCallback: (skip: boolean) => void = null, isSplashAd = false) {
        if (this._tiger != null) {
            this.cleanTiger( );
        }

        this._tiger = XHTiger.Create(id, btnOpen, btnClose, completeCallback, isSplashAd);
        this._tiger.setup();
    }

    private cleanTiger( ) {
        if (this._tiger == null) {
            return;
        }
        this._tiger.clean();        
    }

    private loadingLog(type : string) {
        XHSDK.sendLoadingLog(type);      
    }

    private mobileShake(type : number) {
        let shake = Notifier.call(CallID.Setting_GetShake);
        if(!shake)  return;
        if (type == 2) {
            WeChatSDK.vibrateLong();
        } else {
            WeChatSDK.vibrateShort();
        }
    }

    private onClickLogin() {
        Notifier.send(NotifyID.App_Start);
    }

    private onEditingReturn(event) {
        //cc.error("onEditingReturn:", event);
        let edit : cc.EditBox = event;
        Manager.storage.setString(StorageID.LocalId, edit.string);
    }

    private onClickServer(toggle : ToggleCell, isChecked : boolean) {
        if (!isChecked) {
            return;
        }
        if (this._curServer != null) {
            this._curServer.isChecked = false;
        }
        let index = toggle.index;
        Manager.storage.setNumber(StorageID.ServerIndex, index);
        this._curServer = toggle;
        //cc.error("onClickServer:", index);
    }

    //微信登录授权处理
    private WXLogin(callBack:Function){
        XHSDK.XhLogin((XhLoginRes) =>{
            //在ccc上直接开始游戏
            if(!XhLoginRes){
                if (callBack != null) {
                    callBack();                    
                }
                return;
            }
            let nick_name = XhLoginRes.nick_name;
            console.log("[sdkLauncher]wxlogin", XhLoginRes);            
            if(!nick_name){
                this._nodeAuth.active = true;
                this._nodeAuth.setSiblingIndex(99999);
                WeChatSDK.login((err,WxloginnRes) => {
                    this._nodeAuth.active = false;
                    if(!err){
                       cc.error("微信授权失败");
                       return;
                    }
                    let info = {encryptedData: WxloginnRes.encryptedData,iv: WxloginnRes.iv,signature: WxloginnRes.signature};
                    console.log("微信授权成功")
                    XHSDK.updateUserInfo(info,() => {
                        console.log("[sdkLauncher]updateUserInfo", info)
                        Notifier.send(NotifyID.Login_Again, ()=>{
                            if (callBack != null) {
                                callBack();                   
                            }
                        });
                    });
                });
            }else {
                if (callBack != null) {
                    callBack();                    
                }
            }
        });
    }

    //闪屏广告显示处理
    private XHLogin(){
        this._btnFirst.node.opacity = 255;
        if (WeChatSDK.isWeChat()) {
            //第一次不出现闪屏
            let loginTimes : number = Manager.storage.getNumber(StorageID.LoginTimes, 0);
            if (loginTimes > 0 && AppConfig.needSplash) {
                this._nodeAd.active = true;
                this.createTiger(AppConfig.TigerID.splash, this._btnFirst, this._btnSkip, (skip) => { 
                    this.CreatMainScene(); 
                }, true);                
            } else {
                Time.delay(0.02, this.FadeoutLogo, null, this, 26);
            }
            Manager.storage.setNumber(StorageID.LoginTimes, loginTimes + 1);
            //屏蔽XHTiger判断
            cc.sys.localStorage.setItem("splash", "1");
        } else {
            this.CreatMainScene();
        }      
    }

    //没有广告闪屏后开始游戏
    private FadeoutLogo(){
        this._btnFirst.node.opacity -= 10;
        if(this._btnFirst.node.opacity <= 0){
            this.CreatMainScene();
        }
    }

    //有广告先看广告后开始游戏
    private CreatMainScene(){
        this._btnFirst.node.active = false;
        let debugMode = Manager.storage.getBool(StorageID.DebugMode);
        if (debugMode || !WeChatSDK.isWeChat()) {
            this._testRoot.active = true;
        } else {
            Notifier.send(NotifyID.App_Start);                
        }
    }
}
