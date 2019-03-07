import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier, PriorLow } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { ListenID } from "../../ListenID";
import { FuncDefine } from "../../config/FuncCfg";

import { BadgeModel } from "./BadgeModel"
import { Cfg } from "../../config/Cfg";
import { BadgeDefine } from "../../config/BadgeCfg";
import { CallID } from "../../CallID";
import { ItemDefine } from "../../config/ItemCfg";

/// <summary>
/// 小红点逻辑
/// </summary>
export class BadgeLogic extends MVCS.MLogic<BadgeModel> {

    public constructor() {
        super("BadgeLogic");

        this.setup(new BadgeModel(), null);
        this.changeListener(true);
    }

    protected changeListener(enable : boolean) : void {
       Notifier.changeListener(enable, ListenID.Login_Finish, this.OnInit, this);
       //Notifier.changeListener(enable, ListenID.Badge_Init, this.OnInit, this);
       Notifier.changeListener(enable, ListenID.Badge_Update, this.OnUpdate, this);
       Notifier.changeCall(enable, CallID.Badge_Exist, this.exist, this);
       Notifier.changeCall(enable, CallID.Badge_Count, this.count, this);

       Notifier.changeListener(enable, ListenID.Item_Update, this.OnItemUpdate, this, PriorLow);
       Notifier.changeListener(enable, ListenID.Item_UpdateList, this.OnItemUpdate, this, PriorLow);
    //    Notifier.changeListener(enable, ListenID.Item_Changed, this.onItemChanged, this);
    }

    private OnInit() : void {
        this.OnItemUpdate();
    }

    private OnUpdate(id:number, count:number) : void {
        let badge = this._model.get(id);
        if (count != badge.count) {
            badge.setCount(count);            
        }
    }

    private exist(id : number) : boolean {
        let badge = this._model.get(id);
        if (badge == null) {
            return false;
        }
        return badge.count > 0;
    }

    private count(id : number) : number {
        let badge = this._model.get(id);
        return badge.count;
    }

    private OnItemUpdate() : void {
        // let count = 0;
        // //判断是否有可解锁皮肤
        // let skinCfgs = Cfg.Skin.getAll();
        // for (const key in skinCfgs) {
        //     const cfg = skinCfgs[key];
        //     if (cfg.hide || cfg.unlockCost == null) {
        //         continue;
        //     }
        //     let skin = Notifier.call(CallID.Skin_Get, cfg.id)
        //     if (skin != null) {
        //         continue;
        //     }

        //     let isEnough : boolean = Notifier.call(CallID.Item_IsEnough, cfg.unlockCost);
        //     if (isEnough) {
        //         count = 1;
        //         //cc.log("skin isEnough, id:", cfg.id);
        //         break;
        //     }
        // }  
        // let skinUnlockable = this._model.get(BadgeDefine.SkinUnlockable);
        // if (count != skinUnlockable.count) {
        //     skinUnlockable.setCount(count);            
        // }
    }

    //物品改变
    // private onItemChanged(item : Common.Item) {
    //     if(item.id == ItemDefine.Raffle){
    //         //判断有抽奖卷
    //         this.OnUpdate(BadgeDefine.Raffle, item.num)
    //     }
    // }
}
