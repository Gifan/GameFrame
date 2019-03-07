import { Cell } from "./Cell";
import { Time } from "../Time";
import { AbsScrollLayout, ScrollEvent, ScrollRecord } from "./AbsScrollLayout";
import { ScrollHorizontal } from "./ScrollHorizontal";
import { ScrollVertical } from "./ScrollVertical";
import { AbsCell } from "./AbsCell";

type EventHandler = (value : cc.Vec2) => void;
type EventHandlerWithSelf = (slider : ScrollViewCell, value : cc.Vec2) => void;

export class ScrollViewCell extends Cell {
    public Init(node : cc.Node) {
        super.Init(node);
        
        this._scrollView = node.getComponent(cc.ScrollView);
    }

    private _scrollView : cc.ScrollView;
    private _initListener = false;
    private _handler : EventHandler;
    private _handlerWithSelf : EventHandlerWithSelf;
    private _target :any;

    private initListener() {
        if (this._initListener) {
            return;
        }
        this._initListener = true;

        this._node.on("scrolling", this.onScrolling, this)
    }

    private onScrolling(event) : void {
        //cc.log(this.node.name, "ScrollbarCell.onSlide", event);
        if (this.isLoop) {
            this._scrollLayout.Refresh();
        }

        if (this._handler != null) {
            this._handler.call(this._target, this._scrollView.getContentPosition());
        } else if (this._handlerWithSelf != null) {
            this._handlerWithSelf.call(this._target, this, this._scrollView.getContentPosition());
        }
    }

    /// <summary>
    /// 设置点击事件回调，不支持多个回调，每次设置覆盖之前的回调
    /// </summary>
    public SetListener(handler : EventHandler, target : any) : void {
        this.initListener();
        this._handler = handler;
        this._handlerWithSelf = null;
        this._target = target;
    }

    /// <summary>
    /// 设置点击事件回调，不支持多个回调，每次设置覆盖之前的回调
    /// </summary>
    public SetListenerWithSelf(handler : EventHandlerWithSelf, target : any) : void {
        this.initListener();
        this._handler = null;
        this._handlerWithSelf = handler;
        this._target = target;
    }

    /// <summary>
    /// 清空点击回调
    /// </summary>
    public ClearListener() : void {
        this._handler = null;
        this._handlerWithSelf = null;
        this._target = null;
    }

    public Free() : void {
        this.ClearListener();
    }

    public get content() : cc.Node {
        return this._scrollView.content;
    }

    //warning 全部item必须是统一的anchor
    public trunTo(item : AbsCell, delay = 0.001) {
        Time.delay(delay, () => {
            if (this._scrollView.horizontal) {
                let nodeWidth = this.node.width;
                let contentWidth = this.content.width;
                let x = nodeWidth * this.node.anchorX - item.node.width * item.node.anchorX + item.node.x;
                if (nodeWidth > contentWidth) {
                    this.content.x = x;                    
                } else {
                    this.content.x = -x; 
                }

                //cc.error("trunTo", this._scrollView.name, x, item.node.x, nodeWidth, contentWidth);
            } else {
                let nodeHeight = this.node.height;
                let contentHeight = this.content.height;
                let y = nodeHeight * this.node.anchorY - item.node.height * (1 - item.node.anchorY) - item.node.y;
                if (nodeHeight > contentHeight) {
                    this.content.y = -y;
                } else {
                    this.content.y = y; 
                }
                //cc.error("trunTo", this._scrollView.name, "horizontal", this._scrollView.horizontal, y, item.node.y, nodeHeight, contentHeight);
            }
        });
    }

    public get horizontal() {
        return this._scrollView.horizontal;
    }

    //支持无限滚动
    private _isLoop = false;
    public get isLoop() { 
        return this._isLoop;
     }

    private _scrollLayout : AbsScrollLayout;

    //开启无限滚动循环
    public InitLoop(ctor : {new(node : cc.Node): AbsCell; }, onCreate : ScrollEvent, onPop : ScrollEvent, onPush : ScrollEvent, target : any) {
        if (this.isLoop) {
            cc.error("InitLoop repeat");
            return;
        }
        this._isLoop = true;
        this.initListener();

        if (this._scrollView.horizontal) {
            this._scrollView.vertical = false;
            this._scrollLayout = new ScrollHorizontal(this._scrollView, ctor, onCreate, onPop, onPush, target);
        } else {
            this._scrollView.vertical = true;
            this._scrollLayout = new ScrollVertical(this._scrollView, ctor, onCreate, onPop, onPush, target);
        }
    }

    public get RecordCount() { 
        return this._scrollLayout.records.length;
    }

    public GetRecord(index : number) : ScrollRecord {
        if (index < 0 || index >= this._scrollLayout.records.length) {
            cc.error("ScrollLoop.GetRecord:" + index + " out range:" + this._scrollLayout.records.length);
            return null;
        }
        let record = this._scrollLayout.records[index];
        return record;
    }

    public FindRecord(id : number, kind : number = 0) : ScrollRecord {
        for (let i = 0; i < this._scrollLayout.records.length; i++) {
            let record = this._scrollLayout.records[i];
            if (id != record.id) {
                continue;
            }
            if (kind != record.kind) {
                cc.warn("FindRecord skip kind", id, kind, record.id, record.kind)
                continue;
            }
            return record;
        }
        cc.log("FindRecord fail, id:" + id);
        return null;
    }

    public IndexOf(record : ScrollRecord) : number {
        if (record == null) {
            cc.error("ScrollLoop.FindIndex null");
            return -1;
        }
        return this._scrollLayout.records.indexOf(record);
    }

    public AddRecord(record : ScrollRecord) {
        if (record == null) {
            cc.error("ScrollLoop.AddRecord null");
            return;
        }
        this._scrollLayout.AddRecord(record);
    }

    public DelRecord(record : ScrollRecord) {
        if (record == null) {
            cc.error("ScrollLoop.DelRecord null");
            return;
        }
        this._scrollLayout.DelRecord(record);
    }

    public InsertRecord(index : number, record : ScrollRecord) {
        if (record == null) {
            cc.error("ScrollLoop.InsertRecord null");
            return;
        }
        this._scrollLayout.InsertRecord(index, record);
    }

    public ResizeRecord(record : ScrollRecord, size : cc.Vec2) {
        if (record == null) {
            cc.error("ScrollLoop.ResizeRecord null");
            return;
        }
        this._scrollLayout.ResizeRecord(record, size);
    }

    public ShowRecord(record : ScrollRecord) {
        if (record == null) {
            cc.error("ScrollLoop.ShowRecord null");
            return;
        }
        this._scrollLayout.ShowRecord(record);
    }

    public SortRecord(cmp : (a: ScrollRecord, b: ScrollRecord) => number) {
        if (cmp == null) {
            cc.error("ScrollLoop.SortRecord null");
            return;
        }
        this._scrollLayout.SortRecord(cmp);
    }

    public Build() {
        this._scrollLayout.Build();
    }

    public Clear() {
        this._scrollLayout.Clear();
    }
    
}
