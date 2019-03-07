import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { ListenID } from "../../ListenID";
import { DefaultTransition } from "../../../frame/mvcs/transition/DefaultTransition";
import { Time } from "../../../frame/Time";
import { MainUI } from "./uiGen/MainUI";
import { FuncDefine } from "../../config/FuncCfg"
import { Manager } from "../../manager/Manager";
import { SoundDefine } from "../../config/SoundCfg";
import { BadgeDefine } from "../../config/BadgeCfg";
import { ItemDefine } from "../../config/ItemCfg";
import { SceneSwitchMsg } from "../../message/SceneSwitchMsg";
import { StorageID } from "../../StorageID";
import { CallID } from "../../CallID";
import { Const } from "../../config/Const";
import { Badge } from "../../message/Badge";
import { UIManager } from "../../../frame/UIManager";
import { WeChatSDK } from "../../../sdk/WeChatSDK";
import { Cfg } from "../../config/Cfg";
import { ItemView } from "../item/ItemView";
import { IItem } from "../../message/IItem";
import { SceneDefine } from "../../config/SceneCfg";
import { AppConfig } from "../../../sdk/AppConfig";
import { SDKKey } from "../../SDKKey";

export class MainView extends MVCS.AbsView {
    public constructor() {
        super("ui/MainUI@Main", MVCS.eUILayer.Main, MVCS.eUIQueue.Main, new DefaultTransition());
    }

    private _ui : MainUI;
    private chestTimes: number = 0;

    protected onLoad() : void {
        let ui = new MainUI(this.node);
        this._ui = ui;

        ui.bg_logo.node.on(cc.Node.EventType.TOUCH_START, this.onPressDebugStart, this);
        ui.bg_logo.node.on(cc.Node.EventType.TOUCH_END, this.onPressDebugEnd, this);
        ui.btn_debug.SetListener(this.onClickDebug, this);
        let debugMode = Manager.storage.getBool(StorageID.DebugMode);
        if (!debugMode) {
            ui.btn_debug.node.active = false;
        }

        ui.btn_play.SetListener(this.onClickPlay, this);
        ui.btn_play.clickAudioId = SoundDefine.BtnStart;        
        ui.btn_chest.SetListener(this.onClickChest, this);
        ui.btn_chest.clickAudioId = SoundDefine.BtnStart;

        let goldView = new ItemView(ui.btn_diamond, ItemDefine.Gold, SoundDefine.BtnStart);
        this.addChildren(goldView);
        // let energyView = new ItemView(ui.btn_energy, ItemDefine.Energy, SoundDefine.BtnStart, "/" + Const.DailyEnergy);
        // this.addChildren(energyView);

        ui.btn_setting.SetListener(this.onClickSetting, this);
        ui.btn_setting.clickAudioId = SoundDefine.BtnStart;
        
        ui.btn_album.SetListener(this.onClickAlbum, this);
        ui.btn_album.clickAudioId = SoundDefine.BtnStart;
        ui.btn_invite.SetListener(this.onClickInvite, this);
        ui.btn_invite.clickAudioId = SoundDefine.BtnStart;
        ui.btn_gift.SetListener(this.onClickGift, this);
        ui.btn_gift.clickAudioId = SoundDefine.BtnStart;
        ui.btn_mall.SetListener(this.onClickMall, this);
        ui.btn_mall.clickAudioId = SoundDefine.BtnStart;
        ui.btn_rank.SetListener(this.onClickRank, this);
        ui.btn_rank.clickAudioId = SoundDefine.BtnStart;
        ui.img_collect.SetListener(this.onClickCollection, this);
    }
    
    protected onUnload() : void {
        if (this._ui != null) {
            this._ui.Free();            
        }
        this._ui = null;
    }

    protected onShow():void{
        super.onShow();
        this.initBadge();
        this.initChest();
        this.initSkin();

        Notifier.send(NotifyID.SDK_CreateTiger, AppConfig.TigerID.login, this._ui.btn_tiger.button);
        this.onAlbumChanged();
    }

    protected onHide() : void {
        super.onHide();
        
        Notifier.send(NotifyID.SDK_CleanTiger);
        WeChatSDK.destroyGameClubButton();
    }

    protected changeListener(enable : boolean) : void {
        Notifier.changeListener(enable, NotifyID.App_Pause, this.onAppPause, this);
        Notifier.changeListener(enable, ListenID.Badge_Changed, this.onBadgeChanged, this);        
        Notifier.changeListener(enable, NotifyID.View_Opened, this.onOtherViewOpened, this);
        Notifier.changeListener(enable, NotifyID.View_Closed, this.onOtherViewClosed, this);
        Notifier.changeListener(enable, ListenID.Chest_RefreshData, this.refreshChestData, this);
        Notifier.changeListener(enable, ListenID.Stage_AlbumChanged, this.onAlbumChanged, this);
        Notifier.changeListener(enable, ListenID.Stage_SelectChanged, this.onAlbumChanged, this);
        Notifier.changeListener(enable, ListenID.Skin_EquipChanged, this.onSkinChanged, this);
    }

