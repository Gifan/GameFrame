import { MVCS } from "../MVCS"
import { Time } from "../../Time";
import { Watcher } from "../../Watcher";
    
type Node = cc.Node
type Animation = cc.Animation

/// <summary>
/// 动画 UI切换过渡
/// </summary>
export class AnimTransition implements MVCS.ITransition {
    private _node : Node;
    private _animator : Animation;
    private _watcher : Watcher;
    public init(node : Node) : void {
        this._node = node;
        this._animator = node.getComponent(cc.Animation);
        if (this._animator == null) {
            cc.error("AnimTransition Animation null", node);
        }
    }

    public show() : void {
        if (this._animator == null) {
            return;
        }

        if (this._watcher != null) {
            this._watcher.Cancal();
            this._watcher = null;
        }
        this._node.active = true;
        this._animator.play("fadein");
    }

    public hide() : void {
        if (this._animator == null) {
            return;
        }

        let state = this._animator.play("fadeout");
        this._watcher = Time.delay(state.duration, this.onHideFinish, null, this);
    }

    private onHideFinish() {
        this._watcher = null;
        this._node.active = false;
    }
}