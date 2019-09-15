import { MVCS } from "../MVCS"
    
type Node = cc.Node

/// <summary>
/// 默认 UI切换过渡
/// </summary>
export class DefaultTransition implements MVCS.ITransition{
    private _node : Node;
    private isClean:boolean = false;
    public init( go : Node, isClean:boolean) : void {
        this._node = go;
        this.isClean = isClean;
    }

    public show() : Promise<any>  {
        return new Promise((resolve) => {
            if (this._node == null) {
                return;
            }
    
            //可以优化为先移出屏幕，30秒后检查是否需要隐藏
            this._node.active  = true;
            resolve();
        });
    }
    public hide() : void {
        if (this._node == null) {
            return;
        }
        if(this.isClean)
            this._node.destroy();//  = false;
        else this._node.active = false;
    }
}