import { ILoader } from "./ILoader";
import { Time } from "../../frame/Time";
import { Notifier } from "../../frame/mvcs/Notifier";
import { NotifyID } from "../../frame/mvcs/NotifyID";

declare interface RefMap {
    [key: string]: number;
}

export class AssetLoader implements ILoader {
    private static _refMap : RefMap = {};
    private static addRef(path : string, uuids : string[]) {
        //cc.error("addRef", path, uuids);
        for (let index = 0; index < uuids.length; index++) {
            const uuid = uuids[index];
            let times = AssetLoader._refMap[uuid];
            if (times == null) {
                AssetLoader._refMap[uuid] = 1;
            } else {                
                AssetLoader._refMap[uuid] = times + 1;
            }
        }
    }

    private static delRef(path : string, uuids : string[]) {
        //cc.error("delRef", path, uuids);
        let delUuids = [];
        for (let index = 0; index < uuids.length; index++) {
            const uuid = uuids[index];
            let times = AssetLoader._refMap[uuid];
            if (times == null) {
                cc.error("delRef times null, uuid:" + uuid);
                continue;
            }

            if (times > 1) {
                AssetLoader._refMap[uuid] = times - 1;                
            } else {
                //TODO 释放后，切换场景再加载会加载失败，暂时不释放了，反正资源也不多
                delete AssetLoader._refMap[uuid];
                delUuids.push(uuid);
            }
        }
        if (delUuids.length > 0) {
            cc.loader.release(delUuids);            
        }
    }

    protected _asset:object;
    public get asset() : object {
        return this._asset;
    }

    public get isAlive() : boolean {
        return true;
    }

    protected _isLoaded : boolean;
    public IsDone() : boolean {
        return this._isLoaded;            
    }

    protected m_progress : number = 0;
    public get progress() : number {
        if (this._isLoaded) {
            return 1;
        }
        return this.m_progress;
    }

    protected m_assetPath:string;
    protected m_assetName:string;
    protected m_assetType:typeof cc.Asset;
    public Init(assetName:string, assetPath:string, assetType:typeof cc.Asset) : void {
        if (isNullOrEmpty(assetPath)) {
            cc.error("AssetLoader.Init path null! type:" + assetType );
            return;
        }

        if (this.m_assetPath != null) {
            cc.error("AssetLoader.Init mult times! path old:" + this.m_assetPath + "\nnew:" + assetPath);
            return;
        }
        this.m_assetPath = assetPath;
        this.m_assetName = assetName;
        this.m_assetType = assetType;
    }

    //最大失败重试次数
    private _maxFailTimes = 5;

    public LoadAsync() : void {
        if (this._isLoaded) {
            return; 
        }
        if (this.m_progress > 0) {
            return ;
        }

        this.m_progress = 0.01;
        cc.loader.loadRes(this.m_assetPath, this.m_assetType, 
            (completedCount: number, totalCount: number, item: any) : void => {
                if (this.m_progress < 0) {
                    return ;
                }
                this.m_progress = completedCount / totalCount;
                if (this._progressCallback != null) {
                    this._progressCallback.call(this._progressTarget, this.m_assetPath, this.m_progress);
                    if (completedCount >= totalCount) {
                        this._progressCallback = null;
                        this._progressTarget = null;
                    }
                }
            }, 
            (error: Error, resource: any) : void => {
                if (error) {
                    cc.error("AssetLoader.LoadAsync error:", this.m_assetPath, error);
                    //加载失败后重新加载
                    this.m_progress = 0;
                    if (this._maxFailTimes > 0) {
                        --this._maxFailTimes;
                        Time.delay(0.1 * (5 - this._maxFailTimes), this.LoadAsync, null, this);
                    } else {
                        Notifier.send(NotifyID.DownLoad_Fail, this.m_assetPath)
                    }
                    return;
                }
        
                //取消加载
                if (this.m_progress < 0) {
                    if (this.m_assetType != cc.JsonAsset) {
                        // let depends = cc.loader.getDependsRecursively(this.m_assetPath);
                        // AssetLoader.delRef(depends);                   
                    } else {
                        cc.loader.release(this.m_assetPath);  
                    }
                    cc.warn("AssetLoader.LoadAsync cancel:", this.m_assetPath, this.m_assetType);
                    return;
                }

                if (this._progressCallback != null) {
                    this._progressCallback.call(this._progressTarget, this.m_assetPath, 1);
                    this._progressCallback = null;
                    this._progressTarget = null;                    
                }
        
                this._isLoaded = true;
                this._asset = resource;
                let depends = cc.loader.getDependsRecursively(this.m_assetPath);
                AssetLoader.addRef(this.m_assetPath, depends);
            }
        );
    }

    public UnLoad() : void {
        // this.m_progress = -1;
        // if (!this._isLoaded) {           
        //     cc.error("AssetLoader.UnLoad not load! path:" + this.m_assetPath + " name:" + this.m_assetName);
        //     return;
        // }
        // this._isLoaded = false;
        // this._asset = null;
        // let depends = cc.loader.getDependsRecursively(this.m_assetPath);
        // cc.loader.releaseRes(this.m_assetPath, this.m_assetType);  
        // AssetLoader.delRef(this.m_assetPath, depends);
    }

    private _progressCallback : (name : string, progress : number) => void;
    private _progressTarget : any;
    public SetProgressCallback(callback:(name : string, progress : number) => void, target : any) {
        if (this._isLoaded) {
            callback.call(target, this.m_assetPath, 1);
            return;
        }

        this._progressCallback = callback;
        this._progressTarget = target;
    }
}