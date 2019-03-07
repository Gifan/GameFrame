import { SceneVo } from "./SceneVo";
import { UIManager } from "../../../frame/UIManager";
import { FuncDefine } from "../../config/FuncCfg";
import { Cfg } from "../../config/Cfg";
import { Manager } from "../../manager/Manager";

export class FightSceneVo extends SceneVo {
    public get needRole() {
        return false;
    }

    public async Enter() {
        super.Enter();
        UIManager.Open(FuncDefine.Fight);   

        let cfg = Cfg.Scene.get(this.id);
        Manager.audio.playMusic(cfg.music, true, false);
    }

    public Exit() {
        UIManager.Close(FuncDefine.Fight);
    }

}
