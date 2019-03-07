import { MVCS } from "../../../frame/mvcs/MVCS"
import { Notifier } from "../../../frame/mvcs/Notifier"
import { UIManager } from "../../../frame/UIManager"
import { ListenID } from "../../ListenID"
import { FuncDefine } from "../../config/FuncCfg";

import { AffirmModel } from "./AffirmModel"
import { AffirmNet } from "./AffirmNet"
import { NotifyID } from "../../../frame/mvcs/NotifyID";

/// <summary>
/// 二次确认提示
/// </summary>
export class AffirmLogic extends MVCS.MNLogic<AffirmModel, AffirmNet> {

    public constructor() {
        super("AffirmLogic");

        this.setup(new AffirmModel(), new AffirmNet());
        this.changeListener(true);
    }

    protected changeListener(enable : boolean) : void {
        Notifier.changeListener(enable, ListenID.Affirm, this.OnAffirm, this);
        Notifier.changeListener(enable, NotifyID.DownLoad_Fail, this.OnDownLoadFail, this);
    }

    private _msgQueue : MVCS.AffirmArgs[] = [];
    public popMsg() {
        if (this._msgQueue.length > 0) {
            return this._msgQueue.shift();            
        } else {
            return null;
        }
    }

    public peekMsg() {
        if (this._msgQueue.length > 0) {
            return this._msgQueue[0];            
        } else {
            return null;
        }
    }

    private OnAffirm(args : MVCS.AffirmArgs) : void {
        this._msgQueue.push(args);
        if (this._msgQueue.length == 1) {
            UIManager.Open(FuncDefine.Affirm);            
        }
    }

    private OnDownLoadFail(path : string) : void {
        console.error("AffirmLogic.OnDownLoadFail", path);

        let args : MVCS.AffirmArgs = new MVCS.AffirmArgs();
        args.SetTitle("下载失败")
            .SetInfo("当前网络异常，请在网络良好处重启微信再次尝试")
            .SetStyle(MVCS.eAffirmStyle.YesOrNo)            
            .SetContext(this);
        this.OnAffirm(args);
    }
}
