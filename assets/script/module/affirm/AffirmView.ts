import { MVCS } from "../../../frame/mvcs/MVCS"
import { ScaleTransition } from "../../../frame/mvcs/Transition/ScaleTransition"
import { Time } from "../../../frame/Time";
import { AffirmUI } from "./uiGen/AffirmUI";
import { AffirmLogic } from "./AffirmLogic";

export class AffirmView extends MVCS.AbsView {
    public constructor() {
        super("ui/AffirmUI@Affirm", MVCS.eUILayer.Tips, MVCS.eUIQueue.None, new ScaleTransition())

        this._logic = MVCS.LogicContainer.getInstance("AffirmLogic");
    }

    private _ui : AffirmUI;
    private _logic : AffirmLogic;
    private _reply : MVCS.eReplyOption;
    private _confirmX = 108;
    private _offsetMainH = 0;
    private _offsetTopH = 0;

    protected onLoad() : void {
        let ui = new AffirmUI(this.node);
        this._ui = ui;

        ui.shade.SetListener(this.onClickFrame, this);
        ui.btn_close.SetListener(this.onClickClose, this);
        ui.btn_refuse.SetListener(this.onClickRefuse, this);
        ui.btn_confirm.SetListener(this.onClickConfirm, this);

        this._confirmX = ui.btn_confirm.node.x;
        this._offsetMainH = ui.bg_main.node.height - ui.txt_info.node.height;
        this._offsetTopH = ui.top.height - ui.txt_info.node.height;
    }

    protected onUnload() : void {
        
    }

    protected onClose() : void {
        super.onClose();

        let args = this._logic.popMsg();
        if (args.callback != null) {
            args.callback.call(args.context, this._reply, args.param);
        }

        args = this._logic.peekMsg();
        if (args != null) {
            this.open();
        }
    }

    private onClickClose() : void {
        //cc.log("onClickClose:" + this.getType());
        this._reply = MVCS.eReplyOption.Cancel;
        this.close();
    }

    private onClickRefuse() : void {
        //cc.log("onClickRefuse:" + this.getType());
        this._reply = MVCS.eReplyOption.Refuse;
        this.close();
    }

    private onClickConfirm() : void {
        //cc.log("onClickConfirm:" + this.getType());
        
        this._reply = MVCS.eReplyOption.Confirm;      
        this.close();        
    }

    protected onOpen() : void {      
        super.onOpen();        
        //cc.log("onOpen:", this.getType(), this._openArgs);

        let openArgs = this._logic.peekMsg();
        if (openArgs == null) {
            cc.error("AffirmnView onOpen _openArgs null");
            this.close();
            return;
        }

        let ui = this._ui;
        if (openArgs.title != null) {
            ui.txt_title.string = openArgs.title;
        } else {
            ui.txt_title.string = "提示";
        }

        if (openArgs.info != null) {
            ui.txt_info.string = openArgs.info;
        } else {
            ui.txt_info.string = "没有内容";
        }

        switch (openArgs.style) {
            case MVCS.eAffirmStyle.Yes:
                ui.btn_refuse.node.active = false;
                ui.btn_confirm.node.x = 0;
                ui.btn_close.node.active = true;
                break;
            case MVCS.eAffirmStyle.YesOrNo:
                ui.btn_refuse.node.active = true;
                ui.btn_confirm.node.x = this._confirmX;
                ui.btn_close.node.active = false;
                break;
            default:
                cc.error("eAffirmStyle error:", openArgs.style);
                break;
        }

        Time.delay(0.01, this.resize, null, this);   
    }

    private resize() {
        let ui = this._ui;
        ui.top.height = this._offsetTopH + ui.txt_info.node.height
        ui.bg_main.node.height = this._offsetMainH + ui.txt_info.node.height;

        //cc.log("resize:", ui.bg_main.node.height, this._offsetH, ui.txt_info.node.height)
    }
}
