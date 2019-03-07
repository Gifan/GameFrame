import { MVCS } from "../../../frame/mvcs/MVCS"

/// <summary>
/// 飘字参数
/// </summary>
export class FlowTipsArgs extends MVCS.OpenArgs {
    private _info : string;

    /// <summary>
    /// 文字内容，必选
    /// </summary>
    public get info() : string { 
        return this._info; 
    }
    public SetInfo(info : string) : FlowTipsArgs {
        this._info = info;
        return this;
    }

    private _font : number = 0;
    /// <summary>
    /// 字体，可选
    /// </summary>
    public get font() { 
        return this._font; 
    }
    public SetFont(font : number) : FlowTipsArgs {
        this._font = font;
        return this;
    }

    private _fontSize : number = 32;
    /// <summary>
    /// 字体大小，可选
    /// </summary>
    public get fontSize() { 
        return this._fontSize; 
    }
    public SetFontSize(fontSize : number) : FlowTipsArgs {
        this._fontSize = fontSize;
        return this;
    }

    private _parent : cc.Node;
    /// <summary>
    /// 位置，可选
    /// </summary>
    public get parent() { 
        return this._parent; 
    }
    public SetParent(parent : cc.Node) : FlowTipsArgs {
        this._parent = parent;
        return this;
    }

    private _position : cc.Vec2;
    /// <summary>
    /// 位置，可选
    /// </summary>
    public get position() { 
        return this._position; 
    }
    public SetPosition(position : cc.Vec2) : FlowTipsArgs {
        this._position = position;
        return this;
    }

    private _icon : string | cc.SpriteFrame;
    /// <summary>
    /// 图标，可选
    /// </summary>
    public get icon() { 
        return this._icon; 
    }
    public SetIcon(icon : string | cc.SpriteFrame) : FlowTipsArgs {
        this._icon = icon;
        return this;
    }
}

export enum FlowColor {
    Green,
    Red,
    Pink,
    Yellow,
}