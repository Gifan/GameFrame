export class SceneVo {

    public constructor(id : number) {
        this._id = id;
    }

    private _id : number;
    public get id() : number { return this._id; }

    public get needRole() {
        return false;
    }

    private _isBack = false;
    public get isBack() {
        return this._isBack;
    }

    public setIsBack() {
        this._isBack = true;
    }

    private _isEnter = false;
    public get isEnter() {
        return this._isEnter;
    }

    public async Enter() {       
        this._isEnter = true;
    }

    // public Start(role : Actor) {       
        
    // }
    
    public Exit() {
        
    }
}
