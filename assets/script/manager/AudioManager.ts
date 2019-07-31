import { Cfg } from "../config/Cfg";
import { Manager } from "./Manager";
import SettingModel from "../module/setting/SettingModel";
import { Notifier } from "../frame/Notifier";
import { NotifyID } from "../frame/NotifyID";

const wx = window["wx"];
class ClipAsset {
    public id: number;
    public clip: cc.AudioClip;
    public constructor(id: number) {
        this.id = id;
    }
}

declare interface ClipAssetMap {
    [key: number]: ClipAsset;
}

declare interface GunFireAudios {
    [key: number]: cc.AudioSource;
}

export enum AudioType {
    UI = 0,
    Gun = 1,
    Gun1 = 2,
    Gun2 = 3,
    Gun3 = 4,
    Gun4 = 5,
    Hit = 6,
    Hit1 = 7,
    Hit2 = 8,
    Hit3 = 9,
    Dead = 10,
    Tool = 11,
    Laser = 12,
    Music = 13,
    Max = Music,
}

export class AudioManager {
    public constructor() {
        const scene = cc.director.getScene();
        let node = new cc.Node('_AudioManager');
        let test = new cc.Node('_testManager');
        cc.game.addPersistRootNode(node);
        cc.game.addPersistRootNode(test);
        node.parent = scene;
        test.parent = scene;
        this._root = node;
        this._testroot = test;
        this._musicSource = node.addComponent(cc.AudioSource);
        this._musicSource.loop = true;
        for (let index = 0; index < AudioType.Max; index++) {
            this.addAudioSource();
        }

        Notifier.addListener(NotifyID.App_Pause, this.OnAppPause, this);
        let this1 = this;
        // if (wx) {
        //     wx.onAudioInterruptionEnd(() => {
        //         this1._musicSource.pause();
        //         this1.resumeMusic();
        //     })
        // }
    }

    private addAudioSource() {
        let audiosource = this._root.addComponent(cc.AudioSource);
        // audiosource.preload = true;
        this._audioSources.push(audiosource);
        this._audioConfigVolumes.push(1);
    }

    private _root: cc.Node;
    private _testroot: cc.Node;
    private _clips: ClipAssetMap = {};
    private _audioGunSources: GunFireAudios = cc.js.createMap();
    //背景音乐源
    private _musicSource: cc.AudioSource;
    private _musicId: number;
    //UI音效源
    private _audioSources: cc.AudioSource[] = [];

    private _musicClip: ClipAsset;
    //设置界面的音乐大小
    private _musicSettingVolume = 1;
    //配置表里的音乐大小
    private _musicConfigVolume = 1;
    //淡入淡出的音乐大小
    private _musicFadeVolume = 1;

    private _muteMusic: boolean = true;
    private _muteAudio: boolean = true;

    public setMusicVolume(volume: number) {
        this._musicSettingVolume = volume;
        cc.audioEngine.setMusicVolume(volume);
        if (this._musicSource != null) {
            this._musicSource.volume = this._musicSettingVolume * this._musicConfigVolume * this._musicFadeVolume;
        }
    }

    private setMusicConfigVolume(volume: number) {
        this._musicConfigVolume = volume;
        cc.audioEngine.setMusicVolume(volume);
        if (this._musicSource != null) {
            this._musicSource.volume = this._musicSettingVolume * this._musicConfigVolume * this._musicFadeVolume;
        }
    }

    private setMusicFadeVolume(volume: number) {
        this._musicFadeVolume = volume;
    }

    private doPlayMusic(clip: ClipAsset) {
        if (clip.clip != null) {
            this._musicSource.clip = clip.clip;
            this._musicSource.play();
            // this._musicId = cc.audioEngine.playMusic(clip.clip, true);
        } else {
            cc.warn("DoPlayMusic clip null")
        }
    }

