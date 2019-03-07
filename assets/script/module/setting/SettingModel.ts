import { MVCS } from "../../../frame/mvcs/MVCS";

export class SettingModel extends MVCS.AbsModel {
    public constructor() {
        super("_Setting");
    }

    public reset() : void {
        
    }

    public muteMusic = false;     //屏蔽音乐
    public muteAudio = false;     //屏蔽音效
    public blockShake = false;     //屏蔽振动

    public serialize( ) : string { 
        let data = {
            music : this.muteMusic,
            audio : this.muteAudio,
            shake : this.blockShake
        }
        return JSON.stringify(data); 
    }

    public initSetting(data: any){
        if(data === null){
            return;
        }
        
        this.muteMusic = data.music;
        this.muteAudio = data.video;
        this.blockShake = data.shake;        
    }    
}