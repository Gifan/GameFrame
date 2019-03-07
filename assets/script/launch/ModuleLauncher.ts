//引入测试类，会自动初始化
import { TestModule } from "../test/TestModule";

import { AffirmLogic } from "../module/affirm/AffirmLogic";
import { BadgeLogic } from "../module/badge/BadgeLogic";
import { FlowTipsLogic } from "../module/flowtips/FlowTipsLogic";
import { FuncLogic } from "../module/func/FuncLogic";
import { SettingLogic } from "../module/setting/SettingLogic";
import { SceneLogic } from "../module/scene/SceneLogic";
import { StageLogic } from "../module/stage/StageLogic";
import { LoginLogic } from "../module/login/LoginLogic";
import { ItemLogic } from "../module/item/ItemLogic";

//模块启动器
export class ModuleLauncher {
    public constructor() {
        new AffirmLogic();
        new BadgeLogic();
        new FlowTipsLogic();
        new FuncLogic();
        new SettingLogic();
        new SceneLogic();
        new StageLogic();
        new LoginLogic();
        new ItemLogic();
    }
}