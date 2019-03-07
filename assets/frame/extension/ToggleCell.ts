import { Cell } from "./Cell";

type EventHandler = (isChecked : boolean) => void;
type EventHandlerWithSelf = (toggle : ToggleCell, isChecked : boolean) => void;

export class ToggleCell extends Cell {
    public Init(node : cc.Node) {
        super.Init(node);
        
        this._toggle = node.getComponent(cc.Toggle);
        this._enableNode = node.getChildByName("_enable");
        this._disableNode = node.getChildByName("_disable");

        this.SetCheckedView(this._toggle.isChecked);
    }

    //TabGroup专用参数
    private _tab ?: number;
    public get tab() {
        return this._tab;
    }
    public SetTab(tab : number) {
        this._tab = tab;
    }

    public enableAudioId : number = 0;
    public disableAudioId : number = 0;

    public enableColor ?: cc.Color;
    public disableColor ?: cc.Color;

    private _enableNode: cc.Node;
    private _disableNode: cc.Node;

    private _toggle : cc.Toggle;
    private _initListener = false;
    private _handler : EventHandler;
    private _handlerWithSelf : EventHandlerWithSelf;
    private _target :any;

    private initListener() {
        if (this._initListener) {
            return;
        }
        this._initListener = true;

        this._node.on("toggle", this.onClick, this)        
    }

    private onClick(event) : void {
        //cc.error(this.node.name, "ToggleCell.onClick", event);
        this.SetCheckedView(this._toggle.isChecked);

        if (this._initCheck) {
            this._initCheck = false;
            //cc.log(this.node.name + " skip InitChecked");
            return;
        }
        //播放点击音效
        if (this._toggle.isChecked) {
            this.playAudio(this.enableAudioId);
        } else {
            this.playAudio(this.disableAudioId);
        }

        if (this._handler != null) {
            this._handler.call(this._target, this._toggle.isChecked);
        } else if (this._handlerWithSelf != null) {
            this._handlerWithSelf.call(this._target, this, this._toggle.isChecked);
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
        return this._toggle.interactable && this._toggle.enabled;
    }

    public set interactable(enabled : boolean) {
        this._toggle.interactable = enabled;
        this._toggle.enabled = enabled;
    }

    private _initCheck = false;

    //初始化选中状态，不触发要回调事件，用于打开界面的设置
    public InitChecked(isChecked : boolean) : void {
        if (this._toggle.isChecked == isChecked) {
            //cc.log(this.node.name + " InitChecked skip:", isChecked);
            return;
        }
        this._initCheck = true;
        this._toggle.isChecked = isChecked;
        this.SetCheckedView(isChecked);
        this._initCheck = false;
    }

    public get isChecked() {
        return this._toggle.isChecked;
    }

    public set isChecked(value : boolean) {
        this._toggle.isChecked = value;
    }

    private SetCheckedView(isChecked : boolean) : void {
        if (this._enableNode != null) {
            this._enableNode.active = isChecked;
        }
        if (this._disableNode != null) {
            this._disableNode.active = !isChecked;
        }

        if (isChecked) {
            if (this.enableColor != null) {
                this.mainText.node.color = this.enableColor;
            }            
        } else {
            if (this.disableColor != null) {
                this.mainText.node.color = this.disableColor;
            }
        }
    }
}
