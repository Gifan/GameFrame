import { IListenerMap, kMaxStackDepth, kWarningStackDepth, ListenerManager } from "./NotifyListener_Interl";
/// <summary>
/// 跨模块消息函数实现
/// </summary>
export class NotifyListener {
    public constructor() { }
    private m_managers: IListenerMap = {};
    private m_callStacks: Array<number> = [];
    private GetCellStackString(): string {
        let str = "[";
        for (const item of this.m_callStacks) {
            str += item + ",";
        }
        str += "]";
        return str;
    }

    /// <summary>
    /// 检查广播深度，如果未超出就压栈消息id
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    private CheckAndPushCallStack(id: number): boolean {
        const stackDepth = this.m_callStacks.length;
        if (stackDepth >= kMaxStackDepth) {
            cc.error("[NotifyListener].Send out call stack:" + this.GetCellStackString() + " msg:" + id);
            return false;
        }
        else if (stackDepth >= kWarningStackDepth) {
            cc.warn("[NotifyListener].Send warning call stack:" + this.GetCellStackString() + " msg:" + id);
            return false;
        }
        this.m_callStacks.push(id);
        return true;
    }

    private PopCallStack(): void {
        this.m_callStacks.pop();
    }

    public static enableLog: boolean = true;
    public Register(id: number, callback: Function, context: any, prior: number): void {
        if (callback == null) {
            cc.error("[NotifyListener].Register:" + id + " callback null");
            return;
        }
        let manager = this.m_managers[id];
        if (manager == null) {
            manager = new ListenerManager(id);
            this.m_managers[id] = manager;
        }
        else {
            //检查重复注册的情况
            if (manager.IsExistHandler(callback, context)) {
                cc.error("[NotifyListener].Register:" + id + " callback repeat, skip", context);
                return;
            }
        }
        manager.AddHandler(callback, context, prior);
    }

    public Unregister(id: number, callback: Function, context: any): void {
        let manager = this.m_managers[id];
        if (manager == null) {
            if (NotifyListener.enableLog) {
                cc.warn("[NotifyListener].Unregister can't find ListenerManager:" + id + " callback:" + callback, context);
            }
            return;
        }
        if (!manager.RemoveHandler(callback, context)) {
            if (NotifyListener.enableLog) {
                cc.warn("[NotifyListener].Unregister:" + id + " can't find callback:" + callback);
            }
        }
    }

    public Send(id: number, t1?: any, t2?: any, t3?: any, t4?: any): void {
        let manager = this.m_managers[id];
        if (manager == null) {
            if (NotifyListener.enableLog) {
                cc.warn("[NotifyListener].Send can't find ListenerManager:" + id);
            }
            return;
        }
        if (!this.CheckAndPushCallStack(id)) {
            return;
        }
        manager.Send(t1, t2, t3, t4);
        this.PopCallStack();
    }

    public IsExist(id: number): boolean {
        return this.m_managers[id] != null;
    }

    public clean(id: number): void {
        let manager = this.m_managers[id];
        if(manager){
            manager.clean();
        }
    }
}