    /********Debug开关************************************/
    private kDebugKeys : string[] = ["i", "m", "m", "m", "m"];
    private _debugInputs : string[];

    private checkDebug(key : string) {
        if (this._debugInputs == null) {
            return;
        }

        let len = this._debugInputs.length;
        if (key != this.kDebugKeys[len]) {
            console.warn("checkDebug fail key:", key, len);
            Manager.storage.setBool("DebugMode", false);
            this._ui.btn_debug.node.active = false;
            this._debugInputs = null;
            return;
        } else {
            console.warn("checkDebug key:", key, len);
        }

        if (len == this.kDebugKeys.length - 1) {
            console.warn("open debug mode");
            Manager.storage.setBool("DebugMode", true);
            this._ui.btn_debug.node.active = true;
            this._debugInputs = null;
        } else {
            this._debugInputs.push(key);
        }
    }

    private _pressDebugTime = 0;
    private onPressDebugStart() {
        this._pressDebugTime = Time.time;
        //cc.error("onPressStartHead", Time.time);
    }

    private onPressDebugEnd() {
        //cc.error("onPressEndHead", Time.time);
        if (Time.time - this._pressDebugTime < 5) {
            return;
        }
        this._debugInputs = [];
        cc.error("checkDebug start");
    }

    private onClickDebug(){        
        // let debugMode = Manager.storage.getBool(StorageID.DebugMode);
        // if (!debugMode) {
        //     cc.log("not debugMode")
        //     return;
        // }

        //加载初始包资源
        // let args : MVCS.OpenArgs = new MVCS.OpenArgs();
        // args.SetId(FuncDefine.ItemTips);
        // args.SetSelect(ItemDefine.Gold);        
        // Notifier.send(ListenID.Func_Open, args);
        
        //测试打开界面
        // UIManager.Open(FuncDefine.Settlement);
        // UIManager.Open(FuncDefine.Fail);
    }
    /********************************************/

    //初始化红点
    private initBadge() {
        let ui = this._ui;
        let exist : boolean;
        exist = Notifier.call(CallID.Badge_Exist, BadgeDefine.Invite);
        ui.btn_invite.badge.active = exist;
        
        exist = Notifier.call(CallID.Badge_Exist, BadgeDefine.Sign);
        ui.btn_gift.badge.active = exist;

        exist = Notifier.call(CallID.Badge_Exist, BadgeDefine.Shop);
        ui.btn_mall.badge.active = exist;

        exist = Notifier.call(CallID.Badge_Exist, BadgeDefine.Rank);
        ui.btn_rank.badge.active = exist;
    }

    //红点改变
    private onBadgeChanged(badge : Badge) {
        if (badge.id == BadgeDefine.Sign) {
            this._ui.btn_gift.badge.active = badge.count > 0;
        } else if (badge.id == BadgeDefine.Invite) {
            this._ui.btn_invite.badge.active = badge.count > 0;
        } else if(badge.id == BadgeDefine.Shop){
            this._ui.btn_mall.badge.active = badge.count > 0;        
        } else if(badge.id == BadgeDefine.Rank){
            this._ui.btn_rank.badge.active = badge.count > 0;
        }
    }

    private onOtherViewOpened(view : MVCS.AbsView) {
        let openCnt = UIManager.GetOpenCount(MVCS.eUILayer.Max);
        //cc.error("onOtherViewOpened", openCnt, view.assetPath);
        //主界面和飘字界面常驻
        if (openCnt > 2) {
            WeChatSDK.destroyGameClubButton();
        }
    }

    private onOtherViewClosed(view : MVCS.AbsView) {
        let openCnt = UIManager.GetOpenCount(MVCS.eUILayer.Max);
        //cc.error("onOtherViewClosed", openCnt, view.assetPath);
        if (openCnt == 2) {
            let node = this._ui.gameClub;
            let pos = node.convertToWorldSpace(cc.Vec2.ZERO);
            //cc.error("gameClub pos", pos, cc.view.getVisibleSize());
            WeChatSDK.createGameClubButton(pos, node.width);
        }
    }

    private onAlbumChanged() {
        // let lastStageId : number = Notifier.call(CallID.Stage_GetLastId);
        // this._ui.btn_play.mainText.string = (lastStageId - SceneDefine.Frist + 1).toString();
        // cc.error("onAlbumChanged", lastStageId);
    }

    private onClickAlbum(){
        let args = new MVCS.OpenArgs();
        args.SetId(FuncDefine.Stage);
        Notifier.send(ListenID.Func_Open, args);
    }

