
import { GameVoManager } from "../manager/GameVoManager";
import { Const } from "../config/Const";
import { Manager } from "../manager/Manager";
import { AudioType } from "../manager/AudioManager";
import { CallID } from "../CallID";
import { MVCS } from "../frame/MVCS";

declare var wx: any;
declare var canvas: any;
/**
 * 通用工具类
 */
export class Util {
    public static isWeChat() {
        return cc.sys.platform == cc.sys.WECHAT_GAME;
    }

    /**
     * 获取夹角角度
     * @param originPoint 
     * @param endPoint 
     */
    public static getAngle(originPoint: cc.Vec2, endPoint: cc.Vec2): number {
        if (endPoint.x == 0 && endPoint.y == 0) return 0;
        let radina = endPoint.signAngle(originPoint);
        let angle = 180 / (Math.PI / radina);
        return angle;
    }

    /**
     * 角度转弧度
     * @param angle 角度
     */
    public static AngleToRadinas(angle): number {
        return angle * (Math.PI / 180);
    }

    public static RadinasToAngle(radius): number {
        return radius * 180 / (Math.PI);
    }

    public static pDistance(p1: cc.Vec2, p2: cc.Vec2): number {
        let dx = p2.x - p1.x;
        let dy = p2.y - p1.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    public static getAngleByVec2(vec: cc.Vec2): number {
        let direction = 0 < vec.x ? 1 : -1;
        let z = vec.mag();
        if (z == 0) return 0;
        let cos = vec.y / z;
        let radina = Math.acos(cos);
        let angle = 180 / (Math.PI / radina);
        return angle * direction;
    }

    /**
    * 为节点或sprite设置SpriteFrame
    * @param {string|cc.Node|cc.Sprite} obj node，sprite或其路径
    * @param {string } imageUrl 资源路径
    * @param {callback} 回调
    */
    static setSprite2(obj, imageUrl: string, callback: Function = null) {
        if (!obj) {
            cc.error("请传入正确的节点名称");
            return;
        }
        if (!imageUrl) {
            cc.error("请传入正确的资源路径");
            return;
        }
        var spr;
        if (obj instanceof cc.Sprite)                       //参数为Sprite
            spr = obj;
        else if (obj instanceof cc.Node)                    //参数为Node
            spr = obj.getComponent(cc.Sprite);
        else if (Object.prototype.toString.call(obj) === "[object String]")//参数为string(sprite所在Node的路径)
            spr = cc.find(obj).getComponent(cc.Sprite);
        else {
            cc.error("传入节点资源类型不正确");
            return;
        }
        if (!spr) {

            cc.error("未找到正确的Sprite");
            return;
        }
        if (!spr || !spr.spriteFrame)
            return;
        var opacity = spr.node.opacity;
        spr.node.opacity = 0;

        let methodName = "load";
        if (imageUrl.indexOf("http") != 0)
            methodName += "Res";
        cc.loader[methodName]({ url: imageUrl, type: 'jpg' }, function (err, obj) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            spr.spriteFrame = new cc.SpriteFrame(obj);
            spr.node.opacity = opacity;
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
    public static setSprite(spriteOrNode, imgUrl, callback: Function = null) {
        if (!Util.isWeChat()) {
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
            throw new Error("CommonUtil.setSprite:  无法找到正确的Sprite");

        let image = wx.createImage();
        image.onload = function () {
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

    //设置本地图片
    public static setNodePic(node: cc.Node, url: string) {
        cc.loader.loadRes(url, cc.SpriteFrame, function (err, spriteFrame) {
            if (err) {
                cc.error(err.message || err);
                return;
            }
            node.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        });
    }

    public static random(min: number, max: number): number {
        return min + Math.floor(Math.random() * (max - min));
    }

    /**加载资源 */
    public static loadPrefab(path: string): Promise<cc.Node> {
        return new Promise((resolve, reject) => {
            let names = path.split(`/`);
            MVCS.ComponentHandler.loadAssetHandler(names[names.length - 1], path, cc.Prefab, (name: string, assets: object, assetspath: string, args: any) => {
                let prefab: cc.Node = assets as cc.Node;
                if (prefab == null) {
                    cc.error(".loadCallback GameObject null:" + name);
                    reject(null);
                }
                else {
                    let node: cc.Node = cc.instantiate<cc.Node>(prefab);
                    resolve(node)
                }
            }, null, null);
        });
    }

    /**type 1 */
    public static timeFormat(time: number, type: number = 1): string {
        if (time < 0) return "";
        let str = "";
        if (type == 1) {/**%d分%秒 */
            let min = Math.floor(time / 60);
            let sec = time % 60;
            str = `${min}分${sec}秒`;
        } else if (type == 2) {
            let minute = time / 60 >> 0;
            str += (minute < 10 ? "0" : "") + minute + ":";
            let second = Math.ceil(time % 60);
            str += (second < 10 ? "0" : "") + second;
        }
        return str;
    }

    /**格式化名字 */
    public static normalName(name: string, index: number = 5): string {
        let realname = name;
        if (name.length > index) {
            realname = name.substr(0, index) + "..."
        }
        return realname;
    }

    /**
     * @desc 从给定整数范围内生成n个不重复的随机数 n不能超过给定范围
     * @param {Number} min 
     * @param {Number} max 
     */
    public static getRandomSDiff(min, max, n) {
        if (max - min + 1 < n) return [0];
        let originalArray = new Array();
        let len = max - min + 1;
        for (let i = 0; i < len; i++) {
            originalArray[i] = min + i;
        }
        let randomArray = new Array();
        for (let i = 0; i < n; i++) {
            let t = this.random(0, len - 1 - i)
            randomArray[i] = originalArray[t];
            var temp = originalArray[len - 1 - i];
            originalArray[len - 1 - i] = originalArray[t];
            originalArray[t] = temp;
        }
        return randomArray;
    }

    public static randomArray(array) {
        let randomArray = new Array();
        let tt = array;
        let len = array.length
        for (let i = 0; i < len; i++) {
            let t = this.random(0, len - 1 - i)
            randomArray[i] = tt[t];
            var temp = tt[len - 1 - i];
            tt[len - 1 - i] = tt[t];
            tt[t] = temp;
        }
        return randomArray;
    }

    

    //金币格式化
    public static goldFormat(gold: number): string {
        if (gold <= 0) return "0";
        if (gold < 1000) {
            return String(Math.floor(gold));
        } else if (gold >= 1000 && gold < 1000000) {
            return (gold / 1000).toFixed(1) + "k";
        } else if (gold >= 1000000 && gold < 1000000000) {
            return (gold / 1000000).toFixed(1) + "m";
        } else if (gold >= 1000000000 && gold < 1000000000000) {
            return (gold / 1000000000).toFixed(1) + "b";
        } else if (gold >= 1000000000000 && gold < 1000000000000000){
            return (gold / 1000000000000).toFixed(1) + 't';
        } else if (gold >= 1000000000000000 && gold < 1000000000000000000){
            return (gold / 1000000000000000).toFixed(1) + 'A';
        } else{
            return (gold / 1000000000000000000).toFixed(1) + 'B';
        }
    }

    //数字格式化
    public static numFormat(num: number): string {
        if (num <= 0) return "0";
        if (num < 1000) {
            return String(Math.floor(num));
        } else if (num >= 1000 && num < 1000000) {
            return (num / 1000).toFixed(1) + "k";
        } else if (num >= 1000000 && num < 1000000000) {
            return (num / 1000000).toFixed(1) + "m";
        } else if (num >= 1000000000 && num < 1000000000000) {
            return (num / 1000000000).toFixed(1) + "b";
        } else if (num >= 1000000000000 && num < 1000000000000000){
            return (num / 1000000000000).toFixed(1) + 't';
        } else if (num >= 1000000000000000 && num < 1000000000000000000){
            return (num / 1000000000000000).toFixed(1) + 'A';
        } else{
            return (num / 1000000000000000000).toFixed(1) + 'B';
        }
    }

    public static _goldN: cc.Node = null;
    public static showGoldEffect(parent: cc.Node, goodsNum: number, nodePos: cc.Vec2, targetPos: cc.Vec2, offsetTime: number = 0, delayTime: number = 100, iconType: number = 1) {
        if (!Util._goldN) {
            setTimeout(async function () {
                if (!parent) return
                Util.loadPrefab('tool/goldeffect').then((node) => {
                    Util._goldN = cc.instantiate(node);
                    node.parent = parent;
                    node.position = nodePos;
                    node.getComponent('GoldEffect').playEffect(goodsNum, targetPos, offsetTime, 0, iconType)
                })
            }, delayTime)
        } else {
            let node = cc.instantiate(Util._goldN);
            node.parent = parent;
            node.position = nodePos;
            node.getComponent('GoldEffect').stopEffect();
            node.getComponent('GoldEffect').playEffect(goodsNum, targetPos, offsetTime, 0, iconType);
        }
    }

    //用于生成uuid
    private static S4() {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    }
    public static guid() {
        return (Util.S4() + Util.S4() + "-" + Util.S4() + "-" + Util.S4() + "-" + Util.S4() + "-" + Util.S4() + Util.S4() + Util.S4());
    }

    /**
     * 适配分辨率
     */
    public static resizeNode(node: cc.Node) {
        if (node && cc.isValid(node)) {
            let size = cc.view.getCanvasSize();
            if (size.height / size.width <= 1.5) {
                node.scale = size.height / size.width;
            }
        }
    }

    public static setAvatarSprite(spriteOrNode, imgUrl, callback: Function = null) {
        Util.setSprite(spriteOrNode, imgUrl, callback);
    }
}
