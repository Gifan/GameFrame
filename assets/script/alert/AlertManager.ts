import { MVC } from "../framework/MVC";
import { Util } from "../utils/Util";
import { UIManager } from "../framework/UIManager";
import NormalTips from "./NormalTips";

export enum AlertType {
    COMMON = 0, //普通
    HELP = 1,   //帮助提示框
    NET_ERROR = 2,//网络异常
}

let _alertInstance: AlertManager;
export class AlertManager {
    public static showNormalTips(text: string, uilayer: MVC.eUILayer = MVC.eUILayer.Tips, time: number = 1, ydis: number = 70, posy: number = 0): void {
        Util.loadPrefab("common/alert/tip").then((node) => {
            node.getComponent(NormalTips).setText(text);
            node.y = posy;
            var action1 = cc.moveBy(time, cc.v2(0, ydis));
            var action2 = cc.fadeOut(1)
            node.group = "UI";
            node.setParent(UIManager.layerRoots(uilayer));
            node.runAction(cc.sequence(action1, action2, cc.callFunc(() => {
                node.destroy();
            })));
        })
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
            UIManager.Open("common/alert/CommonAlert", MVC.eTransition.Default, MVC.eUILayer.Loading, args);
        } else if (alertType == AlertType.NET_ERROR) {
            UIManager.Open("common/alert/NetErrorAlert", MVC.eTransition.Default, MVC.eUILayer.Loading, args);
        }
    }
}
