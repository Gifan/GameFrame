const {ccclass, property} = cc._decorator;

// import { Cfg } from "../config/Cfg";
// import { FuncDefine } from "../config/FuncCfg";
// import { Manager } from "../manager/Manager";
// import { StorageID } from "../StorageID";

class TC {
    name : string;
}

@ccclass
export default class Test extends cc.Component {

    @property(cc.Toggle)
    toggle : cc.Toggle = null;

    @property(cc.Label)
    lang : cc.Label = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        if (this.toggle != null) {
            this.toggle.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this)
            let checkEventHandler = new cc.Component.EventHandler();
            checkEventHandler.target = this.node; //这个 node 节点是你的事件处理代码组件所属的节点
            checkEventHandler.component = "ChangeLange";
            checkEventHandler.handler = "onChangedValue";
            //checkEventHandler.customEventData = 1;        
            this.toggle.checkEvents.push(checkEventHandler);            
        }

        // this.node.opacity = 255;
        // let sprite : cc.SpriteFrame;
        // sprite.getRect()
        // let sp : cc.Sprite;
        // sp.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        // this.lang.fontSize = 11;
        // let color = new cc.Color();
        // this.lang.node.color = color.fromHEX("");
        // this.node.getChildByName("");
        
        //Cfg.initByMergeJson();
        //Cfg.initBySingleJson();

        cc.director.getPhysicsManager().enabled = true;
        //cc.director.getPhysicsManager().debugDrawFlags = cc.DrawBits.e_shapeBit|cc.DrawBits.e_jointBit;        
    }

    async start () {

    }

    onTouchEnd() {
        cc.log("ChangeLange.onTouchEnd");
    }

    onChangedValue(toggle : cc.Toggle, customEventData : string) {
        cc.log("ChangeLange.onChangedValue ", customEventData, toggle );

        // var txt = "zh";
        // if (toggle.isChecked) {
        //     txt = "zh";
        // } else {
        //     txt = "en";
        // }
    }

    // update (dt) {}
}


export namespace Sp.SubSP {

}