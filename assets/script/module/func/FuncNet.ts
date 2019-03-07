import { MVCS } from "../../../frame/mvcs/MVCS"
import { FuncModel } from "./FuncModel"
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NetUtil } from "../../NetUtil";
import { IMsg } from "../../message/IMsg";
import { ListenID } from "../../ListenID";

export class FuncNet extends MVCS.AbsNet<FuncModel> {

    public constructor() {
        super();
    }

    public reset() : void {
        
    }

    protected register() : void {
        Notifier.addListener(ListenID.Login_Finish, this.onLoginFinish, this);
        Notifier.addListener(ListenID.Func_UpdateShareNum, this.updateShareNum, this);
        Notifier.addListener(ListenID.Func_ResetNum, this.resetNum, this);
        Notifier.addListener(ListenID.Func_SetTime, this.setTime, this);
    }

    
    private onLoginFinish() {
        this.reqGet();
    }

    private reqGet() {
        NetUtil.httpGet("userData", 
            {datatype : this._model.getType()},
            this.onGet,
            this
        );
    }

    private onGet(msg : IMsg) {
        let data = JSON.parse(msg.data);
        cc.log(this._model.getType(), "onGet", msg.data, data)
        this._model.initFunc(data);
    }

    private updateShareNum(){
        this._model.updateShareNum();
        Notifier.send(ListenID.Func_RefreshData, this._model.getShareNum(), this._model.getFirstTime());
        this.reqSave();
    }

    private resetNum(){
        this._model.resetNum();
        Notifier.send(ListenID.Func_RefreshData, this._model.getShareNum(), this._model.getFirstTime());
        this.reqSave();
    }

    private setTime(time: string){
        this._model.setFirstTime(time);
        Notifier.send(ListenID.Func_RefreshData, this._model.getShareNum(), this._model.getFirstTime());
        this.reqSave();
    }

    public reqSave() {
        NetUtil.httpPost("userData", 
            {datatype : this._model.getType(), content : this._model.serialize()},
            this.onSave,
            this
        );
    }

    private onSave(msg : any) {
        
    }
}