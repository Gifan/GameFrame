
import { Util } from "../utils/Util";
import NormalTips from "./NormalTips";
import { MVC } from "../frame/MVC";
import { UIManager } from "../frame/UIManager";

export enum AlertType {
    COMMON = 0, //普通
    HELP = 1,   //帮助提示框
    NET_ERROR = 2,//网络异常
}

let _alertInstance: AlertManager;
export class AlertManager {

    public static tipPool: cc.NodePool = new cc.NodePool();
    public static showNormalTips(text: string, parent: cc.Node = null, time: number = 1, ydis: number = 50, pos: cc.Vec2 = cc.Vec2.ZERO): void {
        let node1 = this.tipPool.get();
        let call = (node) => {
            node.getComponent(NormalTips).setText(text);
            node.position = pos;
            node.opacity = 20;
            let action1 = cc.moveBy(time, cc.v2(0, ydis));
            let action2 = cc.fadeOut(1)
            let action3 = cc.fadeIn(0.5);
            let action4 = cc.spawn(action1, action3);
            let action5 = cc.spawn(action2, action1);
            node.group = "UI";
            if (parent && cc.isValid(parent)) {
                node.parent = parent;
            } else {
                node.setParent(UIManager.layerRoots(MVC.eUILayer.Tips));
            }
            node.runAction(cc.sequence(action4, cc.delayTime(0.5), action5, cc.callFunc(() => {
                this.tipPool.put(node);
            })));
        }
        if (!node1) {
            Util.loadPrefab("ui/common/alert/tip").then((node2) => {
                call(node2);
            })
        } else {
            call(node1);
        }
    }

    /**
     * @description 根据不同弹窗类型显示弹窗显示弹窗
     * @author 吴建奋
     * @date 2019-03-09
     * @static
     * @param {AlertType} alertType
     * @param {*} args
     * @memberof AlertManager
     */
    public static showAlert(alertType: AlertType, args: any) {
        if (alertType == AlertType.COMMON) {
            UIManager.Open("ui/common/alert/CommonAlert", MVC.eTransition.Default, MVC.eUILayer.Loading, args);
        } else if (alertType == AlertType.NET_ERROR) {
            UIManager.Open("ui/common/alert/NetErrorAlert", MVC.eTransition.Default, MVC.eUILayer.Loading, args);
        }
    }
}
