import { Manager } from "./Manager";

declare interface AtlasMap {
    [key: string]: cc.SpriteAtlas;
}

export class SpriteAtlasManager {
    public constructor() {

    }

    private _spriteatlas: AtlasMap = {};
    public getWeaponIcon(id: string | number): Promise<cc.SpriteFrame> {
        let this1 = this;
        return new Promise((resolve, reject) => {
            let spriteAtlas = this1._spriteatlas["weaponIcon"];
            if (spriteAtlas == null) {
                Manager.loader.LoadAssetAsync("weaponIcon", "icon/weaponIcon", cc.SpriteAtlas, (name: string, resource: cc.SpriteAtlas, asset: string) => {
                    this1._spriteatlas["weaponIcon"] = resource;
                    resolve(resource.getSpriteFrame("weapon" + id));
                }, this1, "");
            } else {
                resolve(spriteAtlas.getSpriteFrame("weapon" + id));
            }
        });
    }
    public getToolIcon(id: string | number): Promise<cc.SpriteFrame> {
        let this1 = this;
        return new Promise((resolve, reject) => {
            let spriteAtlas = this1._spriteatlas["toolIcon"];
            if (spriteAtlas == null) {
                Manager.loader.LoadAssetAsync("toolIcon", "icon/toolIcon", cc.SpriteAtlas, (name: string, resource: cc.SpriteAtlas, asset: string) => {
                    this1._spriteatlas["toolIcon"] = resource;
                    resolve(resource.getSpriteFrame("drop" + id));
                }, this1, "");
            } else {
                resolve(spriteAtlas.getSpriteFrame("drop" + id));
            }
        });
    }

    public getToolNameSprite(id:string|number):Promise<cc.SpriteFrame>{
        let this1 = this;
        return new Promise((resolve, reject) => {
            let spriteAtlas = this1._spriteatlas["toolIcon"];
            if (spriteAtlas == null) {
                Manager.loader.LoadAssetAsync("toolIcon", "icon/toolIcon", cc.SpriteAtlas, (name: string, resource: cc.SpriteAtlas, asset: string) => {
                    this1._spriteatlas["toolIcon"] = resource;
                    resolve(resource.getSpriteFrame("dname" + id));
                }, this1, "");
            } else {
                resolve(spriteAtlas.getSpriteFrame("dname" + id));
            }
        });
    }

    public getDiamondIcon(id: string): Promise<cc.SpriteFrame> {
        let this1 = this;
        return new Promise((resolve, reject) => {
            let spriteAtlas = this1._spriteatlas["getDiamond"];
            if (spriteAtlas == null) {
                Manager.loader.LoadAssetAsync("getDiamond", "getDiamond/diamond", cc.SpriteAtlas, (name: string, resource: cc.SpriteAtlas, asset: string) => {
                    this1._spriteatlas["getDiamond"] = resource;
                    resolve(resource.getSpriteFrame(id))
                }, this1, "");
            } else {
                resolve(spriteAtlas.getSpriteFrame(id));
            }
        });
    }

    public getMonsterBuffIcon(id: string): Promise<cc.SpriteFrame> {
        let this1 = this;
        return new Promise((resolve, reject) => {
            let spriteAtlas = this1._spriteatlas["monList"];
            if (spriteAtlas == null) {
                Manager.loader.LoadAssetAsync("monList", "actor/monList", cc.SpriteAtlas, (name: string, resource: cc.SpriteAtlas, asset: string) => {
                    this1._spriteatlas["monList"] = resource;
                    resolve(resource.getSpriteFrame(id))
                }, this1, "");
            } else {
                resolve(spriteAtlas.getSpriteFrame(id));
            }
        });
    }

    public getSpecialProIcon(id: string): Promise<cc.SpriteFrame> {
        let this1 = this;
        return new Promise((resolve, reject) => {
            let spriteAtlas = this1._spriteatlas["mainPlayer"];
            if (spriteAtlas == null) {
                Manager.loader.LoadAssetAsync("mainPlayer", "ui/menu/mainPlayer", cc.SpriteAtlas, (name: string, resource: cc.SpriteAtlas, asset: string) => {
                    this1._spriteatlas["mainPlayer"] = resource;
                    resolve(resource.getSpriteFrame(id))
                }, this1, "");
            } else {
                resolve(spriteAtlas.getSpriteFrame(id));
            }
        });
    }

    public getResIcon(id: string): Promise<cc.SpriteFrame> {
        let this1 = this;
        return new Promise((resolve, reject) => {
            let spriteAtlas = this1._spriteatlas["resIcon"];
            if (spriteAtlas == null) {
                Manager.loader.LoadAssetAsync("resIcon", "icon/resIcon", cc.SpriteAtlas, (name: string, resource: cc.SpriteAtlas, asset: string) => {
                    this1._spriteatlas["resIcon"] = resource;
                    resolve(resource.getSpriteFrame(id));
                }, this1, "");
            } else {
                resolve(spriteAtlas.getSpriteFrame(id));
            }
        });
    }
}
