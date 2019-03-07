import { LoaderAdapter } from "../adpapter/LoaderAdapter";
import { AudioManager } from "./AudioManager";
import { StorageManager } from "./StorageManager";
import { ItemPool } from "../pool/ItemPool";
import { CameraManager } from "./CameraManager";
import { FxPool } from "../pool/FxPool";

class _Manager {
    private _loader : LoaderAdapter;
    public get loader() : LoaderAdapter {
        if (this._loader == null) {
            this._loader = new LoaderAdapter();
        }
        return this._loader;
    }

    private _audio : AudioManager;
    public get audio() : AudioManager {
        if (this._audio == null) {
            this._audio = new AudioManager();
        }
        return this._audio;
    }

    private _storage : StorageManager;
    public get storage() : StorageManager {
        if (this._storage == null) {
            this._storage = new StorageManager();
        }
        return this._storage;
    }

    private _camera : CameraManager;
    public get camera() : CameraManager {
        if (this._camera == null) {
            this._camera = new CameraManager();
        }
        return this._camera;
    }

    private _fx : FxPool;
    public get fx() : FxPool {
        if (this._fx == null) {
            this._fx = new FxPool();
        }
        return this._fx;
    }

    private _item : ItemPool;
    public get item() : ItemPool {
        if (this._item == null) {
            this._item = new ItemPool();
        }
        return this._item;
    }
}

export const Manager = new _Manager();