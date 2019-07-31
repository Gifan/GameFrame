/**
 * 帧动画播放工具
 */
export class AnimationUtils {
    /** 
     * 播放接口
     * @param aniName .anim资源名称
     * @param actName 需要播放的名称
     */
    public static play(aniName: string, parent: cc.Node, actName?: string, x?: number, y?: number,
        complete?: Function, wrapMode: cc.WrapMode = cc.WrapMode.Default, autoRemove: boolean = true, 
        zOrder?: number, scale?: cc.Vec2, removeDelay: number = 0, loadComplete?: Function):void {
            cc.loader.load(aniName, function(err: Error, animationClip: cc.AnimationClip) {
            if (err || !animationClip) {
                console.error("动画资源加载失败，url = " + aniName);
                return;
            }
            animationClip.wrapMode = wrapMode;
            let node = new cc.Node();
            node.addComponent(cc.Sprite);
            let animation = node.addComponent(cc.Animation);
            animation.addClip(animationClip);
            let _parent = parent;
            _parent.addChild(node);
            animation.play(actName);
            console.debug("播放动画  ======== " + aniName);
            node.setPosition(x || 0, y || 0);
            if (scale) {
                node.setScale(scale);
            }
            if (zOrder) {
                node.zIndex = zOrder;
            }
            // 
            let clearAnimation = function() {
                node.destroy();
                node = null;
            }
            //
            animation.on("finished", function() {
                if (autoRemove) {
                    if (removeDelay > 0) {
                        clearAnimation();
                    }else {
                        animation.scheduleOnce(removeDelay, this, clearAnimation);
                    }
                }
            }, this);
        }.bind(this));
    }
    
    
    /** 通过加载图集，创建动画 */
    public createAnimationByLoadAtlas(url: string, playerNode: cc.Node): void {
        let animation = playerNode.getComponent(cc.Animation);
        cc.loader.load(url, function (err, atlas) {
            var spriteFrames = atlas.getSpriteFrames();
            var clip = cc.AnimationClip.createWithSpriteFrames(spriteFrames, 10);
            clip.name = 'buff';
            clip.wrapMode = cc.WrapMode.Loop;

            animation.addClip(clip);
            animation.play('run');
        }.bind(this), null, false);
    }
    
    /** 通过加载图集，创建动画 */
    public loadAnimationClip(url: string, playerNode: cc.Node): void {
        let animation = playerNode.getComponent(cc.Animation);
        cc.loader.load(url, function (err, clip) {
            clip.wrapMode = cc.WrapMode.Loop;
            animation.addClip(clip);
            animation.play('run');
        }.bind(this), null, false);
    }

}
