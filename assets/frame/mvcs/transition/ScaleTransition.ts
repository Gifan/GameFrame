import { MVCS } from "../MVCS"
import { UIManager } from "../../UIManager";
    
type Node = cc.Node

/// <summary>
/// 缩放 UI切换过渡
/// </summary>
export class ScaleTransition implements MVCS.ITransition{
    private _node : Node;
    private _fadeInAct : cc.Action;
    private _fadeOutAct : cc.Action;

    private _animSpeed : number = 0.3;

    public init( go : Node) : void {
        this._node = go;

        //修改界面到中心
        let resolution = MVCS.designResolution();
        let center = cc.v2(
            resolution.width / 2,
            resolution.height / 2
        );
        this._node.position = MVCS.designCenter().clone();
        this._node.setAnchorPoint(0.5, 0.5);
        for (let index = 0; index < this._node.childrenCount; index++) {
            const child : cc.Node = this._node.children[index];
            child.position = cc.v2(child.position.x - center.x, child.position.y - center.y);
        }
        //cc.error("ScaleTransition.init", center, UIManager.designResolution);

        var fadeOutCallback = cc.callFunc(this.onFadeOutFinish, this);
        var fadeInCallback = cc.callFunc(this.onFadeInFinish, this);
        this._fadeInAct = cc.sequence(cc.spawn(cc.fadeTo(this._animSpeed, 255), cc.scaleTo(this._animSpeed, 1.0)), fadeInCallback);
        this._fadeOutAct = cc.sequence(cc.spawn(cc.fadeTo(this._animSpeed, 0), cc.scaleTo(this._animSpeed, 2.0)), fadeOutCallback);
        this._node.setScale(2);
        this._node.opacity = 0;
    }

    public show() : void {
        if (this._node == null) {
            return;
        }

        //可以优化为先移出屏幕，30秒后检查是否需要隐藏
        this._node.active  = true;

        //cc.eventManager.pauseTarget(this._node, true);
        //this._node.position = cc.v2(0, 0);
        this._node.stopAllActions();
        this._node.runAction(this._fadeInAct);
    }

    public hide() : void {
        if (this._node == null) {
            return;
        }       

        //cc.eventManager.pauseTarget(this._node, true);
        this._node.stopAllActions();
        this._node.runAction(this._fadeOutAct);
    }

    // 弹进动画完成回调
    private onFadeInFinish() {
        //cc.eventManager.resumeTarget(this._node, true);
    };

    // 弹出动画完成回调
    private onFadeOutFinish() {
        this._node.active  = false;
    };
}