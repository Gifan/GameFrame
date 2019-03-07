import { AbsCell } from "./AbsCell";

/*
*   通用UI结构
*/
export class Cell extends AbsCell {

    /// <summary>
    /// 播放音效
    /// </summary>
    public static audioPlayHandler : (id : number) => void;

    public constructor(node ?: cc.Node) {
        super();
        if (node != null) {
            this.Init(node);
        }
    }

    public Init(node : cc.Node) {
        this._node = node;
    }

    public playAudio(id : number) {
        if (Cell.audioPlayHandler == null) {
            cc.warn("Cell.audioPlayHandler == null")
            return;
        }
        if (id == 0) {
            //cc.log("playAudio id=0");
            return;
        }
        Cell.audioPlayHandler(id);
    }

    public id ?: number;
    public index ?: number;
    public num ?: number;
    public param ? : object;

    protected _node : cc.Node;
    public get node() : cc.Node {
        return this._node;
    }

    private _point: cc.Node;
    public get point() : cc.Node {
        if (this._point == null) {
            this._point = this.node.getChildByName("_point");
            if (this._point == null) {
                cc.error(this.node.name + " point null");
            }
        }
        return this._point;
    }

    private _image: cc.Sprite;
    public get image() : cc.Sprite {
        if (this._image == null) {
            let child = this.node.getChildByName("_image");
            if (child != null) {
                this._image = child.getComponent(cc.Sprite);
            } else {
                //if can't find Icon, use self instead; it's icon button/toggle
                this._image = this.node.getComponent(cc.Sprite);
            }
            if (this._image == null) {
                cc.error(this.node.name + " image null");
            }
        }
        return this._image;
    }

    private _icon: cc.Sprite;
    //图标
    public get icon() : cc.Sprite {
        if (this._icon == null) {
            let child = this.node.getChildByName("_icon");
            if (child != null) {
                this._icon = child.getComponent(cc.Sprite);
                let textChild = child.getChildByName("_text");
                if (textChild != null && this._mainText == null) {
                    this._mainText = textChild.getComponent(cc.Label);                    
                }
            } else {
                //if can't find Icon, use self instead; it's icon button/toggle
                this._icon = this.node.getComponent(cc.Sprite);
            }
            if (this._icon == null) {
                cc.error(this.node.name + " icon null");
            }
        }
        return this._icon;
    }

    private _mainText: cc.Label;
    //主要文本
    public get mainText() : cc.Label {
        if (this._mainText == null) {
            let child = this.node.getChildByName("_text");
            if (child != null) {
                this._mainText = child.getComponent(cc.Label);
            } else {
                //if can't find Icon, use self instead; it's text button/toggle
                this._mainText = this.node.getComponent(cc.Label);
            }
            if (this._mainText == null) {
                cc.error(this.node.name + " mainText null");
            }
        }
        return this._mainText;
    }

    private _subText: cc.Label;
    //次要文本
    public get subText() : cc.Label {
        if (this._subText == null) {
            let child = this.node.getChildByName("_subText");
            if (child != null) {
                this._subText = child.getComponent(cc.Label);
            } else {
                
            }
            if (this._subText == null) {
                cc.error(this.node.name + " subText null");
            }
        }
        return this._subText;
    }

    private _numText: cc.Label;
    //数字文本
    public get numText() : cc.Label {
        if (this._numText == null) {
            let child = this.node.getChildByName("_numText");
            if (child != null) {
                this._numText = child.getComponent(cc.Label);
            } else {
                
            }
            if (this._numText == null) {
                cc.error(this.node.name + " numText null");
            }
        }
        return this._numText;
    }

    private _costIcon: cc.Sprite;
    //消耗图标
    public get costIcon() : cc.Sprite {
        if (this._costIcon == null) {
            let child = this.node.getChildByName("_costIcon");
            if (child != null) {
                this._costIcon = child.getComponent(cc.Sprite);
                let textChild = child.getChildByName("_text");
                if (textChild != null) {
                    this._costText = textChild.getComponent(cc.RichText);                    
                }
            } else {
                //this._costIcon = this.node.getComponent(cc.Sprite);
            }
            if (this._costIcon == null) {
                cc.error(this.node.name + " costIcon null");
            }
        }
        return this._costIcon;
    }

    private _costText: cc.RichText;
    //消耗文本
    public get costText() : cc.RichText {
        if (this._costText == null) {
            let child = this.node.getChildByName("_costText");
            if (child != null) {
                this._costText = child.getComponent(cc.RichText);                
            } else {                
                //this._costText = this.node.getComponent(cc.RichText);
            }
            if (this._costText == null) {
                cc.error(this.node.name + " costText null");
            }
        }
        return this._costText;
    }

    private _badge: cc.Node;
    //小红点
    public get badge() : cc.Node {
        if (this._badge == null) {
            let child = this.node.getChildByName("_badge");
            if (child != null) {
                this._badge = child;
                let textChild = child.getChildByName("_text");
                if (textChild != null) {
                    this._badgeText = textChild.getComponent(cc.Label);                    
                }
            } else {
                //this._costIcon = this.node.getComponent(cc.Sprite);
            }
            if (this._badge == null) {
                cc.error(this.node.name + " badge null");
            }
        }
        return this._badge;
    }

    private _badgeText: cc.Label;
    public get badgeText() : cc.Label {
        if (this._badgeText == null) {
            let badge = this.badge;
            if (this._badgeText == null) {
                cc.error(this.node.name + " badgeText null");
            }
        }
        return this._badgeText;
    }

    private _checked: cc.Node;
    //选中
    public get checked() : cc.Node {
        if (this._checked == null) {
            let child = this.node.getChildByName("_checked");
            if (child != null) {
                this._checked = child;
            } else {
                //this._costIcon = this.node.getComponent(cc.Sprite);
            }
            if (this._checked == null) {
                cc.error(this.node.name + " checked null");
            }
        }
        return this._checked;
    }

    private _mask: cc.Sprite;
    //遮罩，用于技能CD等等
    public get mask() : cc.Sprite {
        if (this._mask == null) {
            let child = this.node.getChildByName("_mask");
            if (child != null) {
                this._mask = child.getComponent(cc.Sprite);
                let textChild = child.getChildByName("_text");
                if (textChild != null) {
                    this._maskText = textChild.getComponent(cc.Label);                    
                }
            } else {
                //this._costIcon = this.node.getComponent(cc.Sprite);
            }
            if (this._mask == null) {
                cc.error(this.node.name + " mask null");
            }
        }
        return this._mask;
    }

    private _maskText: cc.Label;
    public get maskText() : cc.Label {
        if (this._maskText == null) {
            let mask = this.mask;
            if (this._maskText == null) {
                cc.error(this.node.name + " maskText null");
            }
        }
        return this._maskText;
    }

    private _layout: cc.Layout;
    public get layout() : cc.Layout {
        if (this._layout == null) {
            this._layout = this.node.getComponent(cc.Layout);
            if (this._layout == null) {
                cc.error(this.node.name + " layout null");
            }
        }
        return this._layout;
    }

    private _richText: cc.RichText;
    //富文本
    public get richText() : cc.RichText {
        if (this._richText == null) {
            let child = this.node.getChildByName("_richText");
            if (child != null) {
                this._richText = child.getComponent(cc.RichText);
            } else {
                this._richText = this.node.getComponentInChildren(cc.RichText);
            }
            if (this._richText == null) {
                cc.error(this.node.name + " _richText null");
            }
        }
        return this._richText;
    }
}
