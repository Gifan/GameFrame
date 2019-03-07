import { AbsCell } from "./AbsCell";

export class CellPool<T extends AbsCell> {
    private _ctor : {new(node : cc.Node): T; };
    private m_onCreate : (t : T) => void;
    private m_onPop : (t : T) => void;
    private m_onPush : (t : T) => void;
    private _target;

    private m_pool : T[];

    private m_items : T[] = [];

    private _prefab : T;
    public get prefab() {
        return this._prefab;
    }

    private _parent : cc.Node;
    public get parent() {
        return this._parent;
    }

    public get items() {
        return this.m_items;
    }

    public constructor(ctor : {new(node : cc.Node): T; }, prefab : T, parent : cc.Node, target = null, onCreate : (t : T) => void = null, onPop : (t : T) => void = null, onPush : (t : T) => void = null) {
        this._ctor = ctor;
        this._prefab = prefab;
        prefab.node.active = false;
        this._parent = parent;        
        this.m_pool = [];
        this._target = target;
        this.m_onCreate = onCreate;
        this.m_onPop = onPop;
        this.m_onPush = onPush;
    }

    public Create(prefab : cc.Node, parent : cc.Node) : T {
        let transform = cc.instantiate<cc.Node>(prefab);
        transform.active = (true);
        transform.parent = (parent);
        transform.scale = 1;
        transform.position = cc.Vec2.ZERO;
        let result : T = new this._ctor(transform);
        return result;
    }


    public Pop(parent : cc.Node = null) : T {
        let t : T;
        if (parent == null) {
            parent = this._parent;
        }
        if (this.m_pool.length > 0) {
            t = this.m_pool.shift();
            t.node.active = true;
            //t.node.SetAsLastSibling();
            t.node.setSiblingIndex(999);
        } else {
            let prefab = this.prefab;
            t = this.Create(prefab.node, parent);
            if (this.m_onCreate != null) {
                this.m_onCreate.call(this._target, t);
            }
        }
        this.m_items.push(t);
        if (this.m_onPop != null) {
            this.m_onPop.call(this._target, t);
        }
        return t;
    }

    public _Push(cell : T, needRemove) {
        cell.node.active = false;
        this.m_pool.push(cell);
        if (needRemove) {
            this.m_items.remove(cell);
        }
        if (this.m_onPush != null) {
            this.m_onPush.call(this._target, cell);
        }
        cell.id = 0;
        cell.index = 0;
        cell.param = null;
    }

    public Push(cell : T) {
        this._Push(cell, true);
    }

    public Clear() {        
        for (let i = 0; i < this.m_items.length; i++) {
            this._Push(this.m_items[i], false);
        }
        this.m_items.clear();
    }
}
