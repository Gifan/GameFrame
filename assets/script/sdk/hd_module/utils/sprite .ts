
export default class UtilsSprite{
    /** 设置图片 */
    public static setSprite(obj: cc.Node | cc.Sprite, imageUrl: string, callBack?: Function, flush: boolean = false){
        if(!obj){
            console.error("传入节点不正确");
            return;
        }
        if(!imageUrl){
            console.error("传入路径不正确");
            return;
        }
        let sprite;
        if(obj instanceof cc.Sprite){
            sprite = obj;
        }
        else if(obj instanceof cc.Node)
            sprite = obj.getComponent(cc.Sprite);
        else if(Object.prototype.toString.call(obj) === "[object String]")
            sprite = cc.find(obj).getComponent(cc.Sprite);
        else{
            console.error("节点类型不正确");
            return;
        }
        if(!sprite){
            console.error("sprite不正确");
            return;
        }
        let methodName = "load";
        let opacity = sprite.node.opacity;
        if(flush)
            sprite.node.opacity = 0;
        if(imageUrl.indexOf("http") != 0)
            methodName += "Res";
        cc.loader[methodName](imageUrl, function(err, obj){
            sprite.node.opacity = opacity;
            // cc.log("!23123", opacity)
            if(err){
                cc.error(err.message || err);
                return;
            }
            sprite.spriteFrame = new cc.SpriteFrame(obj);
            // sprite.node.opacity = opacity;
            if(callBack){
                callBack();
            }
        })
    }
}
