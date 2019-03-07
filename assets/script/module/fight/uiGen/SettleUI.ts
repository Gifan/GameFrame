import { ButtonCell } from "../../../../frame/extension/ButtonCell";
import { AbsCell } from "../../../../frame/extension/AbsCell";

/// <summary>
/// 程序生成的UI代码类，请勿修改
/// </summary>
export class SettleUI extends AbsCell {
    public constructor(node ?: cc.Node) {
        super();
        if (node != null) {
            this.Init(node);
        }
    }
    
    public shade : ButtonCell;
    public btn_back : ButtonCell;
    public btn_again : ButtonCell;
    public btn_next : ButtonCell;
    public bg_progress : cc.Sprite;
    public img_progress : cc.Sprite;
    public icon : cc.Node;
    public common_icon_zs : cc.Sprite;
    public btn_tiger : ButtonCell;

    public Init(node : cc.Node) {
        this._node = node;
        
		let shadeXform = node.getChildByName("shade");
		if ( shadeXform != null) {
			this.shade = new ButtonCell(shadeXform);				
		} else {
			cc.error("shade Can't Find Under node");
		}
		let btn_backXform = node.getChildByName("btn_back");
		if ( btn_backXform != null) {
			this.btn_back = new ButtonCell(btn_backXform);				
		} else {
			cc.error("btn_back Can't Find Under node");
		}
		let btn_againXform = node.getChildByName("btn_again");
		if ( btn_againXform != null) {
			this.btn_again = new ButtonCell(btn_againXform);				
		} else {
			cc.error("btn_again Can't Find Under node");
		}
		let btn_nextXform = node.getChildByName("btn_next");
		if ( btn_nextXform != null) {
			this.btn_next = new ButtonCell(btn_nextXform);				
		} else {
			cc.error("btn_next Can't Find Under node");
		}
		let bg_progressXform = node.getChildByName("bg_progress");
		if ( bg_progressXform != null) {
			this.bg_progress = bg_progressXform.getComponent(cc.Sprite);				
		} else {
			cc.error("bg_progress Can't Find Under node");
		}
		let img_progressXform = bg_progressXform.getChildByName("img_progress");
		if ( img_progressXform != null) {
			this.img_progress = img_progressXform.getComponent(cc.Sprite);				
		} else {
			cc.error("img_progress Can't Find Under bg_progressXform");
		}
		let iconXform = bg_progressXform.getChildByName("icon");
		if ( iconXform != null) {
			this.icon = iconXform;				
		} else {
			cc.error("icon Can't Find Under bg_progressXform");
		}
		let common_icon_zsXform = iconXform.getChildByName("common_icon_zs");
		if ( common_icon_zsXform != null) {
			this.common_icon_zs = common_icon_zsXform.getComponent(cc.Sprite);				
		} else {
			cc.error("common_icon_zs Can't Find Under iconXform");
		}
		let btn_tigerXform = node.getChildByName("btn_tiger");
		if ( btn_tigerXform != null) {
			this.btn_tiger = new ButtonCell(btn_tigerXform);				
		} else {
			cc.error("btn_tiger Can't Find Under node");
		}
    }

    public Free() {
        this._node.destroy()
        this._node = null;
        
        if (this.shade != null) {
            this.shade.Free();
        }
        this.shade = null;
        if (this.btn_back != null) {
            this.btn_back.Free();
        }
        this.btn_back = null;
        if (this.btn_again != null) {
            this.btn_again.Free();
        }
        this.btn_again = null;
        if (this.btn_next != null) {
            this.btn_next.Free();
        }
        this.btn_next = null;
        this.bg_progress = null;
        this.img_progress = null;
        this.icon = null;
        this.common_icon_zs = null;
        if (this.btn_tiger != null) {
            this.btn_tiger.Free();
        }
        this.btn_tiger = null;
    }
}