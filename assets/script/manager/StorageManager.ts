//本地存储管理
export class StorageManager {
    public constructor() {
        
    }

    //清空存储，慎用
    public clear() {
        cc.sys.localStorage.clear();
    }

    public delete(key : string) {
        cc.sys.localStorage.removeItem(key);
    }

    public getBool(key : string, defaultValue = false) : boolean {
        let value = cc.sys.localStorage.getItem(key);
        if (isNullOrEmpty(value)) {
            return defaultValue;
        }

        //cc.log("getBool key:" + key, "value:" + value);
        return value != 0;
    }

    public setBool(key : string, value : boolean) {
        let val = value ? 1 : 0;
        cc.sys.localStorage.setItem(key, val);
    }

    public getNumber(key : string, defaultValue = 0) : number {
        let value = cc.sys.localStorage.getItem(key);
        if (isNullOrEmpty(value)) {
            //cc.warn("getNumber null key:" + key, "defaultValue:" + defaultValue);
            return defaultValue;
        }
        //cc.log("getNumber key:" + key, "value:", typeof(value), value);
        return value;
    }

    public setNumber(key : string, value : number) {
        cc.sys.localStorage.setItem(key, value);
    }

    public getString(key : string, defaultValue = "") : string {
        let value = cc.sys.localStorage.getItem(key);
        if (isNullOrEmpty(value)) {
            return defaultValue;
        }

        return value;
    }

    public setString(key : string, value : string) {
        //console.log("setString",key,value)
        cc.sys.localStorage.setItem(key, value);
    }

    public getObject<T>(key : string, defaultValue = null) : T {
        let value = cc.sys.localStorage.getItem(key);
        if (isNullOrEmpty(value)) {
            return defaultValue;
        }

        let t = JSON.parse(value) as T;
        if (t == null) {
            cc.error("StorageManager.getObject error", key, value);
        }
        return t;
    }

    public setObject(key : string, value : object) {
        if (value == null) {
            cc.error("StorageManager.setObject null", key);
            return;
        }
        let str = JSON.stringify(value);
        cc.sys.localStorage.setItem(key, str);
    }

    public getArray<T>(key : string, defaultValue = null) : T[] {
        let value = cc.sys.localStorage.getItem(key);
        if (isNullOrEmpty(value)) {
            return defaultValue;
        }

        let t = JSON.parse(value) as T[];
        if (t == null) {
            cc.error("StorageManager.getArray error", key, value);
        }
        return t;
    }

    public setArray(key : string, value : object) {
        if (value == null) {
            cc.error("StorageManager.setArray null", key);
            return;
        }
        let str = JSON.stringify(value);
        cc.sys.localStorage.setItem(key, str);
    }

    //当前登录角色的唯一标示
    private _personKey : string;
    public setPersonKey(key : string) {
        this._personKey = key;
    }

    public getPrivyBool(key : string, defaultValue = false) : boolean {
        if (this._personKey == null) {
            cc.error("getPrivyBool _personKey null")
            return defaultValue;
        }
        key = this._personKey + key;
        return this.getBool(key, defaultValue);
    }

    public setPrivyBool(key : string, value : boolean) {
        if (this._personKey == null) {
            cc.error("setPrivyBool _personKey null")
            return ;
        }
        key = this._personKey + key;
        this.setBool(key, value);
    }

    public getPrivyNumber(key : string, defaultValue = 0) : number {
        if (this._personKey == null) {
            cc.error("getPrivyNumber _personKey null")
            return defaultValue;
        }
        key = this._personKey + key;
        return this.getNumber(key, defaultValue);
    }

    public setPrivyNumber(key : string, value : number) {
        if (this._personKey == null) {
            cc.error("setPrivyNumber _personKey null")
            return ;
        }
        key = this._personKey + key;
        this.setNumber(key, value);
    }

    public getPrivyString(key : string, defaultValue = "") : string {
        if (this._personKey == null) {
            cc.error("getPrivyString _personKey null")
            return defaultValue;
        }
        key = this._personKey + key;
        return this.getString(key, defaultValue);
    }

    public setPrivyString(key : string, value : string) {
        if (this._personKey == null) {
            cc.error("setPrivyString _personKey null")
            return ;
        }
        key = this._personKey + key;
        this.setPrivyString(key, value);
    }

    public getPrivyObject<T>(key : string, defaultValue = null) : T {
        if (this._personKey == null) {
            cc.error("getPrivyObject _personKey null")
            return defaultValue;
        }
        key = this._personKey + key;
        return this.getObject<T>(key, defaultValue);
    }

    public setPrivyObject(key : string, value : object) {
        if (this._personKey == null) {
            cc.error("setPrivyObject _personKey null")
            return ;
        }
        key = this._personKey + key;
        this.setObject(key, value);
    }

    public getPrivyArray<T>(key : string, defaultValue = null) : T[] {
        if (this._personKey == null) {
            cc.error("getPrivyArray _personKey null")
            return defaultValue;
        }
        key = this._personKey + key;
        return this.getArray<T>(key, defaultValue);
    }

    public setPrivyArray(key : string, value : object) {
        if (this._personKey == null) {
            cc.error("setPrivyArray _personKey null")
            return ;
        }
        key = this._personKey + key;
        this.setArray(key, value);
    }
}