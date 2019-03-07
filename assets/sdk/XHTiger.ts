import { XHSDK, AdType, AdDynamicType, AdInfo } from './XHSDK'
import { CocosAction } from './CocosAction';

const { ccclass } = cc._decorator
declare let wx: any;
/// 这里必须加ccclass的装饰器，否则cocos的运行时 不会将类的constructor存入 全局的js构造map中去
/// 代码见cocos源码的js.js文件
@ccclass
export class XHTiger extends cc.Component {
    private displayNode: cc.Button
    private skipNode ? : cc.Button = null
    private id: string
    private completeCallback ? : (skip: boolean) => void = null
    private isBlinkAdv: boolean = false
    /**
     * 初始化，初始化完后调用setup 即开始跑dsp逻辑
     * @param id 广告id
     * @param node  广告节点
     * @param skipNode 跳过节点
     * @param completeCallback 闪屏页显示完成回调（true表示点击跳过完成，false表示自动显示完成）
     * @param isBlinkAdv 是否是闪屏广告 默认false
     */
    public static Create(
        id: string,
        displayNode: cc.Button,
        skipNode: cc.Button = null,
        completeCallback: (skip: boolean) => void = null,
        isBlinkAdv: boolean = false,
    ) {
        let inst = displayNode.getComponent(XHTiger);
        if (inst) {
            return inst;
        }
        inst = displayNode.addComponent(XHTiger);            
        inst.displayNode = displayNode
        inst.skipNode = skipNode
        inst.id = id
        inst.completeCallback = completeCallback
        inst.isBlinkAdv = isBlinkAdv
        inst.hide();

        const eh = new cc.Component.EventHandler()
        eh.target = inst.node
        eh.component = 'XHTiger'
        eh.handler = 'onNodeClick'
        // eh.customEventData = `${index}`;
        displayNode.clickEvents.push(eh);

        if (skipNode) {
            const eh = new cc.Component.EventHandler()
            eh.target = inst.node
            eh.component = 'XHTiger'
            eh.handler = 'onSkipClick'
            // eh.customEventData = `${index}`;
            skipNode.clickEvents.push(eh)
        }
        return inst;
    }

    /** 清楚 闪屏页显示完成回调 */
    public clearCallBack() {
        this.unschedule(this.showAdvComplete)
    }

    /** 开始dsp展示逻辑 */
    public setup() {
        this.displayNode.node.active = false
        let splash = cc.sys.localStorage.getItem('splash');
        if (this.isBlinkAdv && (!splash || splash == 'null')) {
            cc.sys.localStorage.setItem("splash", "1");
            this.showAdvComplete();
        } else {
            this.showTiger()
        }
    }

    /**持有的类销毁时一定要调用该方法， */
    public clean() {
        this.hide()
        //console.log(`tiger ${this.id} clean`)
        this.unscheduleAllCallbacks()
    }
    /** 界面隐藏时需要调用 停止自动切换广告 */
    public stopAutoSwitch() {
        //console.log(`tiger ${this.id} stop switch`)
        this.unschedule(this.switchAdv)
    }

    /** 
     * 开始自动切换广告 
     * @param {number} autoChange 单位：秒
     */
    private startAutoSwitch(autoChange: number) {
        //console.log(`tiger ${this.id} start switch`)
        if (this.displayNode.node.active) {
            this.scheduleOnce(this.switchAdv, autoChange)
        }
    }

    private switchAdv() {
        //console.log(`tiger ${this.id} switch`)
        this.setup()
    }

    private show() {
        this.displayNode.node.active = true
        if (this.skipNode) this.skipNode.node.active = true
    }

    private hide() {
        if (this.displayNode && this.displayNode.node)
            this.displayNode.node.active = false
        if (this.skipNode && this.skipNode.node)
            this.skipNode.node.active = false
    }

    private onNodeClick() {
        const info = XHSDK.currentAdInfo[this.id]
        //console.info(`tiger navigate to ${JSON.stringify(info)}`)
        if (info.tiger_position_id && info.creative_id) {
            XHSDK.navigateTiger(info.tiger_position_id, info.creative_id).then(
                infoList => {
                    if (!this.isBlinkAdv) {
                        let info: AdInfo = infoList[this.id]
                        /** 点击切换 */
                        console.log('-----------onNodeClick--tiger--info---', info)
                        this.updateTigerDisplay(info)
                    } else {
                        console.log("is blink adv does not update display")
                    }
                }
            )
        }
    }

    private onSkipClick() {
        this.clearCallBack()
        if (this.completeCallback) {
            this.completeCallback(true)
        }
    }

    private showTiger() {
        //console.log("showTiger", this.id);
        XHSDK.getTigerList([this.id]).then(infoList => {
            if (infoList == null) {
                console.error("getTigerList null")
                return;
            }
            let info: AdInfo = infoList[this.id]
            this.updateTigerDisplay(info)
        })
    }

