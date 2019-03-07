export class CocosAction {
    /**
     * 抖动动画
     * @param targetNode 动作节点
     */
    public static shakeScreen(targetNode:cc.Node) {
        if (!cc.isValid(targetNode)) return;
        var deltaTime = 0.02;
        var offset = 5;
        var camera = targetNode;
        targetNode.stopAllActions()
        camera.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.moveBy(deltaTime, cc.v2(offset * 2, 0)),
                    cc.moveBy(deltaTime * 2, cc.v2(-offset * 4)),
                    cc.moveBy(deltaTime, cc.v2(offset * 2)),

                    cc.moveBy(deltaTime, cc.v2(0, offset * 2)),
                    cc.moveBy(deltaTime * 2, cc.v2(0, -offset * 4)),
                    cc.moveBy(deltaTime, cc.v2(0, offset * 2)),

                    cc.moveBy(deltaTime, cc.v2(offset, 0)),
                    cc.moveBy(deltaTime * 2, cc.v2(-offset * 2, 0)),
                    cc.moveBy(deltaTime, cc.v2(offset, 0)),

                    cc.moveBy(deltaTime, cc.v2(0, offset)),
                    cc.moveBy(deltaTime * 2, cc.v2(0, -offset * 2)),
                    cc.moveBy(deltaTime, cc.v2(0, offset)),
                    cc.delayTime(1)
                )
            )
        )

    }

    // 缩放动画
    public static runScaleAction(targetNode:cc.Node) {
        if (!cc.isValid(targetNode)) return;
        targetNode.stopAllActions()
        targetNode.scale = 1
        let scaleDuration = 0.3;
        let scale1 = cc.scaleTo(scaleDuration, 1.2);
        let scale2 = cc.scaleTo(scaleDuration, 1.0);
        let seq = cc.sequence(cc.repeat(cc.sequence(scale1,scale2),2), cc.delayTime(0.5));
        let repeat = cc.repeatForever(seq);
        targetNode.runAction(repeat);
    }
}
