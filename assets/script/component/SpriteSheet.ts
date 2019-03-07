const {ccclass, property} = cc._decorator;

//图片引用列表
@ccclass
export class SpriteSheet extends cc.Component {
    @property(cc.SpriteFrame)
    sprites: cc.SpriteFrame[] = [];

    get (index : number) {
        if (index > this.sprites.length) {
            cc.error(this.node.name, "SpriteSheet.get out range:", index, this.sprites.length)
            return this.sprites[0];
        }
        return this.sprites[index];
    }
}
