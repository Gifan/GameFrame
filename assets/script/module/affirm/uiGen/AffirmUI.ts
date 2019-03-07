import { AbsCell } from "../../../../frame/extension/AbsCell";
import { ButtonCell } from "../../../../frame/extension/ButtonCell";

/// <summary>
/// 程序生成的UI代码类，请勿修改
/// </summary>
export class AffirmUI extends AbsCell {
    public constructor(node ?: cc.Node) {
		super();
        if (node != null) {
            this.Init(node);
        }
    }
        
    public shade : ButtonCell;
    public bg_main : cc.Sprite;
    public top : cc.Node;
    public txt_title : cc.Label;
    public btn_close : ButtonCell;
    public txt_info : cc.RichText;
    public RICHTEXT_CHILD : cc.Label;
    public bottom : cc.Node;
    public btn_refuse : ButtonCell;
    public btn_confirm : ButtonCell;

    public Init(node : cc.Node) {
        this._node = node;
        
		let shadeXform = node.getChildByName("shade");
		if ( shadeXform != null) {
			this.shade = new ButtonCell(shadeXform);				
		} else {
			cc.error("shade Can't Find Under node");
		}
		let bg_mainXform = node.getChildByName("bg_main");
		if ( bg_mainXform != null) {
			this.bg_main = bg_mainXform.getComponent(cc.Sprite);				
		} else {
			cc.error("bg_main Can't Find Under node");
		}
		let topXform = bg_mainXform.getChildByName("top");
		if ( topXform != null) {
			this.top = topXform;				
		} else {
			cc.error("top Can't Find Under bg_mainXform");
		}
		let txt_titleXform = topXform.getChildByName("txt_title");
		if ( txt_titleXform != null) {
			this.txt_title = txt_titleXform.getComponent(cc.Label);				
		} else {
			cc.error("txt_title Can't Find Under topXform");
		}
		let btn_closeXform = topXform.getChildByName("btn_close");
		if ( btn_closeXform != null) {
			this.btn_close = new ButtonCell(btn_closeXform);				
		} else {
			cc.error("btn_close Can't Find Under topXform");
		}
		let txt_infoXform = topXform.getChildByName("txt_info");
		if ( txt_infoXform != null) {
			this.txt_info = txt_infoXform.getComponent(cc.RichText);				
		} else {
			cc.error("txt_info Can't Find Under topXform");
		}
		let RICHTEXT_CHILDXform = txt_infoXform.getChildByName("RICHTEXT_CHILD");
		if ( RICHTEXT_CHILDXform != null) {
			this.RICHTEXT_CHILD = RICHTEXT_CHILDXform.getComponent(cc.Label);				
		} else {
			cc.error("RICHTEXT_CHILD Can't Find Under txt_infoXform");
		}
		let bottomXform = bg_mainXform.getChildByName("bottom");
		if ( bottomXform != null) {
			this.bottom = bottomXform;				
		} else {
			cc.error("bottom Can't Find Under bg_mainXform");
		}
		let btn_refuseXform = bottomXform.getChildByName("btn_refuse");
		if ( btn_refuseXform != null) {
			this.btn_refuse = new ButtonCell(btn_refuseXform);				
		} else {
			cc.error("btn_refuse Can't Find Under bottomXform");
		}
		let btn_confirmXform = bottomXform.getChildByName("btn_confirm");
		if ( btn_confirmXform != null) {
			this.btn_confirm = new ButtonCell(btn_confirmXform);				
		} else {
			cc.error("btn_confirm Can't Find Under bottomXform");
		}
    }

    public Free() {
        super.Free();
        
        if (this.shade != null) {
            this.shade.Free();
        }
        this.shade = null;
        this.bg_main = null;
        this.top = null;
        this.txt_title = null;
        if (this.btn_close != null) {
            this.btn_close.Free();
        }
        this.btn_close = null;
        this.txt_info = null;
        this.RICHTEXT_CHILD = null;
        this.bottom = null;
        if (this.btn_refuse != null) {
            this.btn_refuse.Free();
        }
        this.btn_refuse = null;
        if (this.btn_confirm != null) {
            this.btn_confirm.Free();
        }
        this.btn_confirm = null;
    }
}