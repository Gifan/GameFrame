import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { UIManager } from "../../../frame/UIManager";
import { FuncDefine } from "../../config/FuncCfg";

/// <summary>
/// 飘字
/// </summary>
export class FlowTipsLogic extends MVCS.AbsLogic {

    public constructor() {
        super("FlowTipsLogic");

        Notifier.addListener(NotifyID.App_Start, this.OnAppStart, this);
    }

    public setup(model?, net?) : boolean {
        if (this.isSetup) {
            return true;
        }
        this._isSetup = true;

        return false;
    }

    public reset() : void {
        if (!this.isSetup) {
            return ;
        }
    }

    private OnAppStart() : void {
        //cc.error(this.getType(), "OnAppStart");

        UIManager.Open(FuncDefine.FlowTips);
    }
}
