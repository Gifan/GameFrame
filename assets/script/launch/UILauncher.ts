
import { Manager } from "../manager/Manager";
import { UIManager } from "../frame/UIManager";
import { MVC } from "../frame/MVC";

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