    public playMusic(id: number, loop = true, replay = true) {
        if (!replay && this._musicClip != null && this._musicClip.id == id) {
            cc.log("skip the same music:", id)
            return;
        }
        if (this._musicClip != null && id == this._musicClip.id) {// && cc.audioEngine.isMusicPlaying()) {
            return;
        }
        if (!SettingModel.getInstance.muteMusic) return;
        let soundCfg = Cfg.Sound.get(id);
        if (soundCfg == null) {
            cc.error("PlayMusic error config id:", id)
            return;
        }
        if (soundCfg.volume <= 0) {
            cc.error("soundCfg volume error id:", id)
            soundCfg.volume = 1;
        }
        this.setMusicConfigVolume(soundCfg.volume);
        this._musicSource.loop = loop;

        let clip = this._clips[id];
        if (clip == null) {
            let path = soundCfg.path;
            Manager.loader.LoadAssetAsync(id + "", path, cc.AudioClip, (name: string, resource: cc.AudioClip, asset: string) => {
                let realid = Number(name);
                if (!this._clips[realid]) {
                    this._clips[realid] = new ClipAsset(realid);
                    this._clips[realid].clip = resource;
                }
                this.doPlayMusic(this._clips[realid]);
            }, this, "");
        } else {
            this._musicClip = clip;
            this.doPlayMusic(clip);
        }
    }

    public stopMusic() {
        cc.audioEngine.stopMusic();
        this._musicSource.stop();
    }

    public pauseMusic() {
        this._musicSource.pause();
        cc.audioEngine.pauseMusic();
    }

    public resumeMusic() {
        if (SettingModel.getInstance.muteMusic) {
            // cc.audioEngine.resumeMusic();
            this._musicSource.resume();
        }
    }

    public muteMusic(active: boolean) {
        // this._musicSource.mute = !active;
        if (SettingModel.getInstance.muteMusic) {
            if (!this._musicClip) {
                this.playMusic(508, true);
            }
            else {
                this.resumeMusic();
            }
        } else {
            this.pauseMusic();
        }
    }

    public async preloadMusic(id, callback: (path: string, progress: number) => void = null, target: any = null) {
        let soundCfg = Cfg.Sound.get(id);
        let path = soundCfg.path;
        let clip = this._clips[id];
        if (clip != null) {
            callback.call(target, path, 1);
            return;
        }
        clip = new ClipAsset(id);
        return new Promise((resolve, reject) => {
            Manager.loader.LoadAssetAsync(path, path, cc.AudioClip, (name: string, resource: cc.AudioClip) => {
                clip.clip = resource;
                resolve();
            }, this, "");
            if (callback != null) {
                Manager.loader.SetProgressCallback(path, callback, target);
            }
        })
    }

    public musicVolume() {
        return this._musicSettingVolume;
    }

    //-----------------------------------------------------------------------------------------------------------------------------

    private _audioClip: ClipAsset;
    //设置界面的音乐大小
    private _audioSettingVolume = 1;
    //配置表里的音乐大小
    private _audioConfigVolumes: number[] = [];

    public setAudioVolume(volume: number) {
        // this._audioSettingVolume = volume;
        // for (let type = 0; type < this._audioSources.length; type++) {
        //     const source = this._audioSources[type];
        //     source.volume = this._audioSettingVolume * this._audioConfigVolumes[type];
        // }
    }
    public setAudioClip(id, clip: cc.AudioClip) {
        if (!this._clips[id]) {
            this._clips[id] = new ClipAsset(id);
        }
        this._clips[id].clip = clip;
    }
    private setAudioConfigVolume(volume: number, type = AudioType.UI) {
        // if (this._audioConfigVolumes[type] == volume) return;
        // this._audioConfigVolumes[type] = volume;
        // const source = this._audioSources[type];
        // if (source == null) {
        //     cc.error("_audioSources null, type:", type);
        //     return;
        // }
        // source.volume = this._audioSettingVolume * this._audioConfigVolumes[type];
        // cc.audioEngine.setEffectsVolume(volume);
    }
    private countGunType = 1;
    private countHitDeadType = 6;
    private doPlayAudio(clip: ClipAsset, type: AudioType, playType: number = 1, volume: number) {
        if (clip.clip != null) {
            let audiotype = type;
            if (type == AudioType.Gun) {
                this.countGunType++;
                if (this.countGunType > 5) {
                    this.countGunType = 1;
                }
                audiotype = this.countGunType;
            }
            else if (type == AudioType.Hit || type == AudioType.Dead) {
                this.countHitDeadType++;
                if (this.countHitDeadType > 10) {
                    this.countHitDeadType = 6;
                }
                audiotype = this.countHitDeadType;
            }
            this._audioSources[audiotype].clip = clip.clip;
            this._audioSources[audiotype].play();
        } else {
            cc.warn("DoPlayAudio clip null")
        }
    }

