import { Cell } from "./Cell";

type EventHandler = (value : number) => void;
type EventHandlerWithSelf = (bar : BarCell, value : number) => void;

export class BarCell extends Cell {
    public Init(node : cc.Node) {
        super.Init(node);
        
        this._bar = node.getComponent(cc.ProgressBar);
        this._handle = this.node.getChildByName("_handle");
        let child = this.node.getChildByName("_rate");
        if (child != null) {
            this._rate = child.getComponent(cc.Label);
        }
    }

    private _handle : cc.Node;
    private _rate : cc.Label;

    private _bar : cc.ProgressBar;

    public get progress() {
        return this._bar.progress;
    }

    public set progress(value : number) {
        this._bar.progress = value;
        if (this._handle != null) {
            let fillNode = this._bar.barSprite.node;
            this._handle.x = fillNode.x + fillNode.width;
        }
        if (this._rate != null) {
            this._rate.string = (value * 100).toFixed(1) + "%";            
        }
    }
}
