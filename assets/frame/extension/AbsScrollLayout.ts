import { AbsCell } from "./AbsCell";

/// <summary>
/// 只支持在Anchors左上角的预制件，即anchorMin=anchorMax=[0,1]
/// 只支持从左向右，从上向下拖拽
/// </summary>
export class ScrollPrefab {
    public constructor(node : cc.Node) {
        this._node = node;
        this._size = cc.v2(node.width, node.height);
        this._pivot = cc.v2(node.anchorX, node.anchorY);	
    }

    private _node : cc.Node
    public get node()  {
        return this._node;
    }

    private _size : cc.Vec2
    public get size()  {
        return this._size;
    }

    private _pivot : cc.Vec2
    public get pivot()  {
        return this._pivot;
    }
    
    public SetSize(x : number, y : number) {
        if (x > 0) {
            this._size.x = x;
        }
        if (y > 0) {
            this._size.y = y;
        }
        this._node.setContentSize(this._size.x, this._size.y);
    }
}

export class ScrollRecord {
    public constructor(id : number, kind = 0, prefabIndex = 0) {
        this.id = id;
        this.kind = kind;
        this._prefabIndex = prefabIndex;
    }

    public Init(id : number, kind : number, prefabIndex : number) {
        this.id = id;
        this.kind = kind;
        this._prefabIndex = prefabIndex;
    }

    public id : number
    public kind : number

    protected _prefabIndex : number;
    public get prefabIndex() {
        return this._prefabIndex;
    }

    protected _cell : AbsCell;
    public get cell() {
        return this._cell;
    }

    private _size : cc.Vec2;
    public get size() {
        if (this._size == null) {
            return cc.Vec2.ZERO;
        }
        return this._size;        
    }
    
    protected _pivot : cc.Vec2 = new cc.Vec2();
    public get pivot()  {
        return this._pivot;
    }

    private _position : cc.Vec2;
    public get position() {
        if (this._position == null) {
            return cc.Vec2.ZERO;
        }
        return this._position;        
    }
    
    protected _min : cc.Vec2 = new cc.Vec2();
    public get min()  {
        return this._min;
    }

    protected _max : cc.Vec2 = new cc.Vec2();
    public get max()  {
        return this._max;
    }

    public data : any;
    
    public InitPrefabIndex(index : number) {
        this._prefabIndex = index;
    }
    
    public InitPivot(pivot : cc.Vec2) {
        this._pivot = pivot;
    }
    
    public InitSize(size : cc.Vec2) {
        if (this._size != null) {
            if (this._size.x > 0) {
                size.x = this._size.x;
            }
            if (this._size.y > 0) {
                size.y = this._size.y;
            }
        }
        this._size = size;			
    }
    
    private CalculateRange() {
        this._min.x = this.position.x - this.size.x * this.pivot.x;
        this._min.y = this.position.y + this.size.y * (1 - this.pivot.y);
        this._max.x = this.position.x + this.size.x * (1 - this.pivot.x);
        this._max.y = this.position.y - this.size.y * this.pivot.y;
    }

    public SetCell(cell : AbsCell) {
        this._cell = cell;
        if (cell == null) {
            return;
        }
        let node = cell.node;
        if (node.width != this.size.x || node.height != this.size.y) {
            node.setContentSize(this.size.x, this.size.y);                
        }
    }

    public SetSize(size : cc.Vec2) {
        if (this._size != null) {
            if (size.x <= 0) {
                size.x = this._size.x;
            }
            if (size.y <= 0) {
                size.y = this._size.y;
            }
        }
        this._size = size;
        if (this._position != null) {
            this.CalculateRange();
        }
        if (this.cell == null) {
            return;
        }
        let node = this.cell.node;
        if (node.width != this.size.x || node.height != this.size.y) {
            node.setContentSize(this.size.x, this.size.y);                
        }
    }

    public SetPosition(position : cc.Vec2) {
        this._position = position;
        if (this._size != null) {
            this.CalculateRange();
        }
        if (this.cell != null) {
            this.cell.node.position = position;
        }
    }

    public toString() : string {
        let str = "{ScrollRecord id:{0} kind:{1} prefab:{2} pos:{3} size:{4} data:{5}}".format(
            this.id, this.kind, this.prefabIndex, this.position, this.size, this.data
        );
        return str;
    }    
}

export class RectOffset {
    public constructor(left = 0, right = 0, top = 0, bottom = 0) {
        this._left = left;
        this._right = right;
        this._top = top;
        this._bottom = bottom;
    }

    protected _bottom : number;
    public get bottom()  {
        return this._bottom;
    }

    protected _left : number;
    public get left()  {
        return this._left;
    }

    protected _right : number;
    public get right()  {
        return this._right;
    }

    protected _top : number;
    public get top()  {
        return this._top;
    }

    public get horizontal() { 
        return this.left + this.right;
    }

    public get vertical() { 
        return this.top + this.bottom;
    }
}

export type ScrollEvent = (record : ScrollRecord) => void;

export const kOffset = 15;

export const kHidePos = new cc.Vec2(-1000, 1000);

/// <summary>
/// 无限滚动布局抽象类
/// 禁止设置viewport，content的偏移大小，只能在Layout中设置padding
/// </summary>
export abstract class AbsScrollLayout {
    protected _cellCtor : {new(node : cc.Node): AbsCell; }
    protected _onCellCreate : ScrollEvent;
    protected _onCellPop : ScrollEvent;
    protected _onCellPush : ScrollEvent;
    protected _target : any;

