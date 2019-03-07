import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { ListenID } from "../../ListenID";
import { NetUtil } from "../../NetUtil";
import { SettingModel } from "./SettingModel"
import { MsgID } from "../../MsgID";
import { IMsg } from "../../message/IMsg";
import { Const } from "../../config/Const";
import { Manager } from "../../manager/Manager";

export class SettingNet extends MVCS.AbsNet<SettingModel> {

    public constructor() {
        super();
    }

    public reset() : void {
        
    }

    protected register() : void {
        Notifier.addListener(ListenID.Login_Finish, this.onLoginFinish, this);
        Notifier.addListener(ListenID.Setting_MuteMusic, this.reqMuteMusic, this);
        Notifier.addListener(ListenID.Setting_MuteAudio, this.reqMuteAudio, this);
        Notifier.addListener(ListenID.Setting_BlockShake, this.reqBlockShake, this);
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
        this._model.initSetting(data);

        if (this._model.muteMusic) {
            Manager.audio.muteMusic(true);
        }
        if (this._model.muteAudio) {
            Manager.audio.muteAudio(true);
        }
    }

    private reqMuteMusic(enable : boolean) {
        this._model.muteMusic = enable;
        Manager.audio.muteMusic(enable);
        this.reqSave();
    }

    private reqMuteAudio(enable : boolean) {
        this._model.muteAudio = enable;
        Manager.audio.muteAudio(enable);
        this.reqSave();
    }

    private reqBlockShake(enable : boolean) {
        this._model.blockShake = enable;
        
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