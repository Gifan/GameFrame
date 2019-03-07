//自动移动
const {ccclass, property} = cc._decorator;

@ccclass
export class AutoMove extends cc.Component {

    @property(cc.Vec2)
    velocity: cc.Vec2 = cc.v2(0, 0);

    start () {
        //cc.error("AutoMove.start", this.uuid, this._cameraNode);
    }

    private _moveVec : cc.Vec2; 
    update (dt) {
        this._moveVec = this.velocity.mul(dt);
        let pos = this.node.position.add(this._moveVec);
        this.node.setPosition(pos)

        if (this._cameraNode != null) {
            pos = this._cameraNode.position.add(this._moveVec);
            this._cameraNode.setPosition(pos);
        } else {
            //cc.error("AutoMove.update _cameraNode null", this.uuid)
        }
    }

    private _cameraNode : cc.Node;
    public activeCameraFollow() {
        this._cameraNode = cc.find("Canvas/Main Camera");

        //cc.error("AutoMove.activeCameraFollow", this.uuid, this._cameraNode);
    }
}
