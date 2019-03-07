import { AbsScrollLayout, ScrollEvent, RectOffset, ScrollRecord, kOffset } from "./AbsScrollLayout";
import { AbsCell } from "./AbsCell";

export class ScrollHorizontal extends AbsScrollLayout {
    private childForceExpandHeight = true;

    public constructor(scroll : cc.ScrollView, ctor : {new(node : cc.Node): AbsCell; }, onCreate : ScrollEvent, onPop : ScrollEvent, onPush : ScrollEvent, target : any) {
        super(scroll, ctor, onCreate, onPop, onPush, target);
        this._content.anchorX = 0;
        this._content.anchorY = 0.5;
        this._origin = cc.v2(-this._content.width * 0.5, 0);
        let layout = this._content.getComponent(cc.Layout);
        if (layout == null) {
            this._padding = new RectOffset();
            return;
        }            
        if (layout.type == cc.Layout.Type.HORIZONTAL) {
            this._padding = new RectOffset(layout.paddingLeft, layout.paddingRight, layout.paddingTop, layout.paddingBottom);
            this._spacing.x = layout.spacingX;
            this._maxPerLine = 1;
            if (this.childForceExpandHeight) {
                let height = this._content.height -  this._padding.top -  this._padding.bottom;
                let bar = scroll.horizontalScrollBar;
                if (bar != null) {
                    height -= bar.node.height;
                }
                if (height < 0) {
                    cc.error("ScrollHorizontal error content.height:" + height);
                }
                for (let index = 0; index < this._prefabs.length; index++) {
                    const prefab = this._prefabs[index];
                    prefab.SetSize(-1, height);                
                }
            }
        } else if (layout.type == cc.Layout.Type.GRID) {
            //不支持变长
            this._padding = new RectOffset(layout.paddingLeft, layout.paddingRight, layout.paddingTop, layout.paddingBottom);
            this._spacing.x = layout.spacingX;
            this._spacing.y = layout.spacingY;
            let height = this._content.height -  this._padding.top -  this._padding.bottom;
            let bar = scroll.horizontalScrollBar;
            if (bar != null) {
                height -= bar.node.height;
            }
            if (height < 0) {
                cc.error("ScrollHorizontal error content.height:" + height);
            }
            this._maxPerLine = Math.floor(height / layout.cellSize.height);
            cc.error("maxPerLine", this._maxPerLine, "height", height, layout.cellSize.height);
        } else {
            cc.error("ScrollHorizontal unsupport Layout:" + layout);
        }
        layout.enabled = false;
        layout.destroy();
    }

    protected SetPostionByIndex(index : number, record : ScrollRecord) {
        let pos;
        let prefab = this._prefabs[record.prefabIndex];
        if (index >= this._maxPerLine) {
            let prevRecord = this._records[index - this._maxPerLine];
            let prevPrefab = this._prefabs[prevRecord.prefabIndex];
            pos = prevRecord.position.clone();
            pos.x += prevRecord.size.x * (1 - prevPrefab.pivot.x) + record.size.x * prefab.pivot.x + this._spacing.x;
            record.SetPosition(pos);
            //cc.log("SetPostionByIndex2", index, record.position, record);
        } else {
            let offset = index % this._maxPerLine;
            pos = new cc.Vec2(this._padding.left, this._padding.top);
            pos.x += record.size.x * prefab.pivot.x;
            pos.y += record.size.y * (offset + 1 - prefab.pivot.y) + offset * this._spacing.y - this._viewRect.height * 0.5;
            pos.y = -pos.y;
            record.SetPosition(pos);
            //cc.log("SetPostionByIndex", index, record.position, record);
        }
    }

