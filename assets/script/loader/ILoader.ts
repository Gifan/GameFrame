export interface ILoader {
    asset : object;
    isAlive : boolean;
    progress : number;

    Init(assetName : string, assetPath : string, assetType : typeof cc.Asset) : void;
    //Load() : object;
    LoadAsync() : void;
    IsDone() : boolean;
    UnLoad() : void;

    SetProgressCallback(callback:(path : string, progress : number) => void, target : any);
}