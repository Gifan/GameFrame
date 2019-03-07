import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { ScaleTransition } from "../../../frame/mvcs/transition/ScaleTransition";
import { Time } from "../../../frame/Time";
import { Watcher } from "../../../frame/Watcher";

import { Cfg } from "../../config/Cfg";
import { ItemTrackUI } from "./uiGen/ItemTrackUI";
import { CellPool } from "../../../frame/extension/CellPool";
import { ButtonCell } from "../../../frame/extension/ButtonCell";
import { eItemSourceType } from "../../common/eItemSourceType";
import { FuncDefine } from "../../config/FuncCfg";
import { SoundDefine } from "../../config/SoundCfg";
import { ListenID } from "../../ListenID";
import { CallID } from "../../CallID";
import { IItem } from "../../message/IItem";

export class ItemTrackView extends MVCS.AbsView {
    public constructor() {
        super("ui/ItemTrackUI@ItemTrack", MVCS.eUILayer.Tips, MVCS.eUIQueue.Tips, new ScaleTransition())
        
    }

    private _ui : ItemTrackUI;
    private _pool : CellPool<ButtonCell>;
    private _panelY = 133;
    private _panelHeight = 278;

    protected onLoad() : void {
        let ui = new ItemTrackUI(this.node);
        this._ui = ui;

        ui.btn_close.SetListener(this.close, this);
        ui.btn_close.clickAudioId = SoundDefine.BtnBack;
        ui.shade.SetListener(this.onClickFrame, this);

        this._panelY = ui.top.y;
        this._panelHeight = ui.bg.node.height;

        let pool = new CellPool<ButtonCell>(ButtonCell, ui.btn_go, ui.bottom.node, this, this.onCreateButton);
        this._pool = pool;
    }

    protected onUnload() : void {
        
    }

    protected onOpen():void{
        super.onOpen();
        
        this.init();
    }

    private onCreateButton(btn : ButtonCell) {
        btn.SetListenerWithSelf(this.onClickButton, this);
        btn.clickAudioId = SoundDefine.BtnStart;
    }

    private onClickButton(btn : ButtonCell) {
        this.close();
        const type = btn.index;
        const id = btn.id;

        let args = new MVCS.OpenArgs();
        switch (type) {
            case eItemSourceType.Shop:
                args.SetId(FuncDefine.Shop);
                args.SetTab(id);
                args.SetSelect(this._openArgs.id);
                Notifier.send(ListenID.Func_Open, args);
                break;
            case eItemSourceType.Func:
                args.SetId(id);
                Notifier.send(ListenID.Func_Open, args);
                break;
            default:
                cc.error("ItemTrackView.error sourceType:", type);
                break;
        }
    }

    private init() {
        if (this._openArgs == null) {
            cc.error("ItemTrackView.init _openArgs null");
            this.close();
            return;
        }

        let ui = this._ui;
        let openArgs = this._openArgs;
        let itemCfg = Cfg.Item.get(openArgs.id);
        ui.txt_name.string = itemCfg.name;
        ui.icon_item.setSprite(itemCfg.icon);
        let item : IItem = Notifier.call(CallID.Item_Get, itemCfg.id);
        let num = 0;
        if (item != null) {
            num = item.num;
        }
        if (openArgs.num != null) {
            ui.txt_num.string = "拥有：" + num + "/" + openArgs.num;            
        } else {
            ui.txt_num.string = "拥有：" + num;   
        }

        this._pool.Clear();
        for (let index = 0; index < itemCfg.sourceTypes.length; index++) {
            const type = itemCfg.sourceTypes[index];
            const id = itemCfg.sourceVals[index];
            const btn = this._pool.Pop();
            btn.index = type;
            btn.id = id;

            let funcCfg;
            switch (type) {
                case eItemSourceType.Shop:
                    funcCfg = Cfg.Func.get(FuncDefine.Shop);
                    btn.icon.setSprite(funcCfg.icon);
                    btn.mainText.string = funcCfg.name;
                    btn.image.enabled = true;
                    btn.interactable = true;
                    btn.badge.active = false;
                    break;
                case eItemSourceType.Func:
                    funcCfg = Cfg.Func.get(id);
                    btn.icon.setSprite(funcCfg.icon);
                    btn.mainText.string = funcCfg.name;
                    btn.image.enabled = true;
                    btn.interactable = true;
                    btn.badge.active = false;
                    break;
                default:
                    cc.error("ItemTrack error sourceType:", type);
                    break;
            }
        }

        Time.delay(0.03, this.resize, null, this, 3);        
    }

    private resize() {
        let ui = this._ui;
        let height = ui.bottom.node.height;
        let y = (height - this._panelHeight) * 0.5 + this._panelY;

        ui.bg.node.height = height
        ui.top.y = y;
        ui.bottom.node.y = y;
    }
}
