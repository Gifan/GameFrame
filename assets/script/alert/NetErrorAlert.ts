
import { Manager } from "../manager/Manager";
import { MVC } from "../frame/MVC";

const { ccclass, property } = cc._decorator;

@ccclass
export default class CommonAlert extends MVC.BaseView {

    private cbConfirm:Function = null;
    start() {

    }
    // 设置事件监听
    protected changeListener(enable: boolean): void {

    };

    public onOpen(args: any) {
        super.onOpen(args);
        this.cbConfirm = args && args.errorcb;
    }

    public onClose() {
        Manager.audio.playAudio(1);
        super.onClose();
        this.cbConfirm && this.cbConfirm();
    }
    // update (dt) {}
}