    private onClickPlay(){
        this.checkDebug("p");

        let stageId : number = Notifier.call(CallID.Stage_GetLastId);
        let sceneCfg = Cfg.Scene.get(stageId);
        if (sceneCfg.cost != null) {
            let args : MVCS.OpenArgs = new MVCS.OpenArgs();
            args.SetId(sceneCfg.cost.id);
            args.SetNum(sceneCfg.cost.num);
            let needTrack : boolean = Notifier.call(CallID.Item_CheckTrack, args)
            if (needTrack) {
                return;
            }
        }

        let msg = new SceneSwitchMsg();
        msg.setId(stageId);
        Notifier.send(ListenID.Scene_AskSwitch, msg);
        Notifier.send(ListenID.Stage_ChangeStage, stageId);
    }

    private refreshChestData(times: number){
        this.chestTimes = times;
        this.initChest();
    }

    /** 宝箱信息初始化 */
    private initChest() {
        // this.star = Notifier.call(CallID.Stage_GetTotalStar);
        // this.chestTimes = Notifier.call(CallID.Chest_GetTimes);

        // let bar = this._ui.bar_chest;
        // let curStar = this.getCurStar(this.star);
        // let needStar = 0;
        // let starCfg = Cfg.Star.get(this.chestTimes+1);
        // if(starCfg){
        //     needStar = starCfg.star;
        //     if(curStar >= needStar){
        //         bar.progress = 1;
        //     }else{
        //         bar.progress = curStar/needStar;
        //     }
        //     bar.mainText.string = curStar + "/" + needStar;
        // }
    }

    private getCurStar(allStar: number){
        let times = this.chestTimes;
        let star = allStar;
        if(times === 0){
            return star;
        }
        for(let i=0; i<times; i++){
            star -= Cfg.Star.get(i+1).star;
        }
        return star;
    }

    private onClickChest(){
        let bar = this._ui.bar_chest;
        let isFull = bar.progress >= 1;
        if (isFull) {
            Notifier.send(ListenID.Chest_UpdateTimes);
            let args = new MVCS.OpenArgs();
            args.SetId(FuncDefine.Chest);
            args.SetParam(this.chestTimes);
            Notifier.send(ListenID.Func_Open, args);      
            this.itemUpdate();      
        } else {
            //刷新奖励信息，可以领取时领取奖励
            
        }
    }

    private itemUpdate(){
        let cost : IItem[] = [];
        let info: IItem;
        let data = Cfg.Star.get(this.chestTimes);
        let len = data.reward.length > 3 ? 3 : data.reward.length;
        for(let i = 0; i < len; i++){
            let rewardId = data.reward[i].id;
            if(rewardId === ItemDefine.Gold || rewardId === ItemDefine.Energy){
                info = { id : rewardId, change : data.reward[i].num };
                cost.push(info);
            }else{
                console.log("=======其他奖励！======");
            }
        }
        Notifier.send(ListenID.Item_UpdateList, cost);
    }

    private onAppPause(enable : boolean) {
        if (enable) {
            
        } else {
            this.checkCollection(false);            
        }
    }
    private checkCollection(update = false) {
        let ui = this._ui;
        let loadingTimes = Manager.storage.getNumber("_loadingTimes", 0);
        if (loadingTimes > 3) {
            ui.node_collection.active = false;
            return false;
        } else {
            if (update) {
                Manager.storage.setNumber("_loadingTimes", loadingTimes + 1);                
            } else {
                ui.node_collection.active = true;
            }
            return true;
        }
    }

    private onClickCollection() {
        this._ui.node_collection.active = false;
    }
    private onClickInvite(){
        this.checkDebug("i");

        let args = new MVCS.OpenArgs();
        args.SetId(FuncDefine.Invite);
        Notifier.send(ListenID.Func_Open, args);
    }

    private onClickGift(){
        this.checkDebug("l");

        let args = new MVCS.OpenArgs();
        args.SetId(FuncDefine.Sign);
        Notifier.send(ListenID.Func_Open, args);
    }

    private onClickMall(){
        this.checkDebug("s");

        let args = new MVCS.OpenArgs();
        args.SetId(FuncDefine.Shop);
        Notifier.send(ListenID.Func_Open, args);
    }

    private onClickRank(){
        this.checkDebug("m");

        let args = new MVCS.OpenArgs();
        args.SetId(FuncDefine.Rank);
        Notifier.send(ListenID.Func_Open, args);
    }

    private onClickSetting(){
        let args = new MVCS.OpenArgs();
        args.SetId(FuncDefine.Setting);
        Notifier.send(ListenID.Func_Open, args);
    }

    private initSkin() {

    }

    private onSkinChanged(id : number) {

    }
}

