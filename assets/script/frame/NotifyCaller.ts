interface ICallerMap {
    [key: number]: { "func" : Function, "context" : any};
}

/// <summary>
/// 跨模块调用函数实现
/// </summary>
export class NotifyCaller {
    public constructor() { }

    private m_calls : ICallerMap = {};

    public Register(id : number, callback : Function, context: any) : boolean {
        if(callback == null) {
            // cc.error("[NotifyCaller].Register:" + id + " callback null");
            return false;
        }
        const handler = this.m_calls[id];
        if(handler != null) {
            // cc.error("[NotifyCaller].Register:" + id + " multi times:" + handler + " " + callback);
            return false;
        }
        this.m_calls[id] = { "func" : callback, "context" : context};
        return true;
    }

    public Unregister(id : number, callback : Function, context: any) : boolean {
        const handler = this.m_calls[id];
        if(handler == null || handler.func !== callback || handler.context != context) {
            // cc.error("[NotifyCaller].Unregister can't find:" + id + " callback:" + handler + " " + callback);
            return false;
        }
        delete this.m_calls[id];
        return true;
    }

    public Call(id : number, t1? : any, t2? : any, t3? : any , t4? : any ) : any {
        const handler = this.m_calls[id];
        if (handler == null) {
            cc.error("[NotifyCaller].Call can't find:" + id);
            return undefined;
        }
        return handler.func.call(handler.context, t1, t2, t3, t4);
    }
}