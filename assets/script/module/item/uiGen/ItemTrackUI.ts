import { ButtonCell } from "../../../../frame/extension/ButtonCell";
import { AbsCell } from "../../../../frame/extension/AbsCell";

/// <summary>
/// 程序生成的UI代码类，请勿修改
/// </summary>
export class ItemTrackUI extends AbsCell {
    public constructor(node ?: cc.Node) {
        super();
        if (node != null) {
            this.Init(node);
        }
    }
    
    public shade : ButtonCell;
    public bg : cc.Sprite;
    public top : cc.Node;
    public btn_close : ButtonCell;
    public icon_item : cc.Sprite;
    public txt_name : cc.Label;
    public txt_num : cc.Label;
    public bottom : cc.Layout;
    public btn_go : ButtonCell;

    public Init(node : cc.Node) {
        this._node = node;
        
		let shadeXform = node.getChildByName("shade");
		if ( shadeXform != null) {
			this.shade = new ButtonCell(shadeXform);				
		} else {
			cc.error("shade Can't Find Under node");
		}
		let bgXform = node.getChildByName("bg");
		if ( bgXform != null) {
			this.bg = bgXform.getComponent(cc.Sprite);				
		} else {
			cc.error("bg Can't Find Under node");
		}
		let topXform = bgXform.getChildByName("top");
		if ( topXform != null) {
			this.top = topXform;				
		} else {
			cc.error("top Can't Find Under bgXform");
		}
		let btn_closeXform = topXform.getChildByName("btn_close");
		if ( btn_closeXform != null) {
			this.btn_close = new ButtonCell(btn_closeXform);				
		} else {
			cc.error("btn_close Can't Find Under topXform");
		}
		let icon_itemXform = topXform.getChildByName("icon_item");
		if ( icon_itemXform != null) {
			this.icon_item = icon_itemXform.getComponent(cc.Sprite);				
		} else {
			cc.error("icon_item Can't Find Under topXform");
		}
		let txt_nameXform = topXform.getChildByName("txt_name");
		if ( txt_nameXform != null) {
			this.txt_name = txt_nameXform.getComponent(cc.Label);				
		} else {
			cc.error("txt_name Can't Find Under topXform");
		}
		let txt_numXform = topXform.getChildByName("txt_num");
		if ( txt_numXform != null) {
			this.txt_num = txt_numXform.getComponent(cc.Label);				
		} else {
			cc.error("txt_num Can't Find Under topXform");
		}
		let bottomXform = bgXform.getChildByName("bottom");
		if ( bottomXform != null) {
			this.bottom = bottomXform.getComponent(cc.Layout);				
		} else {
			cc.error("bottom Can't Find Under bgXform");
		}
		let btn_goXform = bottomXform.getChildByName("btn_go");
		if ( btn_goXform != null) {
			this.btn_go = new ButtonCell(btn_goXform);				
		} else {
			cc.error("btn_go Can't Find Under bottomXform");
		}
    }

    public Free() {
        this._node.destroy()
        this._node = null;
        
        if (this.shade != null) {
            this.shade.Free();
        }
        this.shade = null;
        this.bg = null;
        this.top = null;
        if (this.btn_close != null) {
            this.btn_close.Free();
        }
        this.btn_close = null;
        this.icon_item = null;
        this.txt_name = null;
        this.txt_num = null;
        this.bottom = null;
        if (this.btn_go != null) {
            this.btn_go.Free();
        }
        this.btn_go = null;
    }
}