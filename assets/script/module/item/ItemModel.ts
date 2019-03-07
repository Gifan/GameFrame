import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { ListenID } from "../../ListenID";
import { Cfg } from "../../config/Cfg";
import { eItemType } from "../../common/eItemType";
import { IItem } from "../../message/IItem";
import { ItemDefine } from "../../config/ItemCfg";
import { Const } from "../../config/Const";
import { Time } from "../../../frame/Time";

export class ItemModel extends MVCS.AbsModel {
    public constructor() {
        super("_Item");
    }

    public reset() : void {
        this._items = [];
    }

    public serialize( ) : string { 
        return toJson(this._items); 
    }

    private _items : IItem[] = [];

    public initItems(items : IItem[]) {
        this._items = items;
        this.checkDailyResets();
        Notifier.send(ListenID.Item_Inited);
        console.info("initItems", toJson(items));
    }

    public updateItems(items : IItem[]) {
        for (let index = 0; index < items.length; index++) {
            const item = items[index];
            this.updateItem(item);
        }
    }

    public updateItem(item : IItem) {
        this._changed = true;
        let find = false;
        for (let index = 0; index < this._items.length; index++) {
            const exist = this._items[index];
            if (exist.id == item.id) {
                find = true;
                //console.info("updateItem", exist, item);
                exist.num += item.change;
                item.num = exist.num;
                //删除非过期物品
                if(exist.num <= 0 && exist.date == null){
                    this._items.remove(exist);
                }
                break;
            }
        }
        if (!find) {
            let newItem : IItem = copy(item);
            if (newItem.change) {
                if (newItem.num == null) {
                    newItem.num = newItem.change;
                    item.num = newItem.change;                            
                }
                delete newItem.change;
            }
            this._items.push(newItem);
        }
        Notifier.send(ListenID.Item_Changed, item);
    }

    public getItem(id : number) {
        for (let index = 0; index < this._items.length; index++) {
            const exist = this._items[index];
            if (exist.id == id) {
                return exist;
            }
        }

        //cc.log("getItem null, id:", id);
        return null;
    }

    public filter(types : eItemType[]) {
        let arr : IItem[] = [];
        for (let index = 0; index < this._items.length; index++) {
            const exist = this._items[index];
            const cfg = Cfg.Item.get(exist.id);
            if (cfg == null) {
                cc.error("Cfg.Item error id:", exist.id);
                continue;
            }
            if (types.contains(cfg.type)) {
                arr.push(exist);
            }
        }
        return arr;
    }

    private _dailyResetDatas = [
        {
            id : ItemDefine.Energy,
            max : Const.DailyEnergy
        }
    ];

    public checkDailyReset(item : IItem, day : number) {
        let data = null;
        for (let index = 0; index < this._dailyResetDatas.length; index++) {
            const element = this._dailyResetDatas[index];
            if (item.id == element.id) {
                data = element;
                break;
            }            
        }
        if (data == null) {
            return false;
        }

        if (item.date == null || day > item.date) {
            item.date = day;                
            if (data.max > item.num) {
                item.num = data.max;
            }
            Notifier.send(ListenID.Item_Changed, item);
            return true;
        }

        return false;
    }

    public checkDailyResets(day : number = null) {
        if (day == null) {
            let date = new Date(Time.serverTimeMs);
            day = date.getFullYear() * 10000 + date.getMonth() * 100 + date.getDate();            
        }
        let changed = false;
        for (let index = 0; index < this._items.length; index++) {
            const item = this._items[index];
            if (this.checkDailyReset(item, day)) {
                changed = true;
            }
        }
        return changed;
    }
}