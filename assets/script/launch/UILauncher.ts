import { UIManager } from "../framework/UIManager";
import { MVC } from "../framework/MVC";
import { Manager } from "../manager/Manager";

export class UILanuncher {
    public constructor() {
        UIManager.Init();
        //资源加载先临时写一个
        MVC.ViewHandler.initAssetHandler(
            Manager.loader.LoadAssetAsync.bind(Manager.loader),
            Manager.loader.UnLoadAsset.bind(Manager.loader)
        );
        MVC.ComponentHandler.initAssetHandler(
            Manager.loader.LoadAssetAsync.bind(Manager.loader),
            Manager.loader.UnLoadAsset.bind(Manager.loader)
        )
    }
}