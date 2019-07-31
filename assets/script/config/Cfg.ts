import { BarrierCfgReader } from "./BarrierCfg";
import { BossCfgReader } from "./BossCfg";
import { BulletCfgReader } from "./BulletCfg";
import { DialCfgReader } from "./DialCfg";
import { DropCfgReader } from "./DropCfg";
import { GuideCfgReader } from "./GuideCfg";
import { InviteCfgReader } from "./InviteCfg";
import { MonsterCfgReader } from "./MonsterCfg";
import { NoticeCfgReader } from "./NoticeCfg";
import { SignCfgReader } from "./SignCfg";
import { SoundCfgReader } from "./SoundCfg";
import { StrikeCfgReader } from "./StrikeCfg";
import { SurpriseCfgReader } from "./SurpriseCfg";
import { TipsCfgReader } from "./TipsCfg";
import { TreasurefixCfgReader } from "./TreasurefixCfg";
import { TreasureCfgReader } from "./TreasureCfg";
import { WeaponCfgReader } from "./WeaponCfg";


import { Const } from "./Const";

class _Cfg {
    
    private _Barrier = new BarrierCfgReader();
    public get Barrier() : BarrierCfgReader {
        return this._Barrier;
    }
    private _Boss = new BossCfgReader();
    public get Boss() : BossCfgReader {
        return this._Boss;
    }
    private _Bullet = new BulletCfgReader();
    public get Bullet() : BulletCfgReader {
        return this._Bullet;
    }
    private _Dial = new DialCfgReader();
    public get Dial() : DialCfgReader {
        return this._Dial;
    }
    private _Drop = new DropCfgReader();
    public get Drop() : DropCfgReader {
        return this._Drop;
    }
    private _Guide = new GuideCfgReader();
    public get Guide() : GuideCfgReader {
        return this._Guide;
    }
    private _Invite = new InviteCfgReader();
    public get Invite() : InviteCfgReader {
        return this._Invite;
    }
    private _Monster = new MonsterCfgReader();
    public get Monster() : MonsterCfgReader {
        return this._Monster;
    }
    private _Notice = new NoticeCfgReader();
    public get Notice() : NoticeCfgReader {
        return this._Notice;
    }
    private _Sign = new SignCfgReader();
    public get Sign() : SignCfgReader {
        return this._Sign;
    }
    private _Sound = new SoundCfgReader();
    public get Sound() : SoundCfgReader {
        return this._Sound;
    }
    private _Strike = new StrikeCfgReader();
    public get Strike() : StrikeCfgReader {
        return this._Strike;
    }
    private _Surprise = new SurpriseCfgReader();
    public get Surprise() : SurpriseCfgReader {
        return this._Surprise;
    }
    private _Tips = new TipsCfgReader();
    public get Tips() : TipsCfgReader {
        return this._Tips;
    }
    private _Treasurefix = new TreasurefixCfgReader();
    public get Treasurefix() : TreasurefixCfgReader {
        return this._Treasurefix;
    }
    private _Treasure = new TreasureCfgReader();
    public get Treasure() : TreasureCfgReader {
        return this._Treasure;
    }
    private _Weapon = new WeaponCfgReader();
    public get Weapon() : WeaponCfgReader {
        return this._Weapon;
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

    private static cfgLoadNum: number = 0;
    async initRemoteJson(filename: string, test?: cc.Label, pro?: cc.ProgressBar) {
        let this1 = this;
        return new Promise((resolve, reject) => {
            cc.loader.load(Const.JsonRemoteUrl + filename + ".json", function (err, obj) {
                if (err) {
                    cc.loader.loadRes("config/" + filename, cc.JsonAsset, function (err, obj2) {
                        if (err) {
                            reject("err");
                        }
                        const key = obj2.name;
                        if (!this1.hasOwnProperty("_" + key)) {
                            cc.warn("Cfg.initRemoteJson null, " + key);
                            reject("err");
                        }

                        let reader = this1["_" + key];
                        reader.initByMap(obj2.json);
                        _Cfg.cfgLoadNum += 1;
                        if (test) test.string = `${_Cfg.cfgLoadNum > 10 ? 10 : _Cfg.cfgLoadNum}%`;
                        if(pro) pro.progress = (_Cfg.cfgLoadNum > 10 ? 10:_Cfg.cfgLoadNum) / 100;
                        resolve();

                    })
                } else {
                    if (!this1.hasOwnProperty("_" + filename)) {
                        cc.warn("Cfg.initRemoteJson null, " + filename);
                        reject("err");
                    }

                    let reader = this1["_" + filename];
                    reader.initByMap(obj);
                    resolve();
                    _Cfg.cfgLoadNum += 1;
                    if (test) test.string = `${_Cfg.cfgLoadNum > 10 ? 10 : _Cfg.cfgLoadNum}%`;
                    if(pro) pro.progress = (_Cfg.cfgLoadNum > 10 ? 10:_Cfg.cfgLoadNum) / 100;
                }
            });
        })
    }
    
    async initLocalJson(filename: string, test?: cc.Label, pro?: cc.ProgressBar) {
        let this1 = this;
        return new Promise((resolve, reject) => {
            cc.loader.loadRes("config/" + filename, cc.JsonAsset, function (err, obj2) {
                if (err) {
                    reject("err");
                }
                const key = obj2.name;
                if (!this1.hasOwnProperty("_" + key)) {
                    cc.warn("Cfg.initRemoteJson null, " + key);
                    reject("err");
                }

                let reader = this1["_" + key];
                reader.initByMap(obj2.json);
                _Cfg.cfgLoadNum += 1;
                if (test) test.string = `${_Cfg.cfgLoadNum > 10 ? 10 : _Cfg.cfgLoadNum}%`;
                if (pro) pro.progress = (_Cfg.cfgLoadNum > 10 ? 10 : _Cfg.cfgLoadNum) / 100;
                resolve();

            })
        })
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