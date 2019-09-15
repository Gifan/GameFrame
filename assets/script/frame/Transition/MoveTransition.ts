import { MVCS } from "../MVCS"

type Node = cc.Node

/// <summary>
/// 位移 UI切换过渡
/// </summary>
export class MoveTransition implements MVCS.ITransition {
    private _node: Node;
    private _moveInAct: cc.Action;
    private _moveOutAct: cc.Action;

    private _animSpeed: number = 0.3;
    private _moveDist: number = 1000;
    private isClean:boolean = false;
    public init(go: Node, isclean): void {
        this._node = go;
        this._node.x -= this._moveDist;
        this.isClean = isclean;
        var moveOutCallback = cc.callFunc(this.onMoveOutFinish, this);
        var moveInCallback = cc.callFunc(this.onMoveInFinish, this);
        this._moveInAct = cc.sequence(cc.spawn(cc.fadeTo(this._animSpeed, 255), cc.moveBy(this._animSpeed, this._moveDist, 0)), moveInCallback);
        this._moveOutAct = cc.sequence(cc.spawn(cc.fadeTo(this._animSpeed, 0), cc.moveBy(this._animSpeed, -this._moveDist, 0)), moveOutCallback);
    }

    public show(): Promise<any> {
        return new Promise((resolve) => {
            if (this._node == null) {
                return;
            }
    
            this._node.active = true;
    
            //cc.log("MoveTransition.show", this._node.x);
            this._node.opacity = 0;
            this._node.runAction(cc.sequence(this._moveInAct as cc.FiniteTimeAction, cc.callFunc(() => {
                resolve();
            })));
        });
    }

    public hide(): void {
        if (this._node == null) {
            return;
        }

        //cc.log("MoveTransition.hide", this._node.x);

        //可以优化为先移出屏幕，30秒后检查是否需要隐藏
        this._node.runAction(this._moveOutAct);
        //this._node.active  = false;
    }

    // 弹进动画完成回调
    private onMoveInFinish() {
        //cc.eventManager.resumeTarget(this._node, true);
        //cc.log("MoveTransition.onMoveInFinish", this._node.x);
    };

    // 弹出动画完成回调
    private onMoveOutFinish() {
        if(this.isClean)
            this._node.destroy();
        else this._node.active = false;
        //cc.log("MoveTransition.onMoveOutFinish", this._node.x);
    };
}