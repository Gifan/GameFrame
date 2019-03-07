import { MVCS } from "../MVCS"
    
type Node = cc.Node

/// <summary>
/// 默认 UI切换过渡
/// </summary>
export class DefaultTransition implements MVCS.ITransition{
    private _node : Node;

    public init( go : Node) : void {
        this._node = go;
    }

    public show() : void {
        if (this._node == null) {
            return;
        }

        //可以优化为先移出屏幕，30秒后检查是否需要隐藏
        this._node.active  = true;
    }
    public hide() : void {
        if (this._node == null) {
            return;
        }

        this._node.active  = false;
    }
}