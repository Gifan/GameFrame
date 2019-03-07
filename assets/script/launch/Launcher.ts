import { Cfg } from "../config/Cfg";
import { Time } from "../../frame/Time";
import { Manager } from "../manager/Manager";
import { NetLauncher } from "./NetLauncher";
import { ModuleLauncher } from "./ModuleLauncher";
import { UILauncher } from "./UILauncher";
import { SDKLauncher } from "./SDKLauncher";
import { AppLauncher } from "./AppLauncher";
import { SubpackageLauncher } from "./SubpackageLauncher";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Launcher extends cc.Component {

    @property
    language: string = 'zh_CN';

    onLoad () {
        cc.log("Launcher.onLoad");

        cc.game.addPersistRootNode(this.node);
        //Cfg.initLanguage(this.language);

        new AppLauncher();
    }

    async start () {
        cc.log("Launcher.start");

        //必须等待初始化配置表完成后才能处理其他依赖
        //await Cfg.initByMergeJson();
        await Cfg.initBySingleJson();
        //cc.error("Cfg await over");

        let sub = new SubpackageLauncher();
        await sub.initRequired();
        sub.initOptional();

        new UILauncher();
        //先启动网络
        new NetLauncher();
        //在启动模块
        new ModuleLauncher();
        //启动SDK
        new SDKLauncher();
        
        //Notifier.send(NotifyID.App_Start);
    }

    update (dt : number) {
        Time.update(dt);
        Manager.loader.Update(dt);
    }

    onFocus() {

    }
}
