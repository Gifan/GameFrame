import { MVC } from "../framework/MVC";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShareFailTips extends MVC.BaseView {

    protected changeListener(enable: boolean): void {
        
    }

    start() {

    }

    onClose() {
        super.onClose();
    }
}
