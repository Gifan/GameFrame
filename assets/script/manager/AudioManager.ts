import { Cfg } from "../config/Cfg";
import { Manager } from "./Manager";
import { Time } from "../../frame/Time";
import { Notifier } from "../../frame/mvcs/Notifier";
import { NotifyID } from "../../frame/mvcs//NotifyID";
import { CallID } from "../CallID";

class ClipAsset {
    public id: number;
    public clip: cc.AudioClip;
    public constructor(id:number) {
        this.id = id;
    }
}

declare interface ClipAssetMap {
    [key: number]: ClipAsset;
}

export enum AudioType {
    UI,
    Voice,
    Skill,
    Hit,
    Buff,
    Opera,
    Music,
    Max = Music,
}

export class AudioManager {
    public constructor() {
        const scene = cc.director.getScene();
        let node = new cc.Node('_AudioManager');
        cc.game.addPersistRootNode(node);
        node.parent = scene;
        this._root = node;

        this._musicSource = node.addComponent(cc.AudioSource);
        this._musicSource.loop = true;

        for (let index = 0; index < AudioType.Max; index++) {
            this.addAudioSource();
        }

        //cc.error("AudioManager addListener", NotifyID.App_Pause);
        Notifier.addListener(NotifyID.App_Pause, this.OnAppPause, this);
        Notifier.addListener(NotifyID.Game_Pause, this.OnGamePause, this);
    }

    private addAudioSource() {
        this._audioSources.push(this._root.addComponent(cc.AudioSource));
        this._audioConfigVolumes.push(1);
    }

    private _root : cc.Node;
    private _clips : ClipAssetMap = {}

    //背景音乐源
    private _musicSource : cc.AudioSource;
    //UI音效源
    private _audioSources : cc.AudioSource[] = [];

    private _musicClip:ClipAsset;
    //设置界面的音乐大小
    private _musicSettingVolume = 1;
    //配置表里的音乐大小
    private _musicConfigVolume = 1;
    //淡入淡出的音乐大小
    private _musicFadeVolume = 1;
    public setMusicVolume(volume:number) {
        this._musicSettingVolume = volume;
        if (this._musicSource != null) {
            this._musicSource.volume = this._musicSettingVolume * this._musicConfigVolume * this._musicFadeVolume;
        }
    }

    private setMusicConfigVolume(volume:number) {
        this._musicConfigVolume = volume;
        if (this._musicSource != null) {
            this._musicSource.volume = this._musicSettingVolume * this._musicConfigVolume * this._musicFadeVolume;
        }
    }

    private setMusicFadeVolume(volume:number) {
        this._musicFadeVolume = volume;
        if (this._musicSource != null) {
            this._musicSource.volume = this._musicSettingVolume * this._musicConfigVolume * this._musicFadeVolume;
        }
    }

    private doPlayMusic(clip:ClipAsset) {
        if (clip.clip != null) {
            this._musicSource.clip = clip.clip;
            this._musicSource.play();
        } else {
            cc.warn("DoPlayMusic clip null")
        }
    }

    public playMusic(id:number, loop = true, replay = true) {
        if(!replay && this._musicClip != null && this._musicClip.id == id) {
            cc.log("skip the same music:", id)
            return;
        }

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
            clip = new ClipAsset(id);
            this._musicClip = clip;
            let path = soundCfg.paths[0];
            Manager.loader.LoadAssetAsync(path, path, cc.AudioClip, (name : string, resource: cc.AudioClip) => {
                clip.clip = resource;
                if (clip.id != this._musicClip.id) {
                    return;
                }
                this.doPlayMusic(clip);
            }, this);
        } else {
            this._musicClip = clip;
            this.doPlayMusic(clip);
        }
    }

    public stopMusic() {
        this._musicSource.stop();
    }

    public pauseMusic() {
        this._musicSource.pause();
    }

    public resumeMusic() {
        this._musicSource.resume();
    }

    public muteMusic(active:boolean) {
        this._musicSource.mute = active;
    }

    public async preloadMusic(id, callback:(path : string, progress : number) => void = null, target : any = null) {
        let soundCfg = Cfg.Sound.get(id);        
        let path = soundCfg.paths[0];
        let clip = this._clips[id];
        if (clip != null) {
            callback.call(target, path, 1);
            return;
        }
        clip = new ClipAsset(id);
        return new Promise((resolve, reject)=>{
            Manager.loader.LoadAssetAsync(path, path, cc.AudioClip, (name : string, resource: cc.AudioClip) => {
                //cc.log("PreloadMusic:", clip.id, Time.time);
                clip.clip = resource;
                resolve();
            }, this);
            if (callback != null) {
                Manager.loader.SetProgressCallback(path, callback, target);
            }
        })
    }

    public musicVolume(){
        return this._musicSettingVolume;
    }

