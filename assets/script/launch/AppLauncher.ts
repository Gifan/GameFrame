import { Notifier } from "../../frame/mvcs/Notifier";
import { NotifyID } from "../../frame/mvcs/NotifyID";
import { ListenID } from "../ListenID";
import { CallID } from "../CallID";
import { Const } from "../config/Const";

function listenIdToName(id : number) : string {
    let name : string;
    if (id < ListenID._Start) {
        name = NotifyID[id];
    } else {
        name = ListenID[id];
    }
    if (name == null) {
        name = id.toString();
    }
    return name;
}

function callIdToName(id : number) : string {
    let name : string;
    name = CallID[id];    
    if (name == null) {
        name = id.toString();
    }
    return name;
}

//app启动器
export class AppLauncher {
    public constructor() {
        Notifier.setListenNameHandler(listenIdToName);
        Notifier.setCallNameHandler(callIdToName);
        
        cc.game.on(cc.game.EVENT_HIDE, function(){
            //cc.error("Launcher 游戏进入后台");
            Notifier.send(NotifyID.App_Pause, true);
        },this);
        cc.game.on(cc.game.EVENT_SHOW, function(){
            //cc.error("Launcher 重新返回游戏");
            Notifier.send(NotifyID.App_Pause, false);
        },this);

        //开启碰撞
        let collisionManager = cc.director.getCollisionManager();
        collisionManager.enabled = true;
        // collisionManager.enabledDebugDraw = true;
        // collisionManager.enabledDrawBoundingBox = true;

        //开启物理
        let physicsManager = cc.director.getPhysicsManager();
        physicsManager.enabled = true;
        //physicsManager.debugDrawFlags = cc.DrawBits.e_jointBit | cc.DrawBits.e_shapeBit;
        physicsManager.gravity = cc.v2(0, 0);
        // 开启物理步长的设置
        physicsManager.enabledAccumulator = true;
        // 物理步长，默认 FIXED_TIME_STEP 是 1/60
        cc.PhysicsManager.FIXED_TIME_STEP = 1/30;
        // 每次更新物理系统处理速度的迭代次数，默认为 10
        cc.PhysicsManager.VELOCITY_ITERATIONS = 5;
        // 每次更新物理系统处理位置的迭代次数，默认为 10
        cc.PhysicsManager.POSITION_ITERATIONS = 5;
    }    
}