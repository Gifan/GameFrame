import { Notifier } from "../frame/mvcs/Notifier";
import { NotifyID } from "../frame/mvcs/NotifyID";
import { Time } from "../frame/Time";

export const wx = window["wx"];

export interface WeChatKVData {
    key : string;
    value : string;
}

export interface WeChatData {
    nickName ?: string; //名字数据有大小写两种
    nickname ?: string;
    openid : string;
    avatarUrl : string;
    KVDataList ?: WeChatKVData[];
    rawValues ?: number[];
}

export interface WeChatMsg {
    cmd : string;
    id ?: number;
    value ?: number;
    datas ?: number[];
}

class _WeChatSDK {
    /**
     * 是否微信小游戏
     */
    public isWeChat(): boolean {
        return cc.sys.platform == cc.sys.WECHAT_GAME;
    }

    private _systemInfo;
    public getSystemInfoSync() {
        if (this._systemInfo == null) {
            this._systemInfo = wx.getSystemInfoSync();
            //cc.error("getSystemInfoSync", toJson(this._systemInfo));
        }
        return this._systemInfo;
    }

    public login(callBack:Function){       
        this.createUserInfoButton(callBack);
    }

    /**
     * 授权微信
     * @param btninfo 
     */
    public createUserInfoButton(next:Function):void{
        let systemInfo = this.getSystemInfoSync();
        let screenWidth = systemInfo.screenWidth;
        let screenHeight = systemInfo.screenHeight;
        console.log("授权微信", screenWidth, screenHeight)
        let left = screenWidth * 0.35;
        let top = screenHeight * 0.55;
        let width = screenWidth * 0.3;
        let height = width * 0.228;

        let btnInfo = {
            type: "image",
            text: "",
            image: "https://h5gameres.kuaiyugo.com/chatgame/cocos_games_res/shareImages/loginBtn.png",
            style:  {
                left: left,
                top: top,
                width: width,
                height: height,
                lineHeight: 40,
                backgroundColor: '#cd2936',
                color: '#ffffff',
                textAlign: 'center',
                fontSize: 16,
                borderRadius: 4
            },
            withCredentials: true,
            lang: 'zh_CN'
        }
        let btn = wx.createUserInfoButton(btnInfo);
        btn.onTap(res => {
            console.log("res",res);
            if(res.errMsg=="getUserInfo:ok"){
                next(true,res);
                btn.destroy();
            }else{
                next(false)
                btn.destroy();
            }
        });
    }

    private _btnGameClub;

    /**
     * 生成游戏圈按钮
     * @param pos 锚点在左上角的坐标
     * @param btninfo 
     */
    public createGameClubButton(pos : cc.Vec2, size = 60, icon = 'green') : void {
        if (!this.isWeChat()) {
            return;
        }
        this.destroyGameClubButton();
        let systemSize = this._systemInfo;
        if (systemSize == null) {
            systemSize = wx.getSystemInfoSync();
            this._systemInfo = systemSize;
        }
        //cc.error("createGameClubButton", toJson(systemSize));

        let windowSize = cc.view.getVisibleSize();
        //得出该位置对应于左上的比例
        let leftRatio = pos.x / windowSize.width;
        let topRatio = 1 - (pos.y + size) / windowSize.height;
        //因为clubButton的锚点在左上角
        let left = systemSize.windowWidth * leftRatio;
        let top = systemSize.windowHeight * topRatio;

        let designAspect = windowSize.width / windowSize.height;
        let realAspect = systemSize.windowWidth / systemSize.windowHeight;
        if (designAspect > realAspect) {
            let designHeight = systemSize.windowWidth / designAspect;
            top = designHeight * topRatio;
            //高度黑边
            let offset = (systemSize.windowHeight - designHeight) * 0.5;
            top += offset;

            size *= systemSize.windowWidth / windowSize.width;

            //cc.error("height black", offset, size, designHeight);
        } else {
            let designWidth = systemSize.windowHeight * designAspect;
            left = designWidth * leftRatio;
            //宽度黑边
            let offset = (systemSize.windowWidth - designWidth) * 0.5;
            left += offset;

            size *= systemSize.windowHeight / windowSize.height;

            //cc.error("width black", offset, size, designWidth);
        }

        let btnInfo = {
            type: "image",
            text: "",
            icon: icon,
            style:  {
                left: left,
                top: top,
                width: size,
                height: size,
            }
        }
        let btn = wx.createGameClubButton(btnInfo);
        // btn.onTap((res) => { 
        //     cc.error(res) 
        // });
        this._btnGameClub = btn;
    }

