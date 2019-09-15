
import { Manager } from "../manager/Manager";
import { MVCS } from "../frame/MVCS";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonAlert extends MVCS.BaseView {

    @property(cc.RichText)
    desc: cc.RichText = null;

    private cbConfirm: Function = null;
    start() {

    }
    // 设置事件监听
    protected changeListener(enable: boolean): void {

    };

    public onOpen(args: any) {
        super.onOpen(args);
        this.desc.string = args.desc ? args.desc : "";
        this.desc.node.parent.height = this.desc.node.height + 250;
        this.cbConfirm = args && args.errorcb;
    }

    public onClose() {
        Manager.audio.playAudio(1);
        super.onClose();
        this.cbConfirm && this.cbConfirm();

    }
    // update (dt) {}
}
