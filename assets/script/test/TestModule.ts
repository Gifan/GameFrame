import { FlowTipsArgs } from "../module/flowtips/FlowTipsArgs";
import { FuncDefine } from "../config/FuncCfg";
import { Manager } from "../manager/Manager";
import { FxDefine } from "../config/FxCfg";
import { IItem } from "../message/IItem";
import { Notifier } from "../../frame/mvcs/Notifier";
import { ListenID } from "../ListenID";
import { Time } from "../../frame/Time";

class _TestModule {
    public constructor() {
        if (cc.sys.platform != cc.sys.WECHAT_GAME) {
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);        
            cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);            
        }
    }

    public onKeyDown(event) {        
        switch(event.keyCode) {
            case cc.macro.KEY.num0:
                Notifier.send(ListenID.BG_Equip, 101);   
                break;
            case cc.macro.KEY.num1:
            case cc.macro.KEY.num2:
            case cc.macro.KEY.num3:
            case cc.macro.KEY.num4:
            case cc.macro.KEY.num5:
            case cc.macro.KEY.num6:
            case cc.macro.KEY.num7:
                //this.useSkill(101 + event.keyCode - cc.macro.KEY.num1);
                break;
            case cc.macro.KEY.f:
                Time.setScale(0.1, 2);
                break
            case cc.macro.KEY.n:
                Notifier.send(ListenID.Skin_Equip, 1002);
                Notifier.send(ListenID.BG_Equip, 102);           
                break
            case cc.macro.KEY.p:                
                let cost : IItem = { id : 2, change : 5 };
                Notifier.send(ListenID.Item_Update, cost);
                break;
            case cc.macro.KEY.o:
                Manager.camera.setShake(10, 60, 0.15);
                break;
            case cc.macro.KEY.i:
                Notifier.send(ListenID.Skin_Equip, 1003);
                Notifier.send(ListenID.BG_Equip, 103);  
                break;
            case cc.macro.KEY.u:
                
                break;
            case cc.macro.KEY.k:
                
                break;
        }
    }
    
    public onKeyUp(event) {

    }

 
}

export const TestModule = new _TestModule();