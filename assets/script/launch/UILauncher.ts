
import { Manager } from "../manager/Manager";
import { UIManager } from "../frame/UIManager";
import { MVCS } from "../frame/MVCS";

export class UILanuncher {
    public constructor() {
        UIManager.Init();
        //资源加载先临时写一个
        MVCS.ViewHandler.initAssetHandler(
            Manager.loader.LoadAssetAsync.bind(Manager.loader),
            Manager.loader.UnLoadAsset.bind(Manager.loader)
        );
        MVCS.ComponentHandler.initAssetHandler(
            Manager.loader.LoadAssetAsync.bind(Manager.loader),
            Manager.loader.UnLoadAsset.bind(Manager.loader)
        )
    }
}