    public constructor(scroll : cc.ScrollView, ctor : {new(node : cc.Node): AbsCell; }, onCreate : ScrollEvent, onPop : ScrollEvent, onPush : ScrollEvent, target : any) {
        this._cellCtor = ctor;

        this._onCellCreate = onCreate;
        this._onCellPop = onPop;
        this._onCellPush = onPush;
        this._target = target;

        this._node = scroll.node;
        this._content = scroll.content;
        this._viewRect = this._node.getContentSize();

        let prefabCount = this._content.childrenCount;
        this._prefabs = [];
        this._pools = [];
        for (let i = 0; i < prefabCount; i++) {
            let child = this._content.children[i];
            child.active = false;
            child.position = kHidePos.clone();
            let prefab = new ScrollPrefab(child);
            this._prefabs.push(prefab);
            this._pools.push([]);
        }

        this._curPos = this._content.position;
        this._lastPos = this._curPos;
    }

    protected _node : cc.Node;
    protected _content : cc.Node;
    protected _viewRect : cc.Size;
    protected _padding : RectOffset;
    protected _spacing : cc.Vec2 = new cc.Vec2();
    protected _origin  : cc.Vec2 = new cc.Vec2();

    protected _headIndex = 0;
    protected _showCount = 0;

    protected _maxPerLine = 1;
    protected _prefabs : ScrollPrefab[];
    private _pools : AbsCell[][];
    protected _records : ScrollRecord[] = [];

    protected _curPos : cc.Vec2;
    protected _lastPos : cc.Vec2;

    public get records() {
        return this._records;        
    }
    
    private _dynamic = false;
    public SetDynamic(enable : boolean) {
        this._dynamic = enable;
    }

    public Refresh() {
        if (this._showCount <= 0) {
            return;
        }
        this._curPos = this._content.position;
        if (this._showCount >= this._records.length) {
            this._lastPos = this._curPos.clone();
            return;
        }
        if (this._lastPos.fuzzyEquals(this._curPos, 0.01)) {
            return;
        }
        if (this._dynamic) {
            this._viewRect = this._node.getContentSize();
        }
        if (this.Drag()) {
            this._lastPos = this._curPos.clone();				
        }
    }

    protected abstract Drag() : boolean;

    public abstract Build() : void;

    public Clear() {
        let max = this._headIndex + this._showCount;
        for (let i = this._headIndex; i < max; i++) {
            let record = this._records[i];
            this.Push(record);
        }
        this._headIndex = 0;
        this._showCount = 0;
        this._records.clear();
        this._curPos = this._origin;
        this._lastPos = this._origin;
        this._content.position = this._origin;
    }
    
    protected abstract SetPostionByIndex(index : number, record : ScrollRecord);

    public AddRecord(record : ScrollRecord) {
        let prefab = this._prefabs[record.prefabIndex];
        record.InitPivot(prefab.pivot);
        record.InitSize(prefab.size);
        
        let index = this._records.length;
        this.SetPostionByIndex(index, record);
        this._records.push(record);
    }

    public abstract DelRecord(record : ScrollRecord);
    
    public abstract InsertRecord(index : number, record : ScrollRecord);
    
    public abstract ResizeRecord(record : ScrollRecord, size : cc.Vec2);
    
    public abstract ShowRecord(record : ScrollRecord);
    
    public SortRecord(cmp : (a: ScrollRecord, b: ScrollRecord) => number) {
        let max = this._headIndex + this._showCount;
        for (let i = this._headIndex; i < max; i++) {
            let record = this._records[i];
            this.Push(record);
        }
        this._headIndex = 0;
        this._showCount = 0;
        this._curPos = cc.Vec2.ZERO;
        this._lastPos = cc.Vec2.ZERO;
        this._content.position = cc.Vec2.ZERO;
        this._records.sort(cmp);
        for	(let i = 0; i < this._records.length; i++) {
            this.SetPostionByIndex(i, this._records[i]);
        }
        this.Build();
    }

    protected Pop(record : ScrollRecord) : AbsCell {
        let prefabIndex = record.prefabIndex;
        if (prefabIndex >= this._pools.length || prefabIndex < 0) {
            cc.error("ScrollLoopPool.Pop prefabIndex:" + prefabIndex + " out range:" + this._pools.length);
            return null;
        }
        let stack = this._pools[prefabIndex];
        let scrollCell : AbsCell;
        if (stack.length <= 0) {
            let prefab = this._prefabs[prefabIndex];
            let inst = cc.instantiate(prefab.node);
            scrollCell = new this._cellCtor(inst);
            record.SetCell(scrollCell);
            scrollCell.node.setParent(this._content);
            scrollCell.node.scale = 1;
            scrollCell.node.position = record.position.clone();
            scrollCell.node.active = (true);
            if (this._onCellCreate != null) {
                this._onCellCreate.call(this._target, record);
            }
        } else {
            scrollCell = stack.pop();
            scrollCell.node.position = record.position.clone();
        }
        
        record.SetCell(scrollCell);
        if (this._onCellPop != null) {
            this._onCellPop.call(this._target, record);
        }
        return scrollCell;
    }

    protected Push(record : ScrollRecord) {
        if (this._onCellPush != null) {
            this._onCellPush.call(this._target, record);
        }
        let prefabIndex = record.prefabIndex;
        let stack = this._pools[prefabIndex];
        stack.push(record.cell);
        record.cell.node.position = kHidePos.clone();
        record.SetCell(null);
    }
}
