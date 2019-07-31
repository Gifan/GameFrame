import { LoaderAdapter } from "../adpapter/LoaderAdapter";
import { AudioManager } from "./AudioManager";
import { StorageManager } from "./StorageManager";
import { AnimateManager } from "./AnimateManager";
import { SpriteAtlasManager } from "./SpriteAtlasManager";

class _Manager {
    private _loader: LoaderAdapter;
    public get loader(): LoaderAdapter {
        if (this._loader == null) {
            this._loader = new LoaderAdapter();
        }
        return this._loader;
    }

    private _audio: AudioManager;
    public get audio(): AudioManager {
        if (this._audio == null) {
            this._audio = new AudioManager();
        }
        return this._audio;
    }

    private _animation: AnimateManager;
    public get anim(): AnimateManager {
        if (this._animation == null) {
            this._animation = new AnimateManager();
        }
        return this._animation;
    }

    private _storage: StorageManager;
    public get storage(): StorageManager {
        if (this._storage == null) {
            this._storage = new StorageManager();
        }
        return this._storage;
    }

    // private _physics: PhysicsManager;
    // public get physicsManager(): PhysicsManager {
    //     if (this._physics == null) {
    //         this._physics = new PhysicsManager();
    //     }
    //     return this._physics;
    // }

    // private _log: LogManager;
    // public get logManager(): LogManager {
    //     if (this._log == null) {
    //         this._log = new LogManager();
    //     }
    //     return this._log;
    // }

    private _spatlas: SpriteAtlasManager;
    public get spAtlas(): SpriteAtlasManager {
        if (this._spatlas == null) {
            this._spatlas = new SpriteAtlasManager();
        }
        return this._spatlas;
    }
}

export const Manager = new _Manager();