    private updateTigerDisplay(info: AdInfo) {
        this.stopAutoSwitch()
        if (info && info.is_open) {
            const images = (() => {
                if (info.show_config.image) {
                    return [info.show_config.image]
                } else if (info.show_config.images) {
                    return info.show_config.images
                } else {
                    return []
                }
            })()
            //console.info(`${this.id} tiger info ${JSON.stringify(info)}`)
            this.displayNode.unscheduleAllCallbacks();
            if (info.type == AdType.DynamicIcon) {
                let index = 0;
                this.doDynamicAni(info.show_config);
                this.setSprite(this.displayNode.node, images[index++], () => {
                    //console.log("load success");
                    this.displayNode.node.active = true;
                    if (info.show_config.auto_change != 0) {
                        this.startAutoSwitch(info.show_config.auto_change);
                    }
                });
                this.displayNode.schedule(() => {
                    if (index >= images.length) {
                        index = 0;
                    }
                    this.setSprite(this.displayNode.node, images[index++], () => {
                        this.displayNode.node.active = true;
                        //console.log("load success");
                    });
                }, 1 / info.show_config.fps, cc.macro.REPEAT_FOREVER);
            } else if (info.type == AdType.StaticIcon) {
                this.setSprite(this.displayNode.node, images[0], () => {
                    this.displayNode.node.active = true;
                    if (info.show_config.auto_change != 0) {
                        //console.log("load success", 1111);
                        this.startAutoSwitch(info.show_config.auto_change);
                    }
                });
                this.doDynamicAni(info.show_config)
            } else if (info.type == AdType.SplashPortrait || info.type == AdType.SplashLandscape) {
                this.setSprite(this.displayNode.node, images[0], () => {
                    this.displayNode.node.active = true;
                });
                if (info.show_config.duration) {
                    this.scheduleOnce(
                        this.showAdvComplete,
                        info.show_config.duration
                    )
                }
            }
        } else {
            this.showAdvComplete()
        }
    }

    // TODO
    private doDynamicAni(show_config: any) {
        if (show_config.show_type == AdDynamicType.EaseInOut) {
            CocosAction.runScaleAction(this.displayNode.node);
        } else if (show_config.show_type == AdDynamicType.Shake) {
            CocosAction.shakeScreen(this.displayNode.node);
        }
    }

    private showAdvComplete() {
        this.hide()
        this.clearCallBack()
        if (this.completeCallback) {
            this.completeCallback(false)
        }
    }

    /**
     * 为节点或sprite设置SpriteFrame
     * @param {string|cc.Node|cc.Sprite} obj node，sprite或其路径
     * @param {string } imageUrl 资源路径
     * @param {callback} 回调
     */
    private setSprite2(obj, imageUrl, callback: Function = null) {
        if (!obj)
            throw new Error("请传入正确的节点名称");
        if (!imageUrl)
            throw new Error("请传入正确的资源路径");
        var spr;
        if (obj instanceof cc.Sprite) //参数为Sprite
            spr = obj;
        else if (obj instanceof cc.Node) //参数为Node
            spr = obj.getComponent(cc.Sprite);
        else if (Object.prototype.toString.call(obj) === "[object String]") //参数为string(sprite所在Node的路径)
            spr = cc.find(obj).getComponent(cc.Sprite);
        else
            throw new Error("传入节点资源类型不正确");
        if (!spr)
            throw new Error("未找到正确的Sprite");
        if (!spr || !spr.spriteFrame)
            return;

        let methodName = "load";
        if (imageUrl.indexOf("http") != 0)
            methodName += "Res";
        cc.loader[methodName]({
            url: imageUrl,
            type: 'jpg'
        }, function(err, obj) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            spr.spriteFrame = new cc.SpriteFrame(obj);
            if (callback) {
                callback()
            }
        });
    }

    /**
     * 为节点或sprite设置图片显示
     * @param {cc.Sprite | cc.Node} spriteOrNode 需要显示图片的节点或其sprite组件
     * @param {*} imgUrl 网络图片路径
     * @param {callback} 回调
     */
    public setSprite(spriteOrNode, imgUrl, callback: Function = null) {
        if (typeof("wx") == undefined) {
            this.setSprite2(spriteOrNode, imgUrl, callback)
            return;
        }
        if (!imgUrl) {
            return;
        }
        let sprite = null;
        if (spriteOrNode instanceof cc.Sprite)
            sprite = spriteOrNode;
        else if (spriteOrNode instanceof cc.Node)
            sprite = spriteOrNode.getComponent(cc.Sprite);

        if (!sprite)
            throw new Error("setSprite:  无法找到正确的Sprite");

        let image = wx.createImage();
        image.onload = function() {
            //console.log("on Load");
            let texture = new cc.Texture2D();
            texture.initWithElement(image);
            texture.handleLoadedTexture();
            sprite.spriteFrame = new cc.SpriteFrame(texture);
            if (callback) {
                callback()
            }
        };
        image.src = imgUrl;
    }
}