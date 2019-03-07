import { AbsCell } from "../../../../frame/extension/AbsCell";
import { ButtonCell } from "../../../../frame/extension/ButtonCell";import { BarCell } from "../../../../frame/extension/BarCell";
/// <summary>
/// 程序生成的UI代码类，请勿修改
/// </summary>
export class MainUI extends AbsCell {
    public constructor(node ?: cc.Node) {
        super();
        if (node != null) {
            this.Init(node);
        }
    }
    
    public top : cc.Node;
    public btn_setting : ButtonCell;
    public btn_diamond : ButtonCell;
    public node_collection : cc.Node;
    public img_collect : ButtonCell;
    public bg_logo : cc.Sprite;
    public btn_debug : ButtonCell;
    public btn_mall : ButtonCell;
    public btn_rank : ButtonCell;
    public btn_gift : ButtonCell;
    public btn_invite : ButtonCell;
    public btn_play : ButtonCell;
    public btn_album : ButtonCell;
    public btn_chest : ButtonCell;
    public bar_chest : BarCell;
    public gameClub : cc.Node;
    public btn_tiger : ButtonCell;

    public Init(node : cc.Node) {
        this._node = node;
        
		let topXform = node.getChildByName("top");
		if ( topXform != null) {
			this.top = topXform;				
		} else {
			cc.error("top Can't Find Under node");
		}
		let btn_settingXform = topXform.getChildByName("btn_setting");
		if ( btn_settingXform != null) {
			this.btn_setting = new ButtonCell(btn_settingXform);				
		} else {
			cc.error("btn_setting Can't Find Under topXform");
		}
		let btn_diamondXform = topXform.getChildByName("btn_diamond");
		if ( btn_diamondXform != null) {
			this.btn_diamond = new ButtonCell(btn_diamondXform);				
		} else {
			cc.error("btn_diamond Can't Find Under topXform");
		}
		let node_collectionXform = topXform.getChildByName("node_collection");
		if ( node_collectionXform != null) {
			this.node_collection = node_collectionXform;				
		} else {
			cc.error("node_collection Can't Find Under topXform");
		}
		let img_collectXform = node_collectionXform.getChildByName("img_collect");
		if ( img_collectXform != null) {
			this.img_collect = new ButtonCell(img_collectXform);				
		} else {
			cc.error("img_collect Can't Find Under node_collectionXform");
		}
		let bg_logoXform = node.getChildByName("bg_logo");
		if ( bg_logoXform != null) {
			this.bg_logo = bg_logoXform.getComponent(cc.Sprite);				
		} else {
			cc.error("bg_logo Can't Find Under node");
		}
		let btn_debugXform = node.getChildByName("btn_debug");
		if ( btn_debugXform != null) {
			this.btn_debug = new ButtonCell(btn_debugXform);				
		} else {
			cc.error("btn_debug Can't Find Under node");
		}
		let btn_mallXform = node.getChildByName("btn_mall");
		if ( btn_mallXform != null) {
			this.btn_mall = new ButtonCell(btn_mallXform);				
		} else {
			cc.error("btn_mall Can't Find Under node");
		}
		let btn_rankXform = node.getChildByName("btn_rank");
		if ( btn_rankXform != null) {
			this.btn_rank = new ButtonCell(btn_rankXform);				
		} else {
			cc.error("btn_rank Can't Find Under node");
		}
		let btn_giftXform = node.getChildByName("btn_gift");
		if ( btn_giftXform != null) {
			this.btn_gift = new ButtonCell(btn_giftXform);				
		} else {
			cc.error("btn_gift Can't Find Under node");
		}
		let btn_inviteXform = node.getChildByName("btn_invite");
		if ( btn_inviteXform != null) {
			this.btn_invite = new ButtonCell(btn_inviteXform);				
		} else {
			cc.error("btn_invite Can't Find Under node");
		}
		let btn_playXform = node.getChildByName("btn_play");
		if ( btn_playXform != null) {
			this.btn_play = new ButtonCell(btn_playXform);				
		} else {
			cc.error("btn_play Can't Find Under node");
		}
		let btn_albumXform = node.getChildByName("btn_album");
		if ( btn_albumXform != null) {
			this.btn_album = new ButtonCell(btn_albumXform);				
		} else {
			cc.error("btn_album Can't Find Under node");
		}
		let btn_chestXform = node.getChildByName("btn_chest");
		if ( btn_chestXform != null) {
			this.btn_chest = new ButtonCell(btn_chestXform);				
		} else {
			cc.error("btn_chest Can't Find Under node");
		}
		let bar_chestXform = btn_chestXform.getChildByName("bar_chest");
		if ( bar_chestXform != null) {
			this.bar_chest = new BarCell(bar_chestXform);				
		} else {
			cc.error("bar_chest Can't Find Under btn_chestXform");
		}
		let gameClubXform = node.getChildByName("gameClub");
		if ( gameClubXform != null) {
			this.gameClub = gameClubXform;				
		} else {
			cc.error("gameClub Can't Find Under node");
		}
		let btn_tigerXform = node.getChildByName("btn_tiger");
		if ( btn_tigerXform != null) {
			this.btn_tiger = new ButtonCell(btn_tigerXform);				
		} else {
			cc.error("btn_tiger Can't Find Under node");
		}
    }

    public Free() {
        super.Free();
        
        this.top = null;
        if (this.btn_setting != null) {
            this.btn_setting.Free();
        }
        this.btn_setting = null;
        if (this.btn_diamond != null) {
            this.btn_diamond.Free();
        }
        this.btn_diamond = null;
        this.node_collection = null;
        if (this.img_collect != null) {
            this.img_collect.Free();
        }
        this.img_collect = null;
        this.bg_logo = null;
        if (this.btn_debug != null) {
            this.btn_debug.Free();
        }
        this.btn_debug = null;
        if (this.btn_mall != null) {
            this.btn_mall.Free();
        }
        this.btn_mall = null;
        if (this.btn_rank != null) {
            this.btn_rank.Free();
        }
        this.btn_rank = null;
        if (this.btn_gift != null) {
            this.btn_gift.Free();
        }
        this.btn_gift = null;
        if (this.btn_invite != null) {
            this.btn_invite.Free();
        }
        this.btn_invite = null;
        if (this.btn_play != null) {
            this.btn_play.Free();
        }
        this.btn_play = null;
        if (this.btn_album != null) {
            this.btn_album.Free();
        }
        this.btn_album = null;
        if (this.btn_chest != null) {
            this.btn_chest.Free();
        }
        this.btn_chest = null;
        if (this.bar_chest != null) {
            this.bar_chest.Free();
        }
        this.bar_chest = null;
        this.gameClub = null;
        if (this.btn_tiger != null) {
            this.btn_tiger.Free();
        }
        this.btn_tiger = null;
    }
}