    public DelRecord(record : ScrollRecord) {
        let index = this._records.indexOf(record);
        if (index == -1) {
            cc.error("ScrollHorizontal.DelRecord can't find record:" + record.id + " " + record.kind);
            return;
        }
        this._records.removeAt(index);
        if (record.cell != null) {
            this.Push(record);
        }
        
        let curRecord : ScrollRecord;
        if (this._maxPerLine == 1) {
            let size = record.size.x + this._spacing.x;				
            for (let i = index; i < this._records.length; i++) {
                curRecord = this._records[i];
                let position = curRecord.position.clone();
                position.x -= size;
                curRecord.SetPosition(position);
            }
            if (index <= this._headIndex) {
                this._headIndex = this._headIndex > 0 ? this._headIndex - 1 : 0;
                this.ChangeContentPosition(size);
            }
            this.Build();
        } else {
            let prevPosition = record.position.clone();
            for (let i = index; i < this._records.length; i++) {
                curRecord = this._records[i];
                let position = curRecord.position.clone();
                curRecord.SetPosition(prevPosition);
                prevPosition = position.clone();
            }
            if (index <= this._headIndex) {
                this.OnShowPrev();
            }
            this.Build();
        }
    }
    public InsertRecord(index : number, record : ScrollRecord) {
        if (index >= this._records.length) {
            cc.error("ScrollHorizontal.InsertRecord out range:" + index + " " + this._records.length);
            return;
        }
        
        let prefab = this._prefabs[record.prefabIndex];
        record.InitPivot(prefab.pivot);
        record.InitSize(prefab.size);
        this.SetPostionByIndex(index, record);
        this._records.insert(index, record);

        let curRecord : ScrollRecord;
        if (this._maxPerLine == 1) {
            let size = record.size.x + this._spacing.x;				
            for (let i = index + 1; i < this._records.length; i++) {
                curRecord = this._records[i];
                let position = curRecord.position.clone();
                position.x += size;
                curRecord.SetPosition(position);
            }
            if (index <= this._headIndex) {
                this._headIndex = this._headIndex + 1;
                this.ChangeContentPosition(-size);
            }
            this.Build();
        } else {
            curRecord = this._records[index + 1];
            let nextRecord : ScrollRecord= null;
            for (let i = index + 1; i < this._records.length; i++) {
                nextRecord = this._records[i + 1];
                curRecord.SetPosition(nextRecord.position.clone());
                curRecord = nextRecord;
            }
            if (nextRecord != null) {
                this.SetPostionByIndex(this._records.length - 1, nextRecord);
            }
            if (index < this._headIndex) {
                this.OnShowPrev();
            }
            this.Build();
        }
    }
    
    public ResizeRecord(record : ScrollRecord, size : cc.Vec2) {
        if (record.size == size) {
            return;
        }

        let index = this._records.indexOf(record);
        if (index == -1) {
            cc.error("ScrollHorizontal.ResizeRecord can't find record:" + record.id + " " + record.kind);
            return;
        }
        
        let offset = size.x - record.size.x;
        let position = record.position.clone();
        position.x += offset * record.pivot.x;
        record.SetPosition(position);
        record.SetSize(size);

        let curRecord : ScrollRecord;
        if (this._maxPerLine == 1) {		
            for (let i = index + 1; i < this._records.length; i++) {
                curRecord = this._records[i];
                position = curRecord.position.clone();
                position.x += offset;
                curRecord.SetPosition(position);
            }
            this.Build();
            if (index <= this._headIndex) {
                this.ChangeContentPosition(-offset);
            }
        } else {
            cc.error("ScrollHorizontal.ResizeRecord unsupport grid");
        }
    }
    
    public ShowRecord(record : ScrollRecord) {
        let index = this._records.indexOf(record);
        if (index == -1) {
            cc.error("ScrollHorizontal.ShowRecord can't find record:" + record.id + " " + record.kind);
            return;
        }
        
        let position = this._content.position.clone();
        position.x = -record.min.x;
        let max = this._content.width - this._viewRect.width;
        if (-position.x > max) {
            position.x = -max;
        }
        position.x -= this._viewRect.width * 0.5;
        this._content.position = position;
        this._curPos = position.clone();            
    }
    
    private ChangeContentPosition(offset : number) {            
        let position = this._content.position.clone();
        position.x += offset;
        this._content.position = position; 
        this._curPos = position.clone();
    }

