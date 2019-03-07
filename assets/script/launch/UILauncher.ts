import { UIManager } from "../../frame/UIManager";
import { MVCS } from "../../frame/mvcs/MVCS";
import { Cfg } from "../config/Cfg";
import { Manager } from "../manager/Manager";
import { Cell } from "../../frame/extension/Cell";
import { AbsAssetPool } from "../pool/AbsAssetPool";

//UI启动器
export class UILauncher {
    public constructor() {
        UIManager.Init();        

        //资源加载先临时写一个
        MVCS.ViewHandler.initAssetHandler(
            Manager.loader.LoadAssetAsync.bind(Manager.loader), 
            Manager.loader.UnLoadAsset.bind(Manager.loader)
        );

        AbsAssetPool.s_loadAssetAsyncHandler = Manager.loader.LoadAssetAsync.bind(Manager.loader);
        AbsAssetPool.s_unloadAssetHandler = Manager.loader.UnLoadAsset.bind(Manager.loader);

        Cell.audioPlayHandler = Manager.audio.playAudio.bind(Manager.audio);

        Cfg.Func.forEach(cfg => {
            UIManager.RegisterViewType(cfg.id, cfg.view);
            //cc.log("RegisterViewType", cfg.id, cfg.view);
        })

        Manager.fx.InitPool();
    }
}