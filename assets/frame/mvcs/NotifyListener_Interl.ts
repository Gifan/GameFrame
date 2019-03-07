export interface IListenerMap {
    [key: number]: ListenerManager;
}

/// <summary>
/// 最大调用深度，防止消息广播形成环导致死循环
/// </summary>
export const kMaxStackDepth = 15;
export const kWarningStackDepth = 10;

class ListenerHandler {

    /*
    * 回调上下文
    */
    private _context: any;
    /// <summary>
    /// 回调事件
    /// </summary>
    private _callback : Function;
    /// <summary>
    /// 发送优先级
    /// </summary>
    private _prior = 0;
    /// <summary>
    /// 发送次数
    /// </summary>
    private _sendTimes = 0;

    public constructor(handler : Function, context: any, prior : number) {
        this._callback = handler;
        this._context = context;
        this._prior = prior;
    }

    public get context() : any {
        return this._context;
    }

    public get callback() : Function {
        return this._callback;
    }

    public get prior() {
        return this._prior;
    }

    public get sendTimes() {
        return this._sendTimes;
    }

    public SetSendTimes(times: number) : void {
        this._sendTimes = times;
    }
}

export class ListenerManager {
    private _handlers : Array<ListenerHandler>;
    /// <summary>
    /// 发送次数
    /// </summary>
    private _sendTimes : number = 0;
    private _id : number = 0;

    public constructor(id : number) {
        this._id = id;
        this._handlers = new Array<ListenerHandler>();
    }

    public toString() : string {
        let str = `<ListenerManager id:${this._id}, times:${this._sendTimes}>`;
        return str;
    }

    public IsExistHandler(callback : Function, context: any) : boolean {
        if (this._handlers.length > 0) {
            for (let i = this._handlers.length - 1; i >= 0; i--) {
                const handler = this._handlers[i];
                if (handler.callback === callback && handler.context == context) {
                    return true;
                }
            }
        }
        return false;
    }

    public AddHandler(callback : Function, context: any, prior : number) : boolean {
        let handler = new ListenerHandler(callback, context, prior);
        if (this._handlers.length > 0) {
            let insert = false;
            //按优先级从低到高排列，同优先级的按先添加的排前面，方便从后向前遍历时删除
            for (let i = this._handlers.length - 1; i >= 0; i--) {
                if (handler.prior >= this._handlers[i].prior) {
                    this._handlers.splice(i + 1, 0, handler);
                    insert = true;
                    break;
                }
            }
            if (!insert) {
                this._handlers.unshift(handler);
            }
        } else {
            this._handlers.push(handler);
        }
        return true;
    }

    public RemoveHandler(callback : Function, context: any) : boolean {
        let index = -1;
        if (this._handlers.length > 0) {
            for (let i = this._handlers.length - 1; i >= 0; i--) {
                const handler = this._handlers[i];
                if (handler.callback === callback && handler.context == context) {
                    index = i;
                    break;
                }
            }
        }
        if (index == -1) {
            return false;
        }
        this._handlers.splice(index, 1);
        return true;
    }

    public Send(t1? : any, t2? : any, t3?: any, t4?: any) : void {
        ++this._sendTimes;

        //从高优先级的开始发送消息，支持收到消息后删除自己
        for (let i = this._handlers.length - 1; i >= 0; i--) {
            const handler = this._handlers[i];
            if (handler.sendTimes >= this._sendTimes) {
                continue;
            }
            handler.SetSendTimes(this._sendTimes);
            handler.callback.call(handler.context, t1, t2, t3, t4);
        }
    }
}