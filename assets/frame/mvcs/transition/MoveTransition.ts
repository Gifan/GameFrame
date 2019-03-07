import { MVCS } from "../MVCS"
    
type Node = cc.Node

/// <summary>
/// 位移 UI切换过渡
/// </summary>
export class MoveTransition implements MVCS.ITransition{
    private _node : Node;
    private _moveInAct : cc.Action;
    private _moveOutAct : cc.Action;

    private _animSpeed : number = 0.3;
    private _moveDist : number = 1000;

    public init( go : Node) : void {
        this._node = go;
        
        var moveOutCallback = cc.callFunc(this.onMoveOutFinish, this);
        var moveInCallback = cc.callFunc(this.onMoveInFinish, this);
        this._moveInAct = cc.sequence(cc.spawn(cc.fadeTo(this._animSpeed, 255), cc.moveTo(this._animSpeed, this._node.x, 0)), moveInCallback);
        this._moveOutAct = cc.sequence(cc.spawn(cc.fadeTo(this._animSpeed, 0), cc.moveTo(this._animSpeed, this._node.x-this._moveDist, 0)), moveOutCallback);
        this._node.x -= this._moveDist;
        this._node.opacity = 0;
    }

    public show() : void {
        if (this._node == null) {
            return;
        }
        
        this._node.active  = true;
        this._node.stopAllActions();
        
        //cc.log("MoveTransition.show", this._node.x);
        this._node.runAction(this._moveInAct);        
    }

    public hide() : void {
        if (this._node == null) {
            return;
        }
        this._node.stopAllActions();
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
        this._node.active  = false;
        //cc.log("MoveTransition.onMoveOutFinish", this._node.x);
    };
}