import { IListenerMap, kMaxStackDepth, kWarningStackDepth, ListenerManager } from "./NotifyListener_Interl";
/// <summary>
/// 跨模块消息函数实现
/// </summary>
export class NotifyListener {
    public constructor() { }
    private _managers: IListenerMap = {};
    private _callStacks: Array<number> = [];
    private getCellStackString(): string {
        let str = "[";
        for (const id of this._callStacks) {
            str += this.idToName(id) + ",";
        }
        str += "]";
        return str;
    }

    private _idToNameHandler : (id : number) => string;
    public setIdToNameHandler(handler : (id : number) => string) {
        this._idToNameHandler = handler;
    }

    private idToName(id : number) : string {
        if (this._idToNameHandler != null) {
            return this._idToNameHandler(id);
        }
        return id.toString();
    }

    /// <summary>
    /// 检查广播深度，如果未超出就压栈消息id
    /// </summary>
    /// <param name="id"></param>
    /// <returns></returns>
    private CheckAndPushCallStack(id: number): boolean {
        const stackDepth = this._callStacks.length;
        if (stackDepth >= kMaxStackDepth) {
            cc.error("[NotifyListener].Send out call stack:" + this.getCellStackString() + " msg:" + this.idToName(id));
            return false;
        }
        else if (stackDepth >= kWarningStackDepth) {
            cc.warn("[NotifyListener].Send warning call stack:" + this.getCellStackString() + " msg:" + this.idToName(id));
            return false;
        }
        this._callStacks.push(id);
        return true;
    }

    private PopCallStack(): void {
        this._callStacks.pop();
    }

    public static enableLog: boolean = true;
    public Register(id: number, callback: Function, context: any, prior: number): void {
        if (callback == null) {
            cc.error("[NotifyListener].Register:" + this.idToName(id) + " callback null");
            return;
        }
        let manager = this._managers[id];
        if (manager == null) {
            manager = new ListenerManager(id);
            this._managers[id] = manager;
        }
        else {
            //检查重复注册的情况
            if (manager.IsExistHandler(callback, context)) {
                cc.error("[NotifyListener].Register:" + this.idToName(id) + " callback repeat, skip", context);
                return;
            }
        }
        manager.AddHandler(callback, context, prior);
    }

    public Unregister(id: number, callback: Function, context: any): void {
        let manager = this._managers[id];
        if (manager == null) {
            if (NotifyListener.enableLog) {
                cc.warn("[NotifyListener].Unregister can't find ListenerManager:" + this.idToName(id) + " callback:" + callback, context);
            }
            return;
        }
        if (!manager.RemoveHandler(callback, context)) {
            if (NotifyListener.enableLog) {
                cc.warn("[NotifyListener].Unregister:" + this.idToName(id) + " can't find callback:" + callback);
            }
        }
    }
    
    public Send(id: number, t1?: any, t2?: any, t3?: any, t4?: any): void {
        let manager = this._managers[id];
        if (manager == null) {
            if (NotifyListener.enableLog) {
                cc.warn("[NotifyListener].Send can't find ListenerManager:" + this.idToName(id));
            }
            return;
        }
        if (!this.CheckAndPushCallStack(id)) {
            return;
        }
        manager.Send(t1, t2, t3, t4);
        this.PopCallStack();
    }

    public IsExist(id: number) : boolean {
        return this._managers[id] != null;
    }
}