    public Build() {
        if (this._records.length < 1) {
            return;
        }
        let sizeDelta = this._content.getContentSize();
        let lastRecord = this._records[this._records.length - 1];
        let extent = lastRecord.position.x + lastRecord.size.x * (1 - lastRecord.pivot.x) + this._padding.right;
        sizeDelta.width = extent;
        this._content.setContentSize(sizeDelta);
        this.OnShowNext();							
    }


    protected Drag() : boolean {
        let dist = this._lastPos.x - this._curPos.x;
        if (Math.abs(dist) < kOffset) {
            return false;
        }
        if (dist > 0) {
            this.OnShowNext();
        } else {
            this.OnShowPrev();
        }
        return true;
    }

    private OnShowNext() {
        let offset = 0;
        let cursor = this._headIndex;
        let cursorNext = cursor + this._maxPerLine;
        let border = this._viewRect.width + kOffset;
        let x = this._curPos.x + this._viewRect.width * 0.5;
        let record : ScrollRecord, recordInLine : ScrollRecord;
        this._showCount = 0;
        for (; cursor < this._records.length; ) {
            record = this._records[cursor];
            offset = record.max.x + x;
            if (offset < -kOffset) {
                for (let index = cursor; index < cursorNext; index++) {
                    recordInLine = this._records[index];
                    if (recordInLine.cell != null) {
                        this.Push(recordInLine);
                    }
                    this._headIndex = cursorNext;
                }
            } else {
                offset = record.min.x + x;
                if (offset < border) {
                    for (let index = cursor; index < cursorNext; index++) {
                        if (index >= this._records.length) {
                            cursor = index;
                            break;
                        }
                        recordInLine = this._records[index];
                        if (recordInLine.cell == null) {
                            this.Pop(recordInLine);
                        }
                        this._showCount += 1;
                    }
                } else {
                    //超出边界
                    break;
                }                    					
            }
            cursor = cursorNext;
            cursorNext = cursor + this._maxPerLine;
        }
        for (; cursor < this._records.length; cursor++) {
            record = this._records[cursor];
            if (record.cell != null) {
                this.Push(record);
            }						
        }
    }

    private OnShowPrev() {
        let offset = 0;
        let cursor = this._headIndex + Math.floor((this._showCount - 1) / this._maxPerLine) * this._maxPerLine;
        let cursorNext = cursor + this._maxPerLine;
        let border = this._viewRect.width + kOffset;
        let x = this._curPos.x + this._viewRect.width * 0.5;
        let record : ScrollRecord, recordInLine : ScrollRecord;
        this._showCount = 0;
        this._headIndex = 0;
        for (; cursor >= 0; ) {
            if (cursor >= this._records.length) {
                cursorNext = cursor;
                cursor = cursor - this._maxPerLine;
                continue;
            }
            record = this._records[cursor];
            offset = record.min.x + x;
            if (offset > border) {
                for (let index = cursor; index < cursorNext; index++) {
                    if (index >= this._records.length) {
                        break;
                    }
                    recordInLine = this._records[index];
                    if (recordInLine.cell != null) {
                        this.Push(recordInLine);
                    }						
                }
            } else {					
                offset = record.max.x + x;
                if (offset > -kOffset) {
                    for (let index = cursor; index < cursorNext; index++) {
                        if (index >= this._records.length) {
                            break;
                        }
                        recordInLine = this._records[index];
                        if (recordInLine.cell == null) {
                            this.Pop(recordInLine);
                        }
                        this._showCount += 1;
                    }
                    this._headIndex = cursor;
                } else {
                    cursor = cursorNext - 1;
                    break;
                }
            }
            cursorNext = cursor;
            cursor = cursor - this._maxPerLine;
        }					
        for (; cursor >= 0; cursor--) {
            if (cursor >= this._records.length) {
                continue;
            }
            record = this._records[cursor];
            if (record.cell != null) {
                this.Push(record);
            }						
        }
    }           
}
