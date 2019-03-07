import { AbsScrollLayout, ScrollEvent, RectOffset, ScrollRecord, kOffset } from "./AbsScrollLayout";
import { AbsCell } from "./AbsCell";

export class ScrollVertical extends AbsScrollLayout {
    private childForceExpandWidth = true;

    public constructor(scroll : cc.ScrollView, ctor : {new(node : cc.Node): AbsCell; }, onCreate : ScrollEvent, onPop : ScrollEvent, onPush : ScrollEvent, target : any) {
        super(scroll, ctor, onCreate, onPop, onPush, target);
        this._content.anchorX = 0.5;
        this._content.anchorY = 1;
        this._origin = cc.v2(0, this._content.height * 0.5);
        let layout = this._content.getComponent(cc.Layout);
        if (layout == null) {
            this._padding = new RectOffset();
            return;
        }            
        if (layout.type == cc.Layout.Type.VERTICAL) {
            this._padding = new RectOffset(layout.paddingLeft, layout.paddingRight, layout.paddingTop, layout.paddingBottom);
            this._spacing.y = layout.spacingY;
            this._maxPerLine = 1;
            if (this.childForceExpandWidth) {
                let width = this._content.width -  this._padding.left -  this._padding.right;
                let bar = scroll.verticalScrollBar;
                if (bar != null) {
                    width -= bar.node.width;
                }
                if (width < 0) {
                    cc.error("ScrollVertical error content.width:" + width);
                }
                for (let index = 0; index < this._prefabs.length; index++) {
                    const prefab = this._prefabs[index];
                    prefab.SetSize(width, -1);                
                }
            }
        } else if (layout.type == cc.Layout.Type.GRID) {
            //不支持变长
            this._padding = new RectOffset(layout.paddingLeft, layout.paddingRight, layout.paddingTop, layout.paddingBottom);
            this._spacing.x = layout.spacingX;
            this._spacing.y = layout.spacingY;
            let width = this._content.width -  this._padding.left -  this._padding.right;
            let bar = scroll.verticalScrollBar;
            if (bar != null) {
                width -= bar.node.width;
            }
            if (width < 0) {
                cc.error("ScrollVertical error content.width:" + width);
            }
            this._maxPerLine = Math.floor(width / layout.cellSize.width);
            //cc.error("maxPerLine", this._maxPerLine, "width", width, layout.cellSize.width);
        } else {
            cc.error("ScrollVertical unsupport Layout:" + layout);
        }
        layout.enabled = false;
        layout.destroy();       
        //cc.log("ScrollVertical" + this._viewRect.height + " pad:" + this._padding + " space:" + this._spacing);
    }

    protected SetPostionByIndex(index : number, record : ScrollRecord) {
        let pos : cc.Vec2;
        let prefab = this._prefabs[record.prefabIndex];
        if (index >= this._maxPerLine) {
            let prevRecord = this._records[index - this._maxPerLine];
            let prevPrefab = this._prefabs[prevRecord.prefabIndex];
            pos = prevRecord.position.clone();
            pos.y -= prevRecord.size.y * prevPrefab.pivot.y + record.size.y * (1 - prefab.pivot.y) + this._spacing.y;
            record.SetPosition(pos);
            //cc.log("SetPostionByIndex2", index, record.position, record);
        } else {
            let offset = index % this._maxPerLine;
            pos = new cc.Vec2(this._padding.left, this._padding.top);
            pos.x += record.size.x * (offset + prefab.pivot.x) + offset * this._spacing.x - this._viewRect.width * 0.5;
            pos.y += record.size.y * (1 - prefab.pivot.y);
            pos.y = -pos.y;
            record.SetPosition(pos);
            //cc.log("SetPostionByIndex", index, record.position, record);
        }
    }

