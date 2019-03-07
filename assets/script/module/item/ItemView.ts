import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { ListenID } from "../../ListenID";
import { DefaultTransition } from "../../../frame/mvcs/transition/DefaultTransition";
import { Cfg } from "../../config/Cfg";
import { ButtonCell } from "../../../frame/extension/ButtonCell";
import { SoundDefine } from "../../config/SoundCfg";
import { FxDefine } from "../../config/FxCfg";
import { BadgeDefine } from "../../config/BadgeCfg";
import { ItemDefine } from "../../config/ItemCfg";
import { SceneDefine } from "../../config/SceneCfg";
import { SceneSwitchMsg } from "../../message/SceneSwitchMsg";
import { StorageID } from "../../StorageID";
import { CallID } from "../../CallID";
import { Const } from "../../config/Const";
import { IItem } from "../../message/IItem";
import { SDKKey } from "../../SDKKey";

/*
* 物品数量显示
*/
export class ItemView extends MVCS.AbsView {
    public constructor(btn : ButtonCell, id : number, clickAudioId = 0, suffix = null, enableShortFormat = true) {
        super(btn.node, MVCS.eUILayer.Max, MVCS.eUIQueue.None, new DefaultTransition());

        this._btn = btn;
        this._suffix = suffix;
        this._enableShortFormat = enableShortFormat;
        btn.id = id;
        btn.clickAudioId = clickAudioId;
        btn.SetListener(this.onClick, this);
        let itemCfg = Cfg.Item.get(id);
        btn.icon.setSprite(itemCfg.icon);    
    }

    private _btn : ButtonCell;
    private _suffix : string = null;
    private _enableShortFormat = true;
    private _showAdd = true;

    protected onLoad() : void {

    }
    
    protected onUnload() : void {

    }

    private showAddBtn(){
        let reward : boolean = Notifier.call(NotifyID.SDK_IsSwitchOpen, SDKKey.reward);
        if(this._btn.id === ItemDefine.Energy){
            this._btn.badge.active = reward;
        }else{
            this._btn.badge.active = false;
        }
    }

    protected changeListener(enable : boolean) : void {
        Notifier.changeListener(enable, ListenID.Item_Inited, this.initNum, this);
        Notifier.changeListener(enable, ListenID.Item_Changed, this.onItemChanged, this);
        Notifier.changeListener(enable, NotifyID.App_Pause, this.onAppPause, this);
    }

    protected onShow() {
        super.onShow();
        this.showAddBtn();
        this.initNum();
    }

    private initNum() {
        let item : IItem = Notifier.call(CallID.Item_Get, this._btn.id);
        let itemNum = 0;
        if (item != null) {
            itemNum = item.num;
        }
        this.refreshNum(itemNum);
    } 

    private onItemChanged(item : IItem) {
        if (item.id != this._btn.id) {
            return;          
        }
        this.refreshNum(item.num);
    }

    private refreshNum(num : number) {
        let str : string;
        if (this._enableShortFormat) {
            str = shortFormat(num);
        } else {
            str = "" + num;
        }
        
        if (this._suffix != null) {
            this._btn.mainText.string = str + this._suffix;        
        } else {
            this._btn.mainText.string = str;
        }
    }

    private onClick(){
        let reward : boolean = Notifier.call(NotifyID.SDK_IsSwitchOpen, SDKKey.reward);
        if(!reward) return;
        if (!this._showAdd) {
            console.warn("ItemView.onClick skip by hideAdd");
            return;
        }
        Notifier.send(ListenID.Item_Track, this._btn.id);
    }

    public ShowAdd( enable : boolean ) {
        this._showAdd = enable;
        this._btn.badge.active = enable;
    }

    private onAppPause(enable : boolean) {
        if (enable) {
            
        } else {
            this.initNum();
        }
    }
}

