import { MVCS } from "../MVCS"
    
type Node = cc.Node
type Animation = cc.Animation

/// <summary>
/// 动画 UI切换过渡
/// </summary>
export class AnimTransition implements MVCS.ITransition {
    private _node : Node;
    private m_animator : Animation;
    private isClean:boolean = false;
    public init(node : Node, isClean:boolean) : void {
        this._node = node;
        this.isClean = isClean;
        this.m_animator = node.getComponent(cc.Animation);
    }

    public show() : Promise<any> {
        return new Promise((resolve, reject) => {
            if (this.m_animator == null) {
                return;
            }
    
            this.m_animator.play("Show");
            resolve();
        });
    }
    public hide() : void {
        if (this.m_animator == null) {
            return;
        }

        this.m_animator.play("Hide");
    }
}