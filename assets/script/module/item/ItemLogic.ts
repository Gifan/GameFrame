import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";

import { ItemModel } from "./ItemModel"
import { ItemNet } from "./ItemNet"
import { Cost } from "../../common/Cost";
import { eItemType } from "../../common/eItemType";
import { CallID } from "../../CallID";
import { ListenID } from "../../ListenID";
import { ItemDefine } from "../../config/ItemCfg";
import { FuncDefine } from "../../config/FuncCfg";
import { UIManager } from "../../../frame/UIManager";
import { SDKKey } from "../../SDKKey";
import { FlowTipsArgs } from "../flowtips/FlowTipsArgs";


/// <summary>
/// 物品逻辑
/// </summary>
export class ItemLogic extends MVCS.MNLogic<ItemModel, ItemNet> {

    public constructor() {
        super("ItemLogic");

        this.setup(new ItemModel(), new ItemNet());
        this.changeListener(true);        
    }

    protected changeListener(enable : boolean) : void {
        Notifier.changeCall(enable, CallID.Item_Get, this.getItem, this);
        Notifier.changeCall(enable, CallID.Item_FilterByType, this.getItemList, this);
        Notifier.changeCall(enable, CallID.Item_IsEnough, this.isEnough, this);
        Notifier.changeCall(enable, CallID.Item_IsEnoughList, this.isEnoughList, this);

        Notifier.changeCall(enable, CallID.Item_CheckTrack, this.checkItemTrack, this);
        Notifier.changeListener(enable, ListenID.Item_Track, this.itemTrack, this);
    }

    private getItem(id : number) {
        let item = this._model.getItem(id);
        if (!item) {
            console.info("getItem null", id);
            return null;
        }
        return item;
    }

    private getItemList(types : eItemType[]) {
        return this._model.filter(types);
    }

    private isEnough(cost : Cost) {
        let item = this.getItem(cost.id);
        if (item == null) {
            return false;
        }
        return item.num >= cost.num;
    }

    private isEnoughList(costs : Cost[]) {
        for (let index = 0; index < costs.length; index++) {
            const cost = costs[index];
            if (!this.isEnough(cost)) {
                return false;
            }
        }
        return true;
    }

    private itemTrack(id : number) {
        if (id == ItemDefine.Energy) {
            let reward : boolean = Notifier.call(NotifyID.SDK_IsSwitchOpen, SDKKey.reward);
            if(!reward){
                let args = new FlowTipsArgs();
                args.SetInfo("体力不足");
                Notifier.send(ListenID.Flow_Txt, args);
                return
            }
            let args = new MVCS.OpenArgs();
            args.SetId(FuncDefine.Energy);
            Notifier.send(ListenID.Func_Open, args);
        } else {
            let args = new MVCS.OpenArgs();
            args.SetId(id);
            UIManager.Open(FuncDefine.ItemTrack, args);            
        }
    }

    private checkItemTrack(args : MVCS.OpenArgs) {
        let item = this.getItem(args.id);
        let num = 0;
        if (item != null) {
            num = item.num;
        }

        if (args.num <= num) {
            return false;
        }

        this.itemTrack(args.id);
        return true;
    }
}