    public DelRecord(record : ScrollRecord) {
        let index : number = this._records.indexOf(record);
        if (index == -1) {
            cc.error("ScrollVertical.DelRecord can't find record:" + record.id + " " + record.kind);
            return;
        }
        this._records.removeAt(index);
        if (record.cell != null) {
            this.Push(record);
        }

        let curRecord : ScrollRecord;
        if (this._maxPerLine == 1) {
            let size = record.size.y + this._spacing.y;				
            for (let i = index; i < this._records.length; i++) {
                curRecord = this._records[i];
                let position = curRecord.position.clone();
                position.y += size;
                curRecord.SetPosition(position);
            }
            if (index <= this._headIndex) {
                this._headIndex = this._headIndex > 0 ? this._headIndex - 1 : 0;
                this.ChangeContentPosition(-size);
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
            cc.error("ScrollVertical.InsertRecord out range:" + index + " " + this._records.length);
            return;
        }
        
        let prefab = this._prefabs[record.prefabIndex];
        record.InitPivot(prefab.pivot);
        record.InitSize(prefab.size);
        this.SetPostionByIndex(index, record);
        this._records.insert(index, record);

        let curRecord : ScrollRecord;
        if (this._maxPerLine == 1) {
            let size = record.size.y + this._spacing.y;				
            for (let i = index + 1; i < this._records.length; i++) {
                curRecord = this._records[i];
                let position = curRecord.position.clone();
                position.y -= size;
                curRecord.SetPosition(position);
            }
            if (index < this._headIndex) {
                this._headIndex = this._headIndex + 1;
                this.ChangeContentPosition(size);
            }
            this.Build();
        } else {
            curRecord = this._records[index + 1];
            let nextRecord : ScrollRecord = null;
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

        let index : number = this._records.indexOf(record);
        if (index == -1) {
            cc.error("ScrollVertical.ResizeRecord can't find record:" + record.id + " " + record.kind);
            return;
        }
        
        let offset = size.y - record.size.y;
        let position = record.position.clone();
        position.y -= offset * (1 - record.pivot.y);
        record.SetPosition(position);
        record.SetSize(size);

        let curRecord : ScrollRecord;
        if (this._maxPerLine == 1) {		
            for (let i = index + 1; i < this._records.length; i++) {
                curRecord = this._records[i];
                position = curRecord.position.clone();
                position.y -= offset;
                curRecord.SetPosition(position);
            }
            this.Build();
            if (index <= this._headIndex) {
                this.ChangeContentPosition(offset);
            }
        } else {
            cc.error("ScrollVertical.ResizeRecord unsupport grid");
        }
    }
    
    public ShowRecord(record : ScrollRecord) {
        let index : number = this._records.indexOf(record);
        if (index == -1) {
            cc.error("ScrollVertical.ShowRecord can't find record:" + record.id + " " + record.kind);
            return;
        }
        
        let position = this._content.position.clone();
        position.y = -record.min.y;
        let max = this._content.height - this._viewRect.height;
        if (position.y > max) {
            position.y = max;
        }
        position.y += this._viewRect.height * 0.5;
        this._content.position = position;
        this._curPos = position.clone();
    }
    
    private ChangeContentPosition(offset : number) {            
        let position = this._content.position.clone();
        position.y += offset;
        this._content.position = position;
        this._curPos = position.clone();			
    }

    public Build() {
        if (this._records.length < 1) {
            return;
        }
        let sizeDelta = this._content.getContentSize();
        let lastRecord = this._records[this._records.length - 1];
        let extent = -lastRecord.position.y + lastRecord.size.y * lastRecord.pivot.y + this._padding.bottom;
        sizeDelta.height = extent;
        this._content.setContentSize(sizeDelta);
        this.OnShowNext();				
    }

    protected Drag() : boolean {
        let dist = this._lastPos.y - this._curPos.y;
        if (Math.abs(dist) < kOffset) {
            return false;
        }
        if (dist < 0) {
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
        let border = this._viewRect.height + kOffset;
        let y = this._curPos.y - this._viewRect.height * 0.5;
        let record : ScrollRecord, recordInLine : ScrollRecord;
        this._showCount = 0;
        for (; cursor < this._records.length; ) {
            record = this._records[cursor];
            offset = -(record.max.y + y);
            if (offset < -kOffset) {
                for (let index : number = cursor; index < cursorNext; index++) {
                    recordInLine = this._records[index];
                    if (recordInLine.cell != null) {
                        this.Push(recordInLine);
                    }
                    this._headIndex = cursorNext;
                }
            } else {
                offset = -(record.min.y + y);
                if (offset < border) {
                    for (let index : number = cursor; index < cursorNext; index++) {
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
        cc.log("OnShowNext", this._headIndex, cursor, "count", this._showCount, "record", record, this._curPos.y, y, border)
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
        let border = this._viewRect.height + kOffset;
        let y = this._curPos.y - this._viewRect.height * 0.5;
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
            offset = -(record.min.y + y);
            if (offset > border) {
                for (let index : number = cursor; index < cursorNext; index++) {
                    if (index >= this._records.length) {
                        break;
                    }
                    recordInLine = this._records[index];
                    if (recordInLine.cell != null) {
                        this.Push(recordInLine);
                    }						
                }
            } else {					
                offset = -(record.max.y + y);
                if (offset > -kOffset) {
                    for (let index : number = cursor; index < cursorNext; index++) {
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