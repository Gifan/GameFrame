import { AbsCell } from "../../../../frame/extension/AbsCell";
import { Cell } from "../../../../frame/extension/Cell";

/// <summary>
/// 程序生成的UI代码类，请勿修改
/// </summary>
export class FlowTipsUI extends AbsCell {
    public constructor(node ?: cc.Node) {
        super();
        if (node != null) {
            this.Init(node);
        }
    }
    
    public fontSheet : cc.Node;
    public numCell : Cell;
    public txtCell : Cell;
    public icoCell : Cell;

    public Init(node : cc.Node) {
        this._node = node;
        
		let fontSheetXform = node.getChildByName("fontSheet");
		if ( fontSheetXform != null) {
			this.fontSheet = fontSheetXform;				
		} else {
			cc.error("fontSheet Can't Find Under node");
		}
		let numCellXform = node.getChildByName("numCell=Cell");
		if ( numCellXform != null) {
			this.numCell = new Cell(numCellXform);				
		} else {
			cc.error("numCell=Cell Can't Find Under node");
		}
		let txtCellXform = node.getChildByName("txtCell=Cell");
		if ( txtCellXform != null) {
			this.txtCell = new Cell(txtCellXform);				
		} else {
			cc.error("txtCell=Cell Can't Find Under node");
		}
		let icoCellXform = node.getChildByName("icoCell=Cell");
		if ( icoCellXform != null) {
			this.icoCell = new Cell(icoCellXform);				
		} else {
			cc.error("icoCell=Cell Can't Find Under node");
		}
    }

    public Free() {
        super.Free();
        
        this.fontSheet = null;
        if (this.numCell != null) {
            this.numCell.Free();
        }
        this.numCell = null;
        if (this.txtCell != null) {
            this.txtCell.Free();
        }
        this.txtCell = null;
        if (this.icoCell != null) {
            this.icoCell.Free();
        }
        this.icoCell = null;
    }
}