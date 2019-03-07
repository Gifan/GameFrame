//同步位置
const {ccclass, property} = cc._decorator;

@ccclass
export class SyncPosition extends cc.Component {

    @property(cc.Node)
    target: cc.Node = null;

    @property(cc.Vec2)
    offset: cc.Vec2 = cc.v2(0, 0);

    public setTarget(target : cc.Node, offset ?: cc.Vec2) {
        this.target = target;
        if (offset != null) {
            this.offset = offset;
        } else {
            // let targetPos = target.convertToWorldSpaceAR(cc.Vec2.ZERO);
            // let nodePos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
            // this.offset = nodePos.sub(targetPos);
            // cc.log("SyncPosition.setTarget offset:", this.offset, targetPos, nodePos);         
         }
    }

    start () {
        //cc.error("SyncPosition.start", this.uuid);
    }

    lateUpdate () {
        if (this.target == null) {
            return;
        }

        let pos = this.target.position.add(this.offset);
        this.node.setPosition(pos)
    }
}
