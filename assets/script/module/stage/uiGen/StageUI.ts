import { Cell } from "../../../../frame/extension/Cell";
import { ButtonCell } from "../../../../frame/extension/ButtonCell";
import { ScrollViewCell } from "../../../../frame/extension/ScrollViewCell";
import { Album } from "./Album"
import { Stage } from "./Stage"
import { AbsCell } from "../../../../frame/extension/AbsCell";

/// <summary>
/// 程序生成的UI代码类，请勿修改
/// </summary>
export class StageUI extends AbsCell {
    public constructor(node ?: cc.Node) {
        super();
        if (node != null) {
            this.Init(node);
        }
    }
    
    public top : cc.Node;
    public cell_star : Cell;
    public btn_energy : ButtonCell;
    public btn_back : ButtonCell;
    public scroll_album : ScrollViewCell;
    public Album : Album;
    public scroll_stage : ScrollViewCell;
    public Stage : Stage;
    public txt_num : cc.Label;
    public title_stage : cc.Label;

    public Init(node : cc.Node) {
        this._node = node;
        
		let topXform = node.getChildByName("top");
		if ( topXform != null) {
			this.top = topXform;				
		} else {
			cc.error("top Can't Find Under node");
		}
		let cell_starXform = topXform.getChildByName("cell_star=Cell");
		if ( cell_starXform != null) {
			this.cell_star = new Cell(cell_starXform);				
		} else {
			cc.error("cell_star=Cell Can't Find Under topXform");
		}
		let btn_energyXform = topXform.getChildByName("btn_energy");
		if ( btn_energyXform != null) {
			this.btn_energy = new ButtonCell(btn_energyXform);				
		} else {
			cc.error("btn_energy Can't Find Under topXform");
		}
		let btn_backXform = topXform.getChildByName("btn_back");
		if ( btn_backXform != null) {
			this.btn_back = new ButtonCell(btn_backXform);				
		} else {
			cc.error("btn_back Can't Find Under topXform");
		}
		let scroll_albumXform = node.getChildByName("scroll_album");
		if ( scroll_albumXform != null) {
			this.scroll_album = new ScrollViewCell(scroll_albumXform);				
		} else {
			cc.error("scroll_album Can't Find Under node");
		}
		let AlbumXform = this.scroll_album.content.getChildByName("Album=Sub");
		if ( AlbumXform != null) {
			this.Album = new Album(AlbumXform);				
		} else {
			cc.error("Album=Sub Can't Find Under this.scroll_album.content");
		}
		let scroll_stageXform = node.getChildByName("scroll_stage");
		if ( scroll_stageXform != null) {
			this.scroll_stage = new ScrollViewCell(scroll_stageXform);				
		} else {
			cc.error("scroll_stage Can't Find Under node");
		}
		let StageXform = this.scroll_stage.content.getChildByName("Stage=Sub");
		if ( StageXform != null) {
			this.Stage = new Stage(StageXform);				
		} else {
			cc.error("Stage=Sub Can't Find Under this.scroll_stage.content");
		}
		let txt_numXform = scroll_stageXform.getChildByName("txt_num");
		if ( txt_numXform != null) {
			this.txt_num = txt_numXform.getComponent(cc.Label);				
		} else {
			cc.error("txt_num Can't Find Under scroll_stageXform");
		}
		let title_stageXform = scroll_stageXform.getChildByName("title_stage");
		if ( title_stageXform != null) {
			this.title_stage = title_stageXform.getComponent(cc.Label);				
		} else {
			cc.error("title_stage Can't Find Under scroll_stageXform");
		}
    }

    public Free() {
        super.Free();
        
        this.top = null;
        if (this.cell_star != null) {
            this.cell_star.Free();
        }
        this.cell_star = null;
        if (this.btn_energy != null) {
            this.btn_energy.Free();
        }
        this.btn_energy = null;
        if (this.btn_back != null) {
            this.btn_back.Free();
        }
        this.btn_back = null;
        if (this.scroll_album != null) {
            this.scroll_album.Free();
        }
        this.scroll_album = null;
        if (this.Album != null) {
            this.Album.Free();
        }
        this.Album = null;
        if (this.scroll_stage != null) {
            this.scroll_stage.Free();
        }
        this.scroll_stage = null;
        if (this.Stage != null) {
            this.Stage.Free();
        }
        this.Stage = null;
        this.txt_num = null;
        this.title_stage = null;
    }
}