import { Const } from "../../config/Const";
import { MVC } from "../../frame/MVC";

export default class SettingModel extends MVC.BaseModel {

    private static _instance: SettingModel = null;

    public muteMusic: boolean = true;     //屏蔽音乐
    public muteAudio: boolean = true;     //屏蔽音效
    public blockShake: boolean = true;     //屏蔽振动
    public hurtShow: boolean = true;        //伤害数字显示
    private designSize: cc.Size = null;

    public constructor() {
        super();
        if (SettingModel._instance == null) {
            SettingModel._instance = this;
        }
    }
    public static get getInstance(): SettingModel {
        if (SettingModel._instance == null) {
            SettingModel._instance = new SettingModel();
        }
        return SettingModel._instance;
    }

    public serialize(): string {
        let data = {
            music: this.muteMusic,
            audio: this.muteAudio,
            shake: this.blockShake,
            hurt: this.hurtShow,
        }
        return JSON.stringify(data);
    }

    public reset(): void {

    }

    public initSetting(data: any) {
        if (data === null) {
            return;
        }
        this.muteMusic = data.music;
        this.muteAudio = data.audio;
        this.blockShake = data.shake;
        this.hurtShow = data.hurt;
    }

    /**
     * 获取实际的设计分辨率
     */
    public getRealDesignSize(): cc.Size {
        if (!this.designSize) {
            let size = cc.view.getCanvasSize();
            if (size.height / size.width <= 1.5) {
                let realwidth = Const.designHeight * size.width / size.height;
                this.designSize = new cc.Size(realwidth, cc.winSize.height);
            } else {
                let realheight = Const.designWidth * size.height / size.width;
                this.designSize = new cc.Size(cc.winSize.width, realheight);
            }
        }
        return this.designSize;
    }
}