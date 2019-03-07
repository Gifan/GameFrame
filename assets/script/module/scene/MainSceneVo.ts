import { SceneVo } from "./SceneVo";
import { UIManager } from "../../../frame/UIManager";
import { FuncDefine } from "../../config/FuncCfg";
import { Cfg } from "../../config/Cfg";
import { Manager } from "../../manager/Manager";
import { MVCS } from "../../../frame/mvcs/MVCS";

export class MainSceneVo extends SceneVo {
    public get needRole() {
        return false;
    }

    public async Enter() {
        super.Enter();
        UIManager.Open(FuncDefine.Main);           
        if (this.isBack) {
            let args = new MVCS.OpenArgs();
            args.SetId(FuncDefine.Stage);
            args.SetTab(1);
            UIManager.Open(FuncDefine.Stage, args); 
        } 
        
        let cfg = Cfg.Scene.get(this.id);
        if (cfg.music) {
            Manager.audio.playMusic(cfg.music, true, false);            
        }
    }

    public Exit() {
        UIManager.Close(FuncDefine.Main);
    }

}
