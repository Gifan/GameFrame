import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { DefaultTransition } from "../../../frame/mvcs/transition/DefaultTransition";
import { Time } from "../../../frame/Time";

import { CellPool } from "../../../frame/extension/CellPool";
import { Cell } from "../../../frame/extension/Cell";
import { FlowTipsArgs } from "./FlowTipsArgs"
import { FlowTipsUI } from "./uiGen/FlowTipsUI";
import { FontSheet } from "../../component/FontSheet";
import { ListenID } from "../../ListenID";
import { UIManager } from "../../../frame/UIManager";
import { Cfg } from "../../config/Cfg";


const kFlowDelay = 0.2

export class FlowTipsView extends MVCS.AbsView {
    public constructor() {
        super("ui/FlowTipsUI@FlowTips", MVCS.eUILayer.Guide, MVCS.eUIQueue.None, new DefaultTransition())
        
    }

    private _ui : FlowTipsUI;
    private _fontSheet : FontSheet;
    private _numPool : CellPool<Cell>;
    private _txtPool : CellPool<Cell>;
    private _icoPool : CellPool<Cell>;
    private _txtOffset = 50;
    private _center : cc.Vec2;

    protected onLoad() : void {
        //cc.log(this.getType(),"onLoad")

        let ui = new FlowTipsUI(this.node);
        this._ui = ui;
        this._fontSheet = ui.fontSheet.getComponent(FontSheet);
        this._numPool = new CellPool<Cell>(Cell, ui.numCell, this.node);
        this._txtPool = new CellPool<Cell>(Cell, ui.txtCell, this.node);
        this._txtOffset = ui.txtCell.image.node.width - ui.txtCell.richText.node.width;
        this._icoPool = new CellPool<Cell>(Cell, ui.icoCell, this.node);

        this._center = MVCS.designCenter().clone();
    }

    protected onUnload() : void {
        if (this._ui != null) {
            this._ui.Free();
            this._ui = null;            
        }
        this._fontSheet = null;
    }

    protected changeListener(enable : boolean) : void {
        Notifier.changeListener(enable, ListenID.Flow_Num, this.OnFlowNum, this);
        Notifier.changeListener(enable, ListenID.Flow_Txt, this.OnFlowTxt, this);
        Notifier.changeListener(enable, ListenID.Flow_Icon, this.OnFlowIco, this);
    }

    private _numQueue : FlowTipsArgs[] = [];
    private OnFlowNum(args : FlowTipsArgs) : void {
        //cc.log("OnFlowNum ", args.info, this._numQueue.length)
        
        this._numQueue.push(args);
        if (this._numQueue.length == 1) {
            this.showFlowNum(args);
            Time.delay(kFlowDelay, this.popFlowNum, null, this);
        }
    }

    private popFlowNum() {
        this._numQueue.shift();
        if (this._numQueue.length > 0) {
            this.showFlowNum(this._numQueue[0]);
            Time.delay(kFlowDelay, this.popFlowNum, null, this);
        }
    }

    private showFlowNum(args : FlowTipsArgs) : void {
        //cc.log("showFlowNum ", args.info);

        let cell = this._numPool.Pop();
        cell.mainText.string = args.info;
        if (args.parent != null) {
            cell.node.parent = args.parent;
            cell.node.setGroup(args.parent.group);
        }
        if (args.position != null) {
            cell.node.position = args.position;
        } else {
            cell.node.position = this._center;
        }
        //cc.log("OnFlowNum", args.font, this._fontSheet.get(args.font));
        cell.mainText.font = this._fontSheet.get(args.font);
        cell.mainText.fontSize = args.fontSize;
        let anim = cell.animation.play();
        anim.wrapMode = cc.WrapMode.Normal;

        Time.delay(1.2, this.onFlowNumFinish, cell, this);
    }

    private onFlowNumFinish(cell : Cell) {
        cell.node.parent = this.node;
        this._numPool.Push(cell);
    }

    private _txtQueue : FlowTipsArgs[] = [];
    private OnFlowTxt(args : FlowTipsArgs) : void {
        //cc.log("OnFlowTxt ")
        this._txtQueue.push(args);
        if (this._txtQueue.length == 1) {
            this.showFlowTxt(args);
            Time.delay(kFlowDelay, this.popFlowTxt, null, this);
        }
    }

    private popFlowTxt() {
        this._txtQueue.shift();
        if (this._txtQueue.length > 0) {
            this.showFlowTxt(this._txtQueue[0]);
            Time.delay(kFlowDelay, this.popFlowTxt, null, this);
        }
    }

    private showFlowTxt(args : FlowTipsArgs) : void {
        let cell = this._txtPool.Pop();
        cell.richText.string = args.info;
        //cell.image.node.width = cell.richText.node.width + this._txtOffset;
        if (args.parent != null) {
            cell.node.parent = args.parent;
            cell.node.setGroup(args.parent.group);
        }
        if (args.position != null) {
            cell.node.position = args.position;
        } else {
            cell.node.position = this._center;
        }
        let anim = cell.animation.play();
        anim.wrapMode = cc.WrapMode.Normal;

        Time.delay(1.2, this.onFlowTxtFinish, cell, this);
    }

    private onFlowTxtFinish(cell : Cell) {
        cell.node.parent = this.node;
        cell.node.setGroup(this.node.group);
        this._txtPool.Push(cell);
    }

    private _icoQueue : FlowTipsArgs[] = [];
    private OnFlowIco(args : FlowTipsArgs) : void {
        cc.log("OnFlowIco ", args);      
        this._icoQueue.push(args);
        if (this._icoQueue.length == 1) {
            this.showFlowIco(args);
            Time.delay(kFlowDelay, this.popFlowIco, null, this);
        }
    }

    private popFlowIco() {
        this._icoQueue.shift();
        if (this._icoQueue.length > 0) {
            this.showFlowIco(this._icoQueue[0]);
            Time.delay(kFlowDelay, this.popFlowIco, null, this);
        }
    }

    private showFlowIco(args : FlowTipsArgs) : void {
        let cell = this._icoPool.Pop();
        cell.icon.setResize(cc.Sprite.ResizeMode.Raw);
        if (args.icon) {
            cell.icon.setSprite(args.icon);            
        } else {
            let itemCfg = Cfg.Item.get(args.id);
            if (itemCfg) {
                cell.icon.setSprite(itemCfg.icon);                
            } else {
                cell.icon.releaseSprite();  
            }
        }
        cell.mainText.string = args.info || "∞";
        //cell.image.node.width = cell.richText.node.width + this._txtOffset;
        if (args.parent != null) {
            cell.node.parent = args.parent;
            cell.node.setGroup(args.parent.group);
        }
        if (args.position != null) {
            cell.node.position = args.position;
        } else {
            cell.node.position = this._center;
        }
        let anim = cell.animation.play();
        anim.wrapMode = cc.WrapMode.Normal;

        Time.delay(1.2, this.onFlowIcoFinish, cell, this);
    }

    private onFlowIcoFinish(cell : Cell) {
        cell.node.parent = this.node;
        cell.node.setGroup(this.node.group);
        this._icoPool.Push(cell);
    }
}
