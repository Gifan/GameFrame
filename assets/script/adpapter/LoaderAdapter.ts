import { LoaderManager } from "../loader/LoaderManager";

declare interface RefMap {
    [key: string]: number;
}

type LoaderCallback = (name: string, asset: object, assetpath: string) => void;

export class LoaderAdapter {
    private _loader: LoaderManager = new LoaderManager();

    public LoadAssetAsync(name: string, path: string, type: typeof cc.Asset, callback: LoaderCallback, target: any, args: any = null): void {
        this._loader.LoadAssetAsync(name, path, type, path, callback, target, args);
    }

    public UnLoadAsset(key: string): void {
        this._loader.UnLoadAsset(key);
    }

    public Update(dt: number): void {
        this._loader.Update(dt);
    }

    private m_spriteRefs: RefMap = {};
    public LoadSpriteAsync(path: string, callback: LoaderCallback, target: any): void {
        let times = this.m_spriteRefs[path];
        if (times == null) {
            times = 0;
        }
        ++times;
        this.m_spriteRefs[path] = times;
        this.LoadAssetAsync(path, path, cc.SpriteFrame, callback, target);
    }

    public UnLoadSprite(path: string): void {
        let times = this.m_spriteRefs[path];
        if (times == null) {
            cc.error("UnLoadSprite Can't find in Refs:" + path);
            return;
        }
        --times;
        if (times > 0) {
            this.m_spriteRefs[path] = times;
        } else {
            delete this.m_spriteRefs[path];
            this.UnLoadAsset(path);
        }
        //cc.log("UnLoadSprite:" + path, "times:", times);
    }

    private _loadSceneTarget: any;
    private _loadSceneCallback: Function;
    public LoadSceneAsync(name: string, callback: Function, target: any): void {
        this._loadSceneTarget = target;
        this._loadSceneCallback = callback;
        this._loader.LoadSceneAsync(name, this.afterLoadScene.bind(this));
    }

    private afterLoadScene() {
        //cc.log("afterLoadScene");
        cc.sys.garbageCollect();
        this._loadSceneCallback.call(this._loadSceneTarget);
        this._loadSceneTarget = null;
        this._loadSceneCallback = null;
    }

    public SetProgressCallback(path: string, callback: (path: string, progress: number) => void, target: any) {
        this._loader.SetProgressCallback(path, callback, target);
    }
}