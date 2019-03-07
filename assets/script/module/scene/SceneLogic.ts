
import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { Time } from "../../../frame/Time";
import { UIManager } from "../../../frame/UIManager"
import { ListenID } from "../../ListenID";
import { CallID } from "../../CallID";
import { SceneModel } from "./SceneModel"
import { SceneVo } from "./SceneVo"
import { SceneSwitchMsg } from "../../message/SceneSwitchMsg";
import { Cfg } from "../../config/Cfg";
import { Manager } from "../../manager/Manager";
import { SceneDefine } from "../../config/SceneCfg";
import { FuncDefine } from "../../config/FuncCfg";

/// <summary>
/// 场景逻辑
/// </summary>
export class SceneLogic extends MVCS.MLogic<SceneModel> {

    public constructor() {
        super("Scene");

        this.setup(new SceneModel(), null);
        this.changeListener(true);
    }

    protected changeListener(enable : boolean) : void {
        Notifier.changeListener(enable, ListenID.Scene_AskSwitch, this.onAskSwitch, this);
        Notifier.changeListener(enable, ListenID.Scene_Switch, this.onSwitch, this);
        Notifier.changeListener(enable, ListenID.Scene_SwitchFinish, this.onSwitchFinish, this);
        Notifier.changeListener(enable, ListenID.Scene_BackToCity, this.onBackToCity, this);
        Notifier.changeListener(enable, ListenID.Scene_PlayAgain, this.onPlayAgain, this);

        Notifier.changeCall(enable, CallID.Scene_GetCurId, this.getCurId, this);
        Notifier.changeCall(enable, CallID.Scene_GetPrevId, this.getPrevId, this);
        Notifier.changeCall(enable, CallID.Scene_IsEnter, this.isEnter, this);
    }

    private getCurId() : number {
        if (this._model.vo == null) {
            return 0;
        }
        return this._model.vo.id;
    }

    private getPrevId() : number {
        return this._model.prevId;
    }

    private isEnter() : boolean {
        if (this._model.vo == null) {
            return false;
        }
        return this._model.vo.isEnter;
    }

    private onAskSwitch(msg : SceneSwitchMsg) {
        //cc.error("onAskSwitch", msg.id);
        //判断是否可以切换场景       

        //部分关卡可能切换主角，所以需要在返回切换场景时带上主角信息
        //let cfg = Cfg.Scene.get(msg.id);
        if (msg.id != SceneDefine.Main && !msg.retry) {
            //不等待服务器返回，如果条件不足，最后不发奖励即可
            Notifier.send(ListenID.Stage_Start, msg.id);           
        }
        Notifier.send(ListenID.Scene_Switch, msg);
    }

    private onSwitch(msg : SceneSwitchMsg) {
        //cc.error("onSwitch", msg.id);

        let cfg = Cfg.Scene.get(msg.id);
        let mod = require(cfg.vo);
        if (mod == null) {
            cc.error(this.getType(), ".OnSwitch Can't Find Class, sceneVo:" + cfg.vo,);
            return;
        }

        let lastScene = this._model.vo;
        if (lastScene != null) {
            lastScene.Exit();
        }

        Notifier.send(ListenID.Scene_Loading, msg);

        // Battle.forEachActors(function(actor : Actor) {
        //     Battle.delActor(actor.id);
        //     Manager.actor.push(actor);
        //     //cc.warn("SceneVo.Exit", actor.id);
        // }, this);
        // Battle.reset();

        let modClass = mod[cfg.vo];
        let scene = new modClass(msg.id) as SceneVo;
        this._model.setScene(scene);
        if (msg.back) {
            scene.setIsBack();
        }

        //打开场景切换UI
        UIManager.Open(FuncDefine.SceneLoading);
        UIManager.CloseQueues();

        //Manager.fx.DespawnAll();

        Manager.loader.LoadSceneAsync(cfg.path, this.onSceneLoaded, this);
    }

    private onSceneLoaded() {
        let scene = this._model.vo;
        scene.Enter();

        let cameraNode = cc.find("Canvas/Main Camera");
        if (cameraNode != null) {
            cameraNode.width = 1334;
            cameraNode.height = 750;
            let camera = cameraNode.getComponent(cc.Camera);
            //屏蔽ui层
            camera.cullingMask = ~(1 << 5);
        }

        let msg = new SceneSwitchMsg();
        msg.setId(this._model.vo.id);
        Notifier.send(ListenID.Scene_Loaded, msg);

        //根据需求判断是否需要加载主角
        // if (scene.needRole) {
        //     //cc.error("SceneLogic.onSceneLoaded");
        //     let curSkinId = Notifier.call(ModuleID.Skin_GetCurId);
        //     let skinCfg = Cfg.Skin.get(curSkinId);
        //     let sceneCfg = Cfg.Scene.get(scene.id);
        //     let skillOffset = 0;
        //     if (sceneCfg.difficulty > 1) {
        //         skillOffset = 50;
        //     }
        //     let role = Manager.actor.Create(Battle.popId(), eNatura.Good, eActor.Role, skinCfg.actorId, cc.Vec2.ZERO, null, skillOffset);
        //     for (let index = 0; index < sceneCfg.roleBuffs.length; index++) {
        //         const buffId = sceneCfg.roleBuffs[index];
        //         role.buffable.add(buffId, role, Time.time);
        //     }
        //     Manager.actor.ReqSpawnActor(role, this.onRoleLoaded.bind(this));
        // } else {
            Notifier.send(ListenID.Scene_SwitchFinish, msg);
            //cc.log("SceneLogic.onSceneLoaded ", scene);
        // }
    }

    // private onRoleLoaded(role : Actor) {
    //     Notifier.send(ModuleID.Scene_RoleLoaded, role);

    //     //cc.error("SceneLogic.onRoleLoaded");
    //     let scene = this._model.vo;
    //     scene.Start(role);

    //     //加载完主角后回调OnSwitchFinish
    //     let msg = new SceneSwitchMsg();
    //     msg.setId(this._model.vo.id);
    //     Notifier.send(ModuleID.Scene_SwitchFinish, msg);
    // }

    private onSwitchFinish(msg : SceneSwitchMsg) {
        //关闭切换场景UI
        //UIManager.Close(FuncDefine.SceneLoading);
        //cc.log("关闭切换场景UI");
    }

    private onBackToCity() {
        let id = SceneDefine.Main;
        let msg = new SceneSwitchMsg();
        msg.setId(id);
        msg.setBack(true);
        Notifier.send(ListenID.Scene_AskSwitch, msg);
    }

    private onPlayAgain(retry : boolean) {
        let id = this._model.vo.id;
        let msg = new SceneSwitchMsg();
        msg.setId(id);
        msg.setRetry(retry);
        Notifier.send(ListenID.Scene_AskSwitch, msg);
    }

}
