const {ccclass, property} = cc._decorator;

//字体引用列表
@ccclass
export class FontSheet extends cc.Component {
    @property(cc.Font)
    fonts: cc.Font[] = [];

    get (index : number) {
        if (index > this.fonts.length) {
            cc.error(this.node.name, "FontSheet.get out range:", index, this.fonts.length)
            return this.fonts[0];
        }
        return this.fonts[index];
    }
}
