import { Cell } from "./Cell";

type EventHandler = (value : number) => void;
type EventHandlerWithSelf = (slider : SliderCell, value : number) => void;

export class SliderCell extends Cell {
    public Init(node : cc.Node) {
        super.Init(node);
        
        this._slider = node.getComponent(cc.Slider);
        let child = this.node.getChildByName("_fill");
        if (child != null) {
            this._fill = child.getComponent(cc.Sprite);
        }
    }

    private _fill: cc.Sprite;

    private _slider : cc.Slider;
    private _initListener = false;
    private _handler : EventHandler;
    private _handlerWithSelf : EventHandlerWithSelf;
    private _target :any;

    private initListener() {
        if (this._initListener) {
            return;
        }
        this._initListener = true;

        this._node.on("slide", this.onSlide, this)
    }

    private onSlide(event) : void {
        //cc.log(this.node.name, "SliderCell.onSlide", event);

        if (this._initProgress) {
            this._initProgress = false;
            return;
        }

        if (this._fill != null) {
            this._fill.fillRange = this._slider.progress;
        }

        if (this._handler != null) {
            this._handler.call(this._target, this._slider.progress);
        } else if (this._handlerWithSelf != null) {
            this._handlerWithSelf.call(this._target, this, this._slider.progress);
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

    public get interactable() : boolean {
        return this._slider.handle.interactable && this._slider.handle.enabled;
    }

    public set interactable(enabled : boolean) {
        this._slider.handle.interactable = enabled;
        this._slider.handle.enabled = enabled;
    }

    public get progress() {
        return this._slider.progress;
    }

    public set progress(value : number) {
        this._slider.progress = value;
    }  

    private _initProgress = false;

    //初始化选中状态，不触发要回调事件，用于打开界面的设置
    public InitProgress(progress : number) : void {
        if (this._slider.progress == progress) {
            return;
        }
        if (this.interactable) {
            this._initProgress = true;
        }
        this._slider.progress = progress;
        this._initProgress = false;

        if (this._fill != null) {
            this._fill.fillRange = progress;
        }
    }
}