    /**
     * 销毁游戏圈按钮
     * @param btninfo 
     */
    public destroyGameClubButton() {
        if (this._btnGameClub == null) {
            return false;
        }
        this._btnGameClub.destroy();
        this._btnGameClub = null;
        return true;
    }

    public createImg(sprite : cc.Sprite, avatarUrl : string){
        let image = wx.createImage();
        image.onload = () => {
            try {
                let texture = new cc.Texture2D();
                texture.initWithElement(image);
                texture.handleLoadedTexture();
                sprite.spriteFrame = new cc.SpriteFrame(texture);
            } catch (e) {
                cc.error(e);
                sprite.node.active = false;
            }
        };
        image.src = avatarUrl;
    }

    public postMessage(msg : WeChatMsg){
        if (!this.isWeChat()) {
            //cc.error("postMessage skip:", toJson(msg))
            return;
        }
        wx.postMessage(msg);
    }

    /*
    * 获取菜单按钮（右上角胶囊按钮）的布局位置信息。坐标信息以屏幕左上角为原点。
    */
    public getMenuRect() : {
        width: number,
        height: number,
        top: number,
        right: number,
        bottom: number,
        left: number
    } {
        if (!this.isWeChat()) {
            return null;
        }

        return wx.getMenuButtonBoundingClientRect();
    }

    public resizeSharedCanvas(width : number, height : number){
        if (!this.isWeChat()) {
            return ;
        }
        if (width == null || height == null) {
            console.error("resizeSharedCanvas width/height null", width, height)
            return;
        }
        let sharedCanvas = wx.getOpenDataContext().canvas;
        sharedCanvas.width = width;
        sharedCanvas.height = height;
        this.sharedTexture = new cc.Texture2D();
        this.sharedSpriteFrame = new cc.SpriteFrame();
        //console.log("resizeSharedCanvas", sharedCanvas);
    }

    private timeoutID = null;
    private sharedTexture : cc.Texture2D = null;
    private sharedSpriteFrame : cc.SpriteFrame = null;
    public updateSharedCanvas(sprite : cc.Sprite, times = 20){
        if (!this.isWeChat()) {
            return ;
        }
        if (this.sharedTexture == null) {
            console.error("updateSharedCanvas sharedTexture null", sprite);
            return;
        }
        //console.log(Time.time, "updateSharedCanvas", sprite, times);
        let sharedCanvas = wx.getOpenDataContext().canvas;
        this.sharedTexture.initWithElement(sharedCanvas);
        this.sharedTexture.handleLoadedTexture();
        this.sharedSpriteFrame.setTexture(this.sharedTexture);
        sprite.spriteFrame = this.sharedSpriteFrame;

        if (this.timeoutID != null) {
            clearTimeout(this.timeoutID);
            this.timeoutID = null;
       }
        if (times > 1) {
            //时间越久已经刷新的可能性越高，所以定时刷新越来越快
            this.timeoutID = setTimeout(() => {
                this.timeoutID = null;
                this.updateSharedCanvas(sprite, times - 1);
            }, (times * times + 200));
        }
    }

    /**
     * 打开客服界面
     * 进入客服会话，要求在用户发生过至少一次 touch 事件后才能调用。后台接入方式与小程序一致，详见 客服消息接入
     */
    public openService(param ?: {
        /**
         * 会话来源
         */
        sessionFrom?: string,
        /**
         * 是否显示会话内消息卡片，设置此参数为 true，用户进入客服会话之后会收到一个消息卡片，通过以下三个参数设置卡片的内容
         */
        showMessageCard?: boolean,
        /**
         * 会话内消息卡片标题
         */
        sendMessageTitle?: string,
        /**
         * 会话内消息卡片路径
         */
        sendMessagePath?: string,
        /**
         * 会话内消息卡片图片路径
         */
        sendMessageImg?: string,
        success?: () => void,
        fail?: () => void,
        complete?: () => void
    }) {
        if (!this.isWeChat()) {
            return ;
        }
        wx.openCustomerServiceConversation(param);
    }

    /**
     * 长震动
     */
    public vibrateLong() {
        if (!this.isWeChat()) {
            return ;
        }
        wx.vibrateLong();
    }

    public vibrateShort() {
        if (!this.isWeChat()) {
            return ;
        }
        wx.vibrateShort();
    }
}

export const WeChatSDK = new _WeChatSDK();