import { Cell } from "./Cell";

type EventHandler = () => void;
type EventHandlerWithSelf = (btn : ButtonCell) => void;

export class ButtonCell extends Cell {
    public Init(node : cc.Node) {
        super.Init(node);
        
        this._button = node.getComponent(cc.Button);
    }

    public clickAudioId : number = 0;

    private _button : cc.Button;
    private _initListener = false;
    private _handler : EventHandler;
    private _handlerWithSelf : EventHandlerWithSelf;
    private _target :any;

    public get button() {
        return this._button;
    }

    private initListener() {
        if (this._initListener) {
            return;
        }
        this._initListener = true;

        // let eventHandler = new cc.Component.EventHandler();
        // eventHandler.target = this.node;
        // eventHandler.component = "Button";
        // eventHandler.handler = "onClick";        
        // this._button.clickEvents.push(eventHandler);

        this._node.on("click", this.onClick, this)
    }

    private onClick(button) : void {
        //cc.log(this.node.name, "ButtonCell.onClick", button);

        //播放点击音效
        this.playAudio(this.clickAudioId);

        if (this._handler != null) {
            this._handler.call(this._target);
        } else if (this._handlerWithSelf != null) {
            this._handlerWithSelf.call(this._target, this);
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
        return this._button.interactable;
    }

    public set interactable(enabled : boolean) {
        this._button.interactable = enabled;
        this._button.enabled = enabled;
    }
}
