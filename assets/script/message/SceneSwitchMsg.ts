export class SceneSwitchMsg {
    private _id : number;
    public get id() {
        return this._id;
    }

    public setId(id : number) {
        this._id = id;
        return this;
    }

    private _retry : boolean;
    public get retry() {
        return this._retry;
    }

    public setRetry(enable : boolean) {
        this._retry = enable;
        return this;
    }

    private _back : boolean;
    public get back() {
        return this._back;
    }

    public setBack(enable : boolean) {
        this._back = enable;
        return this;
    }
}