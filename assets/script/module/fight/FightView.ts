import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { ListenID } from "../../ListenID";
import { DefaultTransition } from "../../../frame/mvcs/transition/DefaultTransition";
import { Time } from "../../../frame/Time";
import { FightUI } from "./uiGen/FightUI";
import { FuncDefine } from "../../config/FuncCfg"
import { Manager } from "../../manager/Manager";
import { SoundDefine } from "../../config/SoundCfg";
import { FxDefine } from "../../config/FxCfg";
import { CallID } from "../../CallID";
import { Const } from "../../config/Const";
import { ButtonCell } from "../../../frame/extension/ButtonCell";


const kAngleRange = [20, 45];
const kDistRange = [50, 200];
const kDeg2Rad = Math.PI / 180;

export class FightView extends MVCS.AbsView {
    public constructor() {
        super("ui/FightUI@Fight", MVCS.eUILayer.Main, MVCS.eUIQueue.Main, new DefaultTransition());
    }

    private _ui : FightUI;
    protected onLoad() : void {
        let ui = new FightUI(this.node);
        this._ui = ui;

        ui.btn_back.SetListener(this.onClickBack, this);
        ui.btn_back.clickAudioId = SoundDefine.BtnBack;        
    }
    
    protected onUnload() : void {

    }

    protected onOpen() {
        super.onOpen();

        this.InitStage();
        this.onFightStart();        
    }

    protected onClose() {
        super.onClose();
    }

    protected changeListener(enable : boolean) : void {
        //Notifier.changeListener(enable, ListenID.Fight_Start, this.onFightStart, this);
    }

    private onClickBack(){
        Notifier.send(ListenID.Scene_BackToCity);
    }

    private onClickAgain() {
        Notifier.send(ListenID.Scene_PlayAgain);
    }   

    protected InitStage() : void {
        
    }

    private onFightStart() {
        
    }
}

