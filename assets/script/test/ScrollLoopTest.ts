import { ScrollViewCell } from "../../frame/extension/ScrollViewCell";
import { ScrollRecord } from "../../frame/extension/AbsScrollLayout";
import { ButtonCell } from "../../frame/extension/ButtonCell";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property
    recordNum = 10;

    @property
    insertIndex = 0;

    @property
    resizeId = 5;

    @property
    resizeValue = 900;

    @property
    randomSize = true;

    private m_scroll : ScrollViewCell;
    private m_curser = 0;
    private m_prefabNum = 0;

    start() {
        this.m_scroll = new ScrollViewCell(this.node);
        this.m_scroll.InitLoop(ButtonCell, this.onCreateRecord, this.onPopRecord, this.onPushRecord, this);

        this.m_curser = this.recordNum;
        this.m_prefabNum = this.m_scroll.content.childrenCount;
        for (let i = 0; i < this.recordNum; i++) {
            var record = new ScrollRecord(i, 0, i % this.m_prefabNum);
            if (this.randomSize) {
                if (this.m_scroll.horizontal) {
                    record.SetSize(new cc.Vec2((i % this.m_prefabNum + 1) * 50, -1));
                } else {
                    record.SetSize(new cc.Vec2(-1, (i % this.m_prefabNum + 1) * 50));
                }
            }
            this.m_scroll.AddRecord(record);
        }
        this.m_scroll.Build();

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);   
    }

    // Update is called once per frame
    // update() {
       
    // }

    private onKeyUp(event) {        
        switch(event.keyCode) {
            case cc.macro.KEY.a:
                this.addRecord();
                break;
            case cc.macro.KEY.i:
                this.insertRecord();
                break;
            case cc.macro.KEY.r:
                this.resetRecord();
                break;
            case cc.macro.KEY.u:
                
                break;
            case cc.macro.KEY.k:
                
                break;
        }
    }

    private onCreateRecord(record : ScrollRecord) {
        var btn = record.cell as ButtonCell;
        btn.SetListenerWithSelf(this.onClickButton, this);
    }

    private onPopRecord(record : ScrollRecord) {
        cc.log("onPopRecord:" + record.id, record.position);
        let btn = record.cell as ButtonCell;
        btn.id = record.id;
        btn.mainText.string = record.id.toString();
    }

    private onPushRecord(record : ScrollRecord) {
        cc.log("onPushRecord:" + record.id);
    }

    private onClickButton(btn : ButtonCell) {
        var record = this.m_scroll.FindRecord(btn.id);
        if (record == null) {
            cc.error("onClickButton id:" + btn.id + " can't find record");
            return;
        }

        this.m_scroll.DelRecord(record);
        cc.warn("DelRecord remain:" + this.m_scroll.RecordCount);
    }

    private addRecord() {
        var record = new ScrollRecord(this.m_curser, 0, this.m_curser % this.m_prefabNum);
        if (this.randomSize) {
            if (!this.m_scroll.horizontal) {
                record.SetSize(cc.v2(-1, (this.m_curser % this.m_prefabNum + 1) * 50));
            } else {
                record.SetSize(cc.v2((this.m_curser % this.m_prefabNum + 1) * 50, -1));
            }
        }
        this.m_scroll.AddRecord(record);
        this.m_scroll.Build();

        ++this.m_curser;
        cc.log("addRecord:" + record.id);
    }

    private insertRecord() {
        var record = new ScrollRecord(this.m_curser, 0, this.m_curser % this.m_prefabNum);
        if (this.randomSize) {
            if (!this.m_scroll.horizontal) {
                record.SetSize(cc.v2(-1, (this.m_curser % this.m_prefabNum + 1) * 50));
            } else {
                record.SetSize(cc.v2((this.m_curser % this.m_prefabNum + 1) * 50, -1));
            }
        }
        this.m_scroll.InsertRecord(this.insertIndex, record);
        this.m_scroll.Build();

        ++this.m_curser;
        cc.log("insertRecord:" + record.id + " index:" + this.insertIndex);
    }

    private resetRecord() {
        var record = this.m_scroll.FindRecord(this.resizeId);
        if (record == null) {
            cc.error("resetRecord id:" + this.resizeId + " can't find record");
            return;
        }

        if (!this.m_scroll.horizontal) {
            this.m_scroll.ResizeRecord(record, new cc.Vec2(-1, this.resizeValue));
        } else {
            this.m_scroll.ResizeRecord(record, new cc.Vec2(this.resizeValue, -1));
        }
        cc.log("insertRecord:" + record.id + " resizeValue:" + this.resizeValue);
    }
}
