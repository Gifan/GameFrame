import { ButtonCell } from "../../../../frame/extension/ButtonCell";
import { ToggleCell } from "../../../../frame/extension/ToggleCell";
import { AbsCell } from "../../../../frame/extension/AbsCell";

/// <summary>
/// 程序生成的UI代码类，请勿修改
/// </summary>
export class SettingUI extends AbsCell {
    public constructor(node ?: cc.Node) {
        super();
        if (node != null) {
            this.Init(node);
        }
    }
    
    public shade : ButtonCell;
    public toggle_music : ToggleCell;
    public toggle_audio : ToggleCell;
    public toggle_shake : ToggleCell;
    public btn_back : ButtonCell;

    public Init(node : cc.Node) {
        this._node = node;
        
		let shadeXform = node.getChildByName("shade");
		if ( shadeXform != null) {
			this.shade = new ButtonCell(shadeXform);				
		} else {
			cc.error("shade Can't Find Under node");
		}
		let toggle_musicXform = node.getChildByName("toggle_music");
		if ( toggle_musicXform != null) {
			this.toggle_music = new ToggleCell(toggle_musicXform);				
		} else {
			cc.error("toggle_music Can't Find Under node");
		}
		let toggle_audioXform = node.getChildByName("toggle_audio");
		if ( toggle_audioXform != null) {
			this.toggle_audio = new ToggleCell(toggle_audioXform);				
		} else {
			cc.error("toggle_audio Can't Find Under node");
		}
		let toggle_shakeXform = node.getChildByName("toggle_shake");
		if ( toggle_shakeXform != null) {
			this.toggle_shake = new ToggleCell(toggle_shakeXform);				
		} else {
			cc.error("toggle_shake Can't Find Under node");
		}
		let btn_backXform = node.getChildByName("btn_back");
		if ( btn_backXform != null) {
			this.btn_back = new ButtonCell(btn_backXform);				
		} else {
			cc.error("btn_back Can't Find Under node");
		}
    }

    public Free() {
        this._node.destroy()
        this._node = null;
        
        if (this.shade != null) {
            this.shade.Free();
        }
        this.shade = null;
        if (this.toggle_music != null) {
            this.toggle_music.Free();
        }
        this.toggle_music = null;
        if (this.toggle_audio != null) {
            this.toggle_audio.Free();
        }
        this.toggle_audio = null;
        if (this.toggle_shake != null) {
            this.toggle_shake.Free();
        }
        this.toggle_shake = null;
        if (this.btn_back != null) {
            this.btn_back.Free();
        }
        this.btn_back = null;
    }
}