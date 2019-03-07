import { ButtonCell } from "../../../../frame/extension/ButtonCell";
import { AbsCell } from "../../../../frame/extension/AbsCell";

/// <summary>
/// 程序生成的UI代码类，请勿修改
/// </summary>
export class Album extends AbsCell {
    public constructor(node ?: cc.Node) {
        super();
        if (node != null) {
            this.Init(node);
        }
    }
    
    public root : ButtonCell;

    public Init(node : cc.Node) {
        this._node = node;
        this.root = new ButtonCell(node);
    }

    public Free() {
        this._node.destroy()
        this._node = null;
        
        if (this.root != null) {
            this.root.Free();
        }
        this.root = null;
    }
}