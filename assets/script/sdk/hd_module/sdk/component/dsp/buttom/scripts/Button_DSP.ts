import { EPlatform, appConfig } from "../../../../../config/AppConfig";
import { EventManager } from "../../../../../mgr/EventManager";
import { HD_MODULE } from "../../../../../hd_module";
import UtilsSprite from "../../../../../utils/sprite ";
import { AnimationUtils } from "../../../../../utils/AnimationUtils";
import { EffectUtils } from "../../../../../utils/EffectUtils";

const {ccclass, property} = cc._decorator;

let PosType = cc.Enum({
    home: 1,
    game: 2,
    result: 3,
    box: 4,
});

let PosString = {
    1: "home",
    2: "game",
    3: "result",
    4: "box",
}

let envVersion = {
    0: "develop",   //跳转开发板
    1: "trial",     //跳转体验版
    2: "release",   //跳转正式版
}

@ccclass
export default class ButtonDSP extends cc.Component {
    /** 是否已获取数据 */
    static isGetData: boolean = false;
    /** 位置ID */
    @property({type: PosType})
    pos: number = PosType.home;

    /** 平台 */
    @property({type: EPlatform})
    platform: number = EPlatform.WeChat;
    
    /** 第几张图 */
    index: number = -1;
    /** 当前计时器ID */
    timerId: number = 0;

    onEnable(){
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        EventManager.on('dsp-getdata', () => this.changeSprite(), this);
    }

    onDestroy(){
        clearInterval(this.timerId);
    }

    onLoad(){
        /** 有平台时才刷 */
        if(HD_MODULE.getPlatform().getToken() && this.platform == appConfig.platform_id){
            if(!ButtonDSP.isGetData){
                DSPData.init();
                ButtonDSP.isGetData = true;
            }else{
                this.changeSprite();
            }
        }else{
            this.node.setContentSize(0, 0);
        }
    }

    onDisable(){
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        EventManager.offTarget(this);
    }

    onTouchEnd(){
        let info = this.getMiniProInfo();
        if(!info) return;
        let toAppid = info.app_id;
        HD_MODULE.getPlatform().navigateToMiniProgram({
            appId: toAppid,
            envVersion: envVersion[appConfig.env],
            path: info.path || "",
            success: () => {
                this.changeSprite();
                HD_MODULE.getNet().postDSPOut({to_app_id: toAppid});
            },
            fail: () => this.changeSprite()
        });
    }

    /** 切换图片 */
    changeSprite(num?: number){
        let list = this.getMiniProList();
        let info = this.getMiniProInfo();
        if(!info) return;
        this.index = (num || num == 0) ? num : (this.index + 1) % list.length;
        let duration = info.duration || 10;
        clearInterval(this.timerId);
        this.timerId = setInterval(() => {
            this.changeSprite();
        }, duration * 1000);
        this.onFlush();
    }

    onFlush(type: string = 'all', info?: any){
        switch(type){
            case 'all': {
                this.updateSpirte();
                // this.updateEffect();
               break;
            }
        }
    }

    /**
     * 刷新图片
     */
    updateSpirte(){
        let info = this.getMiniProInfo();
        if(!info) return;
        let aniUrl = this.getAnimationUrl();
        if (!aniUrl) {
            // 图片
            let sp = this.node.getComponent(cc.Sprite);
            if(!sp){
                sp = this.node.addComponent(cc.Sprite);
            }
            sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            UtilsSprite.setSprite(sp, info.icon);
        }else {
            // 帧动画
            AnimationUtils.play(aniUrl, this.node, null, 0, 0);
        }
    }

    /**
     * 刷新动作
     */
    public updateEffect() {
        let info = this.getMiniProInfo();
        if (!info) {
            return;
        }
        this.node.stopAllActions();
        switch (info.effect) {
            case DSPEffectType.SCALE: {
                EffectUtils.getInstance().playScaleEffect(this.node);
            }
                break;
            case DSPEffectType.SCALE: {
                EffectUtils.getInstance().shakeObj(this.node);
            }
                break;
            default:
                break;
        }
    };

    getMiniProList(){
        let list = DSPData.miniproList[PosString[this.pos]];
        if(!list){
            return {};
        }
        return list;
    }

    getMiniProInfo(){
        let list = this.getMiniProList();
        if(this.index == -1){
            this.index = Math.floor(Math.random() * list.length);
        }
        let info = list[this.index];
        return info;
    }

    /**
     * 获取帧动画文件地址
     */
    public getAnimationUrl(): string {
        let info = this.getMiniProInfo();
        if (!info) {
            return "";
        }
        let aniUrl = "";
        let icon: string = info.icon;
        let urls = icon.split(",");
        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];
            if (new RegExp(".anim$").test(url)) {
                aniUrl = url;
                break;
            }
        }
        return aniUrl;
    }
}


export class DSPData{
    /** DSP信息 */
    public static miniproList: {} = {};

    public static init(){
        HD_MODULE.getNet().getDSPInfo({version: appConfig.app_version}, (res) => {
            DSPData.miniproList = res.data.apps;
            EventManager.emit('dsp-getdata');
        })
    }
}

/**
 * dsp按钮特效
 */
export enum DSPEffectType {
    /** 放大缩小 */
    SCALE       = 0,
    /** 摇头抖动 */
    SHAKE_HEAD  = 0,
}