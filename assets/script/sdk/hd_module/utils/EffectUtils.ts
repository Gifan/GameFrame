/**
 * 游戏特效汇总
 * by zhaoxin
 * (c) copyright 2014 - 2035
 * All Rights Reserved. 
 * 使用方法如：EffectUtils.rotationEffect()
 */
export class EffectUtils {
    /** 单例对象 */
	private static _instance: EffectUtils;
	/**
	 * 获取单例
	 */
	public static getInstance(): EffectUtils {
		if (!EffectUtils._instance) {
			EffectUtils._instance = new EffectUtils();
		}
		return EffectUtils._instance;
    }

    /**
     * 对象抖动特效
     * @param target 抖动对象
     * @param delay 延迟
     */
    public shakeObj(target: cc.Node, delay: number = 3):void{
        target && target.runAction(cc.repeatForever(
            cc.sequence(cc.rotateTo(0.15, 10), cc.rotateTo(0.15, -10), cc.rotateTo(0.1, 8), cc.rotateTo(0.1, -8), cc.rotateTo(0.1, 4), cc.rotateTo(0.1, -4), cc.rotateTo(0.08, 0), cc.delayTime(delay))
        ));
    }

    /**
    * 给显示对象增加持续放大缩小特效
    * @param target 对象
    * @param ratio 缩小比率
    * @param duration 周期
    */
    public playScaleEffect(target: any, ratio: number = 0.1, duration: number = 0.5):void{
        let scaleX = target.scaleX;
        let scaleY = target.scaleY;
        let onComplete2: Function;
        let onComplete1: Function = function(){
            if (!target || target.destroyed) {
                return;
            }
            target.scaleX = scaleX * (1 - ratio);
            target.scaleY = scaleY * (1- ratio);
            let scaleAction = cc.scaleTo(duration, scaleX * ratio, scaleY * ratio);
            let action = cc.sequence(scaleAction, cc.callFunc(onComplete2));
            target && target.runAction(action);
        }
        onComplete2 = function(){
            if (!target || target.destroyed) {
                return;
            }
            target.scaleX = scaleX * (1 + ratio);
            target.scaleY = scaleY * (1 + ratio);
            let scaleAction = cc.scaleTo(duration, scaleX * ratio, scaleY * ratio);
            let action = cc.sequence(scaleAction, cc.callFunc(onComplete1));
            target && target.runAction(action);
        }; 
        onComplete2();
    }
}