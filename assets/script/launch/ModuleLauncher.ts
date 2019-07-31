import { LoginController } from "../module/login/LoginController";

//模块启动器
export class ModuleLauncher {
    public constructor() {
        new LoginController();
    }
}