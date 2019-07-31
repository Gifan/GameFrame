import { Manager } from "./Manager";

class ClipAsset {
    public id: string;
    public clip: cc.AnimationClip;
    public constructor(id: string) {
        this.id = id;
    }
}

declare interface ClipAssetMap {
    [key: string]: ClipAsset;
}

export class AnimateManager {
    public constructor() {

    }

    private _clips: ClipAssetMap = {};

    /**
     * 获取开枪枪口动画clip
     * @param id 
     */
    public getFireAnimationClip(id: string): Promise<cc.AnimationClip> {
        let this1 = this;
        return new Promise((resolve, reject) => {
            let clip = this1._clips[id];
            if (clip == null) {
                this1._clips[id] = new ClipAsset(id);
                Manager.loader.LoadAssetAsync(id, "fireEffect/" + id, cc.AnimationClip, (name: string, resource: cc.AnimationClip, asset: string) => {
                    this1._clips[name].clip = resource;
                    resolve(this1._clips[name].clip);
                }, this1, id);
            } else {
                resolve(clip.clip);
            }
        });
    }

    /**
     * 获取受击效果
     * @param id 
     */
    public getHitAnimationClip(id: string): Promise<cc.AnimationClip> {
        let this1 = this;
        return new Promise((resolve, reject) => {
            let clip = this1._clips[id];
            if (clip == null) {
                clip = new ClipAsset(id);
                this1._clips[id] = clip;
                Manager.loader.LoadAssetAsync(id, "hitEffect/" + id, cc.AnimationClip, (name: string, resource: cc.AnimationClip, asset: string) => {
                    this1._clips[name].clip = resource;
                    resolve(this1._clips[name].clip);
                }, this1, "");
            } else {
                resolve(clip.clip);
            }
        });
    }

    public getBoomAnimationClip(id: string): Promise<cc.AnimationClip> {
        let this1 = this;
        return new Promise((resolve, reject) => {
            let clip = this1._clips[id];
            if (clip == null) {
                clip = new ClipAsset(id);
                this1._clips[id] = clip;
                Manager.loader.LoadAssetAsync(id, "boomEffect/" + id, cc.AnimationClip, (name: string, resource: cc.AnimationClip, asset: string) => {
                    this1._clips[name].clip = resource;
                    resolve(this1._clips[name].clip);
                }, this1, "");
            } else {
                resolve(clip.clip);
            }
        });
    }
}
