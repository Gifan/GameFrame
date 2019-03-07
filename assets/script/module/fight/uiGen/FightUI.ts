import { ButtonCell } from "../../../../frame/extension/ButtonCell";
import { AbsCell } from "../../../../frame/extension/AbsCell";

/// <summary>
/// 程序生成的UI代码类，请勿修改
/// </summary>
export class FightUI extends AbsCell {
    public constructor(node ?: cc.Node) {
		super();
        if (node != null) {
            this.Init(node);
        }
    }
    
    public touch_area : cc.Node;
    public aimRoot : cc.Sprite;
    public aims : cc.Sprite[];
    public rubber : cc.Graphics;
    public end : cc.Sprite;
    public top : cc.Node;
    public btn_back : ButtonCell;
    public bg_progress : cc.Sprite;
    public img_progress : cc.Sprite;
    public progress : cc.Label;
    public btn_energy : cc.Sprite;
    public btn_bullets : ButtonCell[];
    public btn_buy : ButtonCell;

    public Init(node : cc.Node) {
        this._node = node;
        
		let touch_areaXform = node.getChildByName("touch_area");
		if ( touch_areaXform != null) {
			this.touch_area = touch_areaXform;				
		} else {
			cc.error("touch_area Can't Find Under node");
		}
		let aimRootXform = touch_areaXform.getChildByName("aimRoot");
		if ( aimRootXform != null) {
			this.aimRoot = aimRootXform.getComponent(cc.Sprite);				
		} else {
			cc.error("aimRoot Can't Find Under touch_areaXform");
		}
		this.aims = [];
		for (let index = 0; index < aimRootXform.children.length; index++) {
			const child = aimRootXform.children[index];
			if (child.name != "aim=Array"){
				continue;
			}
			let item = child.getComponent(cc.Sprite);
			this.aims.push(item);
		}
		let rubberXform = aimRootXform.getChildByName("rubber");
		if ( rubberXform != null) {
			this.rubber = rubberXform.getComponent(cc.Graphics);				
		} else {
			cc.error("rubber Can't Find Under aimRootXform");
		}
		let endXform = aimRootXform.getChildByName("end");
		if ( endXform != null) {
			this.end = endXform.getComponent(cc.Sprite);				
		} else {
			cc.error("end Can't Find Under aimRootXform");
		}
		let topXform = node.getChildByName("top");
		if ( topXform != null) {
			this.top = topXform;				
		} else {
			cc.error("top Can't Find Under node");
		}
		let btn_backXform = topXform.getChildByName("btn_back");
		if ( btn_backXform != null) {
			this.btn_back = new ButtonCell(btn_backXform);				
		} else {
			cc.error("btn_back Can't Find Under topXform");
		}
		let bg_progressXform = topXform.getChildByName("bg_progress");
		if ( bg_progressXform != null) {
			this.bg_progress = bg_progressXform.getComponent(cc.Sprite);				
		} else {
			cc.error("bg_progress Can't Find Under topXform");
		}
		let img_progressXform = topXform.getChildByName("img_progress");
		if ( img_progressXform != null) {
			this.img_progress = img_progressXform.getComponent(cc.Sprite);				
		} else {
			cc.error("img_progress Can't Find Under topXform");
		}
		let progressXform = topXform.getChildByName("progress");
		if ( progressXform != null) {
			this.progress = progressXform.getComponent(cc.Label);				
		} else {
			cc.error("progress Can't Find Under topXform");
		}
		let btn_energyXform = topXform.getChildByName("btn_energy");
		if ( btn_energyXform != null) {
			this.btn_energy = btn_energyXform.getComponent(cc.Sprite);				
		} else {
			cc.error("btn_energy Can't Find Under topXform");
		}
		this.btn_bullets = [];
		for (let index = 0; index < node.children.length; index++) {
			const child = node.children[index];
			if (child.name != "btn_bullet=Array"){
				continue;
			}
			let item = new ButtonCell(child);
			this.btn_bullets.push(item);
		}
		let btn_buyXform = node.getChildByName("btn_buy");
		if ( btn_buyXform != null) {
			this.btn_buy = new ButtonCell(btn_buyXform);				
		} else {
			cc.error("btn_buy Can't Find Under node");
		}
    }

    public Free() {
        this._node.destroy()
        this._node = null;
        
        this.touch_area = null;
        this.aimRoot = null;
        this.aims = null;
        this.rubber = null;
        this.end = null;
        this.top = null;
        if (this.btn_back != null) {
            this.btn_back.Free();
        }
        this.btn_back = null;
        this.bg_progress = null;
        this.img_progress = null;
        this.progress = null;
        this.btn_energy = null;
        if (this.btn_bullets != null) {
            for (let index = 0; index < this.btn_bullets.length; index++) {
                const cell = this.btn_bullets[index];
                cell.Free();                
            }
        }
        this.btn_bullets = null;
        if (this.btn_buy != null) {
            this.btn_buy.Free();
        }
        this.btn_buy = null;
    }
}