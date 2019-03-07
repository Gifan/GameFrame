import { AbsCell } from "../../../../frame/extension/AbsCell";
import { BarCell } from "../../../../frame/extension/BarCell";
/// <summary>
/// 程序生成的UI代码类，请勿修改
/// </summary>
export class SceneLoadingUI extends AbsCell {
    public constructor(node ?: cc.Node) {
        super();
        if (node != null) {
            this.Init(node);
        }
    }
    
    public bg : cc.Sprite;
    public title : cc.RichText;
    public RICHTEXT_CHILD : cc.Label;
    public bar_loading : BarCell;

    public Init(node : cc.Node) {
        this._node = node;
        
		let bgXform = node.getChildByName("bg");
		if ( bgXform != null) {
			this.bg = bgXform.getComponent(cc.Sprite);				
		} else {
			cc.error("bg Can't Find Under node");
		}
		let titleXform = node.getChildByName("title");
		if ( titleXform != null) {
			this.title = titleXform.getComponent(cc.RichText);				
		} else {
			cc.error("title Can't Find Under node");
		}
		let RICHTEXT_CHILDXform = titleXform.getChildByName("RICHTEXT_CHILD");
		if ( RICHTEXT_CHILDXform != null) {
			this.RICHTEXT_CHILD = RICHTEXT_CHILDXform.getComponent(cc.Label);				
		} else {
			cc.error("RICHTEXT_CHILD Can't Find Under titleXform");
		}
		let bar_loadingXform = node.getChildByName("bar_loading");
		if ( bar_loadingXform != null) {
			this.bar_loading = new BarCell(bar_loadingXform);				
		} else {
			cc.error("bar_loading Can't Find Under node");
		}
    }

    public Free() {
        super.Free();
        
        this.bg = null;
        this.title = null;
        this.RICHTEXT_CHILD = null;
        if (this.bar_loading != null) {
            this.bar_loading.Free();
        }
        this.bar_loading = null;
    }
}