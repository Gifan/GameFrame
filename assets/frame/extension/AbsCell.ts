export abstract class  AbsCell {
    protected _node : cc.Node;
    public get node() : cc.Node {
        return this._node;
	}
	
	public Free() {
        if (this._node) {
            this._node.destroy();
            this._node = null;
        }

        this.ClearParam();
	}
	
	public ClearParam() {
		if (this.id != null) {
			delete this.id;
		}
		if (this.index != null) {
			delete this.index;
		}
		if (this.num != null) {
			delete this.num;
		}
		this.param = null;
    }

    public id ?: number;
    public index ?: number;
    public num ?: number;
	public param ? : object;
	
	private _animation: cc.Animation;
    public get animation() : cc.Animation {
        if (this._animation == null) {
            this._animation = this.node.getComponent(cc.Animation);
            if (this._animation == null) {
                this._animation = this.node.getComponentInChildren(cc.Animation);
                if (this._animation == null) {
                    cc.error(this.node.name + " animation null");
                }
            }
        }
        return this._animation;
    }
}