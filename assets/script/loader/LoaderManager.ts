import { Session } from "./Session";
import { AssetLoader } from "./AssetLoader";

declare interface SessionMap {
    [key: string]: Session;
}

type LoaderCallback = (name: string, asset: object, assetpath: string) => void;

export class LoaderManager {
    /// <summary>
    /// key->Session
    /// key一般是资源路径
    /// 但是图集打包的sprite由于一个bundle有多个资源，所以需要资源路径+文件名拼接成key
    /// </summary>
    private _sessions: SessionMap = {};
    private _loadQueue: Session[] = [];

    public LoadAssetAsync(name: string, path: string, type: typeof cc.Asset, key: string, callback: LoaderCallback, target: any, arg: any): void {
        let session = this._sessions[key];
        if (session == null) {
            session = new Session();
            this._sessions[key] = session;
            session.name = name;
            session.path = path;
            session.type = type;
            session.loader = new AssetLoader();
            session.loader.Init(name, path, type);
            session.loader.LoadAsync();
        }
        if (callback != null) {
            if (session.callbacks == null) {
                session.callbacks = [];
            }
            session.callbacks.push(callback);
            if (session.targets == null) {
                session.targets = [];
            }
            session.targets.push(target);
            if (session.args == null) {
                session.args = [];
            }
            session.args.push(arg);
        }
        this._loadQueue.push(session);
    }

    public CancelLoad(key: string, callback: LoaderCallback, target: any): void {
        if (callback == null) {
            cc.error("CancelLoad callback null, key:" + key);
            return;
        }
        let session = this._sessions[key];
        if (session == null) {
            cc.error("CancelLoad can't find, key:" + key);
            return;
        }
        if (session.callbacks == null) {
            cc.error("CancelLoad callbacks null, key:" + key);
            return;
        }
        let result = false;
        for (let index = 0; index < session.callbacks.length; index++) {
            const tmpCallback = session.callbacks[index];
            const tmpTarget = session.targets[index];
            if (tmpCallback == callback && tmpTarget == target) {
                result = true;
                session.callbacks.splice(index, 1);
                session.targets.splice(index, 1);
                break;
            }
        }
        if (!result) {
            cc.warn("CancelLoad callback remove fail, key:" + key);
        }
    }

    public UnLoadAsset(key: string): void {
        let session = this._sessions[key];
        if (session == null) {
            cc.warn("LoaderManager.UnLoad can't find:" + key);
            return;
        }
        if (session.callbacks != null) {
            cc.warn("LoaderManager.UnLoad callbacks != null:" + key);
        }
        session.loader.UnLoad();
        delete this._sessions[key];
    }

    public Update(dt: number): void {
        for (let index = this._loadQueue.length - 1; index >= 0; index--) {
            const session = this._loadQueue[index];
            if (!session.loader.IsDone()) {
                continue;
            }
            let callbacks = session.callbacks;
            let targets = session.targets;
            let args = session.args;
            session.callbacks = null;
            session.targets = null;
            session.args = null;
            if (callbacks != null) {
                for (let i = 0; i < callbacks.length; i++) {
                    const callback = callbacks[i];
                    const target = targets[i];
                    const arg = args[i];
                    callback.call(target, session.name, session.loader.asset, session.path, arg)
                }
            }
            this._loadQueue.splice(index, 1);
        }
    }

    public LoadSceneAsync(name: string, onLaunched: Function): void {
        cc.director.loadScene(name, onLaunched);
    }

    public PreloadSceneAsync(name: string, onProgress: (completedCount: number, totalCount: number) => void, target: any): void {
        cc.director.preloadScene(name, (completedCount: number, totalCount: number, item: any) => {
            if (onProgress != null) {
                onProgress.call(target, completedCount, totalCount);
            }
        });
    }

    public SetProgressCallback(key: string, callback: (path: string, progress: number) => void, target: any) {
        let session = this._sessions[key];
        if (session == null) {
            cc.error("AddProgressCallback can't find:", key);
            return;
        }

        session.loader.SetProgressCallback(callback, target);
    }
}