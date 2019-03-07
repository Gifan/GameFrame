import { AlbumCfgReader } from "./AlbumCfg";
import { BadgeCfgReader } from "./BadgeCfg";
import { FuncCfgReader } from "./FuncCfg";
import { FxCfgReader } from "./FxCfg";
import { InviteCfgReader } from "./InviteCfg";
import { ItemCfgReader } from "./ItemCfg";
import { ModelCfgReader } from "./ModelCfg";
import { SceneCfgReader } from "./SceneCfg";
import { ShopCfgReader } from "./ShopCfg";
import { SignCfgReader } from "./SignCfg";
import { SkinCfgReader } from "./SkinCfg";
import { SoundCfgReader } from "./SoundCfg";
import { StarCfgReader } from "./StarCfg";


class _Cfg {
    
    private _Album = new AlbumCfgReader();
    public get Album() : AlbumCfgReader {
        return this._Album;
    }
    private _Badge = new BadgeCfgReader();
    public get Badge() : BadgeCfgReader {
        return this._Badge;
    }
    private _Func = new FuncCfgReader();
    public get Func() : FuncCfgReader {
        return this._Func;
    }
    private _Fx = new FxCfgReader();
    public get Fx() : FxCfgReader {
        return this._Fx;
    }
    private _Invite = new InviteCfgReader();
    public get Invite() : InviteCfgReader {
        return this._Invite;
    }
    private _Item = new ItemCfgReader();
    public get Item() : ItemCfgReader {
        return this._Item;
    }
    private _Model = new ModelCfgReader();
    public get Model() : ModelCfgReader {
        return this._Model;
    }
    private _Scene = new SceneCfgReader();
    public get Scene() : SceneCfgReader {
        return this._Scene;
    }
    private _Shop = new ShopCfgReader();
    public get Shop() : ShopCfgReader {
        return this._Shop;
    }
    private _Sign = new SignCfgReader();
    public get Sign() : SignCfgReader {
        return this._Sign;
    }
    private _Skin = new SkinCfgReader();
    public get Skin() : SkinCfgReader {
        return this._Skin;
    }
    private _Sound = new SoundCfgReader();
    public get Sound() : SoundCfgReader {
        return this._Sound;
    }
    private _Star = new StarCfgReader();
    public get Star() : StarCfgReader {
        return this._Star;
    }

    async initByMergeJson() {
        //cc.log("Cfg.initByMergeJson start:" + new Date().getTime());
        return new Promise((resolve, reject)=>{
            cc.loader.loadRes("config/GameJsonCfg", cc.JsonAsset, function (error: Error, resource: cc.JsonAsset) {
                if (error) {
                    cc.error("Cfg.initByMergeJson error", error);
                    reject();
                    return;
                }
                const json = resource.json;
                for (const key in json) {
                    if (!this.hasOwnProperty("_" + key)) {
                        cc.warn("Cfg.initByMergeJson null, " + key);
                        continue;
                    }
                    //cc.log("Cfg.initByMergeJson " + key);

                    let reader = this["_" + key];
                    reader.initByMap(json[key]);
                }
                resolve();

                //cc.log("Cfg.initByMergeJson finish:" + new Date().getTime());
            }.bind(this));
        });
    }

    async initBySingleJson() {
        //cc.log("Cfg.initBySingleJson start:" + new Date().getTime());
        return new Promise((resolve, reject)=>{
            cc.loader.loadResDir("config", function (error: Error, resources: cc.JsonAsset[], urls: string[]) {
                if (error) {
                    cc.error("Cfg.initBySingleJson error", error);
                    reject();
                    return;
                }
                for (let index = 0; index < resources.length; index++) {
                    const element = resources[index];
                    const key = element.name;
                    if (!this.hasOwnProperty("_" + key)) {
                        cc.warn("Cfg.initBySingleJson null, " + key);
                        continue;
                    }
                    //cc.log("Cfg.initBySingleJson " + key);

                    let reader = this["_" + key];
                    reader.initByMap(element.json);
                }
                resolve();

                //cc.log("Cfg.initBySingleJson finish:" + new Date().getTime());
            }.bind(this));
        });
    }

    public HasTag(t : any, tag : number) : boolean {
        if (t.tags == null) {
            return false;
        }
        return t.tags.indexOf(tag) >= 0;
    }

    public selectArray<T>(cfg, field : string, index : number, defaultVal : T) : T {
        const array = cfg[field];
        if (array == null) {
            return defaultVal;
        }
        const val = array[index] as T;
        return val || defaultVal;
    }
    
}

export const Cfg = new _Cfg();