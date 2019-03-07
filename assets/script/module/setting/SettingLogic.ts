import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { Time } from "../../../frame/Time";
import { ListenID } from "../../ListenID";
import { CallID } from "../../CallID";
import { SettingModel } from "./SettingModel"
import { SettingNet } from "./SettingNet"

/*
 * 设置系统
 */
export class SettingLogic extends MVCS.MNLogic<SettingModel, SettingNet> {
    public constructor() {
        super("SettingLogic");

        this.setup(new SettingModel(), new SettingNet());
        this.changeListener(true);
    }

    protected changeListener(enable : boolean) : void {
        Notifier.changeCall(enable, CallID.Setting_IsMuteMusic, this.isMuteMusic, this);
        Notifier.changeCall(enable, CallID.Setting_IsMuteAudio, this.isMuteAudio, this);
        Notifier.changeCall(enable, CallID.Setting_IsBlockShake, this.isBlockShake, this);
    }

    private isMuteMusic() : boolean {
        return this._model.muteMusic;
    }

    private isMuteAudio() : boolean {
        return this._model.muteAudio;
    }

    private isBlockShake() : boolean {
        return this._model.blockShake;
    }
}