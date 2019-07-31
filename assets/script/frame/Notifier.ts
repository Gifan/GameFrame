
import { NotifyListener } from "./NotifyListener";
import { NotifyCaller } from "./NotifyCaller";

export const PriorLowest = -200;
export const PriorLow = -100;
export const PriorMiddle = 0;
export const PriorHigh = 100;
export const PriorHighest = 200;

/// <summary>
/// 全局通知系统对外接口
/// </summary>
export class Notifier {

    private static m_listener = new NotifyListener();

    /// <summary>
    /// 增加消息监听
    /// 默认优先级为中间值0
    /// 回调按优先级从高到低，添加顺序从晚到早执行;唯一返回值表示是否继续执行下一个回调
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="msgId">消息名称，唯一标示，最好使用常量定义</param>
    /// <param name="callback">触发回调</param>
    /// <param name="prior">优先级常量</param>
    public static addListener(msgId : number, callback : Function, context: any, prior = PriorMiddle) : void {
        this.m_listener.Register(msgId, callback, context, prior);
    }

    /// <summary>
    /// 移除监听
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="msgId"></param>
    /// <param name="callback"></param>
    //         public static void RemoveListener(int msgId, Delegate callback) {
    //             m_listener.Unregister(msgId, callback);
    //         }

    public static delListener(msgId : number, callback : Function, context: any) : void {
        this.m_listener.Unregister(msgId, callback, context);
    }

    public static changeListener(enable : boolean, msgId : number, callback : Function, context: any, prior = PriorMiddle) : void {
        if (enable) {
            this.addListener(msgId, callback, context, prior);
        } else {
            this.delListener(msgId, callback, context);
        }
    }

    /// <summary>
    /// 触发监听消息
    /// </summary>
    /// <param name="msgId"></param>        
    public static send(msgId : number, t1? : any , t2? : any, t3? : any, t4? : any) : void {
        this.m_listener.Send(msgId, t1, t2, t3, t4);
    }

    /**
     * @description 清除context为空的一些监听回调
     * @static
     * @param {number} msgId
     * @memberof Notifier
     */
    public static clean(msgId:number){
        this.m_listener.clean(msgId);
    }

    public static isExist(msgId : number) : boolean {
        return this.m_listener.IsExist(msgId);
    }

    private static m_caller = new NotifyCaller();

    /// <summary>
    /// 注册函数调用
    /// </summary>
    /// <param name="msgId"></param>
    /// <param name="callback"></param>
    /// <returns>是否注册成功</returns>
    public static setCall(msgId : number,  callback : Function, context: any) : boolean {
        return this.m_caller.Register(msgId, callback, context);
    }

    /// <summary>
    /// 移除函数调用
    /// </summary>
    /// <typeparam name="TMsg"></typeparam>
    /// <typeparam name="TResult"></typeparam>
    /// <param name="msgId"></param>
    /// <param name="callback"></param>
    /// <returns></returns>
    public static delCall(msgId : number,  callback : Function, context: any) : boolean {
        return this.m_caller.Unregister(msgId, callback, context);
    }

    public static changeCall(enable : boolean, msgId : number, callback : Function, context: any) : boolean {
        if (enable) {
            return this.setCall(msgId, callback, context);
        } else {
            return this.delCall(msgId, callback, context);
        }
    }

    /// <summary>
    /// 请求函数调用
    /// </summary>
    /// <typeparam name="T1"></typeparam>
    /// <typeparam name="TResult"></typeparam>
    /// <param name="msgId"></param>
    /// <param name="msg"></param>
    /// <returns></returns>
    public static call<T1, T2, T3, TResult>(msgId : number, t1? : any, t2? : any, t3? : any,  t4? : any) : any {
        return this.m_caller.Call(msgId, t1, t2, t3, t4);
    }
}
