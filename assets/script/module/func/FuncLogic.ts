import { MVCS } from "../../../frame/mvcs/MVCS"
import { UIManager } from "../../../frame/UIManager"
import { Notifier } from "../../../frame/mvcs/Notifier"
import { ListenID } from "../../ListenID"

import { FuncModel } from "./FuncModel"
import { FuncNet } from "./FuncNet"
import { Cfg } from "../../config/Cfg";
import { CallID } from "../../CallID";

/// <summary>
/// 功能管理逻辑
/// </summary>
export class FuncLogic extends MVCS.MNLogic<FuncModel, FuncNet> {

    public constructor() {
        super("FuncLogic");

        this.setup(new FuncModel(), new FuncNet());
        this.changeListener(true);        
    }

    protected changeListener(enable : boolean) : void {
        Notifier.changeListener(enable, ListenID.Func_Open, this.open, this);
        Notifier.changeCall(enable, CallID.Func_GetShareNum, this.getShareNum, this);
        Notifier.changeCall(enable, CallID.Func_GetFirstTime, this.getFirsTime, this);
    }

    private open(args : MVCS.OpenArgs) {
        let cfg = Cfg.Func.get(args.id);
        if (cfg == null) {
            cc.error("FuncLogic.open error id", args.id);
            return;
        }
        if (cfg.father != null) {
            args.SetTab(args.id);
            args.SetId(cfg.father);
        }
        UIManager.Open(args.id, args);
    }

    private getShareNum(): number{
        if(!this._model.vo){
            return 0;
        }
        return this._model.getShareNum();
    }

    private getFirsTime(): string{
        if(!this._model.vo){
            return "";
        }
        return this._model.getFirstTime();
    }

}