    public audionum: number = 0;
    public audioHitNum: number = 0;
    public audioUINum: number = 0;
    public playAudio(id: number, type = AudioType.UI, playType: number = 1) {
        let soundCfg = Cfg.Sound.get(id);
        if (soundCfg == null) {
            cc.error("PlayAudio error config id:", id)
            return;
        }
        if (!this._muteAudio) return;

        if (this.audionum >= 2 && (type == AudioType.Dead)) {
            return;
        } else if (this.audioHitNum >= 2 && type == AudioType.Hit) {
            return;
        } else if (this.audioUINum >= 2 && type == AudioType.UI) {
            return;
        }
        if (type == AudioType.Dead) {
            this.audionum++;
        } else if (type == AudioType.Hit) {
            this.audioHitNum++;
        } else if (type == AudioType.UI) {
            this.audioUINum++;
        }
        if (soundCfg.volume <= 0) {
            cc.error("soundCfg volume error id:", id)
            soundCfg.volume = 1;
        }
        this._audioSources[type].loop = false;

        let clip = this._clips[id];
        if (clip == null) {
            this._clips[id] = new ClipAsset(id);
            let path = soundCfg.path;
            // this.setAudioConfigVolume(soundCfg.volume, type);
            Manager.loader.LoadAssetAsync(id + "", path, cc.AudioClip, (name: string, resource: cc.AudioClip, asset: string) => {
                let realid = Number(name);
                this._clips[realid].clip = resource;
                if (soundCfg.loop) {
                    this.doPlayGunFire(this._clips[realid].clip, id, soundCfg.volume);
                } else
                    this.doPlayAudio(this._clips[realid], type, playType, soundCfg.volume);
            }, this, "");
        } else {
            if (soundCfg.loop) {
                this.doPlayGunFire(clip.clip, id, soundCfg.volume);
            } else
                this.doPlayAudio(clip, type, playType, soundCfg.volume);
        }
        // }
    }

    public stopAudio(type = AudioType.UI) {
        this._audioSources[type].stop();
    }

    public muteAudio(active: boolean, type = AudioType.UI) {
        this._muteAudio = active;
    }

    public audioVolume() {
        return this._audioSettingVolume;
    }

    private OnAppPause(enable: boolean): void {
        if (!enable && cc.sys.os == cc.sys.OS_ANDROID && window["wx"]) {
            let clip = this._clips[501];
            if (clip) {
                this.doPlayAudio(clip, AudioType.UI, 0, 0.1);
            }
        }
        // if (enable) {
        //     this.stopAllGunSources();
        // } else {
        // if (!FightModel.getInstance.isFighting) {
        //     setTimeout(() => {
        //         this.stopAllGunSources();
        //     }, 1);
        // }
        // }
    }

    public stopAllGunSources() {
        for (let type in this._audioGunSources) {
            if (this._audioGunSources[type]) {
                this._audioGunSources[type].pause();
                // this._audioGunSources[type].audio.pause();
                // this._audioGunSources[type]._pausedFlag = true;
            }
        }
    }

    public stopGunFire(type: number) {
        if (this._audioGunSources[type])
            this._audioGunSources[type].pause();
    }

    public doPlayGunFire(clip: cc.AudioClip, type: number, soundvolume: number) {
        if (!this._audioGunSources[type]) {
            let audiosource = this._testroot.addComponent(cc.AudioSource);
            this._audioGunSources[type] = audiosource;
            this._audioGunSources[type].clip = clip;
            this._audioGunSources[type].volume = soundvolume;
            this._audioGunSources[type].loop = true;
            this._audioGunSources[type].play();
        } else {
            if (this._audioGunSources[type].clip) {
                if (!this._audioGunSources[type].isPlaying) {
                    this._audioGunSources[type].resume();
                }
            }
        }
    }

    private OnGamePause(enable: boolean): void {
        if (enable) {
            Manager.audio.pauseMusic();
        } else {
            Manager.audio.resumeMusic();
        }
    }
}