//-----------------------------------------------------------------------------------------------------------------------------

    private _audioClip:ClipAsset;
    //设置界面的音乐大小
    private _audioSettingVolume = 1;
    //配置表里的音乐大小
    private _audioConfigVolumes:number[] = [];

    public setAudioVolume(volume:number) {
        this._audioSettingVolume = volume;
        for (let type = 0; type < this._audioSources.length; type++) {
            const source = this._audioSources[type];
            source.volume = this._audioSettingVolume * this._audioConfigVolumes[type];
        }
    }

    private setAudioConfigVolume(volume:number, type = AudioType.UI) {
        this._audioConfigVolumes[type] = volume;
        const source = this._audioSources[type];
        if (source == null) {
            cc.error("_audioSources null, type:", type);
            return;
        }
        source.volume = this._audioSettingVolume * this._audioConfigVolumes[type];
    }

    private doPlayAudio(clip:ClipAsset, type : AudioType) {
        if (clip.clip != null) {
            this._audioSources[type].clip = clip.clip;
            this._audioSources[type].play();
        } else {
            cc.warn("DoPlayAudio clip null")
        }
    }

    private randomPathIndex(soundCfg) : number {
        if (soundCfg.paths.length == 1) {
            return 0;
        }

        if (soundCfg._totalWeight == null) {
            soundCfg._totalWeight = 0;
            soundCfg.weights.forEach(weight => {
                soundCfg._totalWeight += weight;
            });
        }

        let total = 0;
        let rand = Math.random() * soundCfg._totalWeight;
        for (let index = 0; index < soundCfg.weights.length; index++) {
            const weight = soundCfg.weights[index];
            total += weight;
            if (rand <= total)
            {
                return index;
            }
        }
        cc.error(soundCfg.id + " Error SoundCsv weight:" + total + " / " + soundCfg._totalWeight);
        return 0;
    }

    public playAudio(id:number, type = AudioType.UI) {
        let soundCfg = Cfg.Sound.get(id);
        if (soundCfg == null) {
            cc.error("PlayAudio error config id:", id)
            return;
        }

        if (soundCfg.prob != null && Math.random() > soundCfg.prob) {
            cc.log("playAudio prob skip, id:", id);
            return;
        }

        if (soundCfg.volume <= 0) {
            cc.error("soundCfg volume error id:", id)
            soundCfg.volume = 1;
        }
        this.setAudioConfigVolume(soundCfg.volume, type);

        this._audioSources[type].loop = soundCfg.loop || false;
        
        //获取随机到的真正资源
        let index = this.randomPathIndex(soundCfg);
        id = id * 10 + index;

        //cc.log("playAudio", id, AudioType[type]);

        let clip = this._clips[id];
        if (clip == null) {
            clip = new ClipAsset(id);
            this._audioClip = clip;
            let path = soundCfg.paths[index];
            Manager.loader.LoadAssetAsync(path, path, cc.AudioClip, (name : string, resource: cc.AudioClip) => {
                //cc.log("loadAudio:", name);
                clip.clip = resource;
                if (clip.id != this._audioClip.id) {
                    //cc.log("playAudio skip, id", clip.id);
                    return;
                }
                this.doPlayAudio(clip, type);
            }, this);
        } else {
            this._audioClip = clip;
            this.doPlayAudio(clip, type);
        }
    }

    public stopAudio(type = AudioType.UI) {
        this._audioSources[type].stop();
    }

    public muteAudio(active:boolean, type = AudioType.UI) {
        this._audioSources[type].mute = active;
    }

    public audioVolume(){
        return this._audioSettingVolume;
    }

    private _appPause = false;
    private OnAppPause(enable : boolean) : void {
        //cc.error("OnAppPause", enable, "Time.pause", Time.isPause);
        if (enable) {
            if (Time.isPause) {
                //说明是先暂停，后切换后台
                return;
            }
            this._appPause = true;
            Notifier.send(NotifyID.Game_Pause, true);      
        } else {
            if (!this._appPause) {
                 //说明是先暂停，后切换后台
                return;
            }
            this._appPause = false;
            Notifier.send(NotifyID.Game_Pause, false);
        }
    }

    private OnGamePause(enable : boolean) : void {
        if (enable) {
            this.pauseMusic();            
        } else {
            this.resumeMusic();
        }
    }
}