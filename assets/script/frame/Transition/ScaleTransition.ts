import { MVC } from "../MVC"

type Node = cc.Node

/// <summary>
/// 缩放 UI切换过渡
/// </summary>
export class ScaleTransition implements MVC.ITransition {
    private _node: Node;
    private _fadeInAct: cc.Action;
    private _fadeOutAct: cc.Action;

    private _animInSpeed: number = 0.2;
    private _animOutSpeed: number = 0.2;
    private isClean: boolean = false;
    public init(go: Node, isclean: boolean): void {
        this._node = go;
        this.isClean = isclean;
        var fadeOutCallback = cc.callFunc(this.onFadeOutFinish, this);
        var fadeInCallback = cc.callFunc(this.onFadeInFinish, this);
        this._fadeInAct = cc.sequence(cc.spawn(cc.fadeTo(this._animInSpeed, 255), cc.scaleTo(this._animInSpeed, 1.0)), fadeInCallback);
        this._fadeOutAct = cc.sequence(cc.spawn(cc.fadeTo(this._animOutSpeed, 0), cc.scaleTo(this._animOutSpeed, 2.0)), fadeOutCallback);
    }

    public show(): Promise<any> {
        return new Promise((resolve) => {
            if (this._node == null) {
                return;
            }

            //可以优化为先移出屏幕，30秒后检查是否需要隐藏
            this._node.active = true;

            //cc.eventManager.pauseTarget(this._node, true);
            //this._node.position = cc.v2(0, 0);
            this._node.setScale(2);
            this._node.opacity = 0;
            this._node.runAction(cc.sequence(this._fadeInAct as cc.FiniteTimeAction, cc.callFunc(() => {
                resolve();
            })));
        });
    }

    public hide(): void {
        if (this._node == null) {
            return;
        }

        //cc.eventManager.pauseTarget(this._node, true);
        this._node.runAction(this._fadeOutAct);
    }

    // 弹进动画完成回调
    private onFadeInFinish() {
        //cc.eventManager.resumeTarget(this._node, true);
    };

    // 弹出动画完成回调
    private onFadeOutFinish() {
        if (this.isClean)
            this._node.destroy();
        else this._node.active = false;
    };
}