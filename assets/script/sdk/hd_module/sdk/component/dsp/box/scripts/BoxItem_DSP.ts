import { HD_MODULE } from "../../../../../hd_module";
import { appConfig } from "../../../../../config/AppConfig";
import UtilsSprite from "../../../../../utils/sprite ";

const {ccclass, property} = cc._decorator;

let envVersion = {
    0: "develop",   //跳转开发板
    1: "trial",     //跳转体验版
    2: "release",   //跳转正式版
}

@ccclass
export default class BoxItemDSP extends cc.Component {
    appid: string = "";
    imgUrl: string = null;

    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    init(data){
        if(!data) return;
        this.appid = data.appid;
        this.imgUrl = data.imgUrl;
        this.onFlush();
    }

    onLoad(){
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onDestroy(){
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchEnd(){
        HD_MODULE.getPlatform().navigateToMiniProgram({
            appId: this.appid,
            envVersion: envVersion[appConfig.env],
            success: () => {
            },
        });
    }

    onFlush(type: string = 'all'){
        switch(type){
            case 'all': {
                this.updateSprite();
               break;
            }
        }
    }

    updateSprite(){
        if(this.sprite){
            if(this.imgUrl)
                UtilsSprite.setSprite(this.sprite, this.imgUrl);
        }
    }
}
