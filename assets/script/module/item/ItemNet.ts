import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { ListenID } from "../../ListenID";
import { NetUtil } from "../../NetUtil";
import { ItemModel } from "./ItemModel"
import { MsgID } from "../../MsgID";
import { IItem } from "../../message/IItem";
import { IMsg } from "../../message/IMsg";
import { Const } from "../../config/Const";
import { Cost } from "../../common/Cost";

export class ItemNet extends MVCS.AbsNet<ItemModel> {

    public constructor() {
        super();
    }

    public reset() : void {
        
    }

    protected register() : void {
        Notifier.addListener(NotifyID.Day_Changed, this.onDayChanged, this);
        Notifier.addListener(ListenID.Login_Finish, this.onLoginFinish, this);
        Notifier.addListener(ListenID.Item_Update, this.updateItem, this);
        Notifier.addListener(ListenID.Item_UpdateList, this.updateItemList, this);
        Notifier.addListener(ListenID.Item_Awards, this.awards, this);
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
        if (data == null) {
            //新号，需要初始化物品信息
            data = Const.InitItem;
        }
        console.log(this._model.getType(), "onGet", msg.data, data)

        this._model.initItems(data);
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

    private onDayChanged(day : number) {
        console.info(this._model.getType(), "onDayChanged", day);
        if (this._model.checkDailyResets(day)) {
            this.reqSave();
        }
    }

    private updateItem(item : IItem) {
        this._model.updateItem(item);
        this.reqSave();
    }

    private updateItemList(items : IItem[]) {
        this._model.updateItems(items);
        this.reqSave();
    }

    /*
    * 奖励发放接口
    */
    private awards(rewards : Cost[]) {
        if (rewards == null) {
            console.log("awards rewards null");
            return;
        }

        let items = [];
        for (let index = 0; index < rewards.length; index++) {
            const reward = rewards[index];
            let item : IItem = {  id : reward.id, change : reward.num };
            items.push(item);
        }

        this.updateItemList(items);
    }
}