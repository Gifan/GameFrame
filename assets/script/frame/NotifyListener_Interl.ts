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
    private _callback: Function;
    /// <summary>
    /// 发送优先级
    /// </summary>
    private _prior = 0;
    /// <summary>
    /// 发送次数
    /// </summary>
    private _sendTimes = 0;

    public constructor(handler: Function, context: any, prior: number) {
        this._callback = handler;
        this._context = context;
        this._prior = prior;
    }

    public get context(): any {
        return this._context;
    }

    public get callback(): Function {
        return this._callback;
    }

    public get prior() {
        return this._prior;
    }

    public get sendTimes() {
        return this._sendTimes;
    }

    public SetSendTimes(times: number): void {
        this._sendTimes = times;
    }
}

export class ListenerManager {
    private m_handlers: Array<ListenerHandler>;
    /// <summary>
    /// 发送次数
    /// </summary>
    private m_sendTimes: number = 0;
    private m_id: number = 0;

    public constructor(id: number) {
        this.m_id = id;
        this.m_handlers = new Array<ListenerHandler>();
    }

    public toString(): string {
        let str = '<ListenerManager id:%{m_id}, times:%{m_sendTimes}>';
        return str;
    }

    public IsExistHandler(callback: Function, context: any): boolean {
        if (this.m_handlers.length > 0) {
            for (let i = this.m_handlers.length - 1; i >= 0; i--) {
                const handler = this.m_handlers[i];
                if (handler.callback === callback && handler.context == context) {
                    return true;
                }
            }
        }
        return false;
    }

    public AddHandler(callback: Function, context: any, prior: number): boolean {
        let handler = new ListenerHandler(callback, context, prior);
        if (this.m_handlers.length > 0) {
            let insert = false;
            //按优先级从低到高排列，同优先级的按先添加的排前面，方便从后向前遍历时删除
            for (let i = this.m_handlers.length - 1; i >= 0; i--) {
                if (handler.prior >= this.m_handlers[i].prior) {
                    this.m_handlers.splice(i + 1, 0, handler);
                    insert = true;
                    break;
                }
            }
            if (!insert) {
                this.m_handlers.unshift(handler);
            }
        } else {
            this.m_handlers.push(handler);
        }
        return true;
    }

    public RemoveHandler(callback: Function, context: any): boolean {
        let index = -1;
        if (this.m_handlers.length > 0) {
            for (let i = this.m_handlers.length - 1; i >= 0; i--) {
                const handler = this.m_handlers[i];
                if (handler.callback === callback && handler.context == context) {
                    index = i;
                    break;
                }
            }
        }
        if (index == -1) {
            return false;
        }
        this.m_handlers.splice(index, 1);
        return true;
    }

    public Send(t1?: any, t2?: any, t3?: any, t4?: any): void {
        ++this.m_sendTimes;

        //从高优先级的开始发送消息，支持收到消息后删除自己
        for (let i = this.m_handlers.length - 1; i >= 0; i--) {
            const handler = this.m_handlers[i];
            if(!handler) continue;
            if (handler.sendTimes >= this.m_sendTimes) {
                continue;
            }
            handler.SetSendTimes(this.m_sendTimes);
            handler.callback.call(handler.context, t1, t2, t3, t4);
        }
    }

    public clean() {
        if (this.m_handlers.length > 0) {
            let len = this.m_handlers.length;
            for (let i = len - 1; i >= 0; i--) {
                const handler = this.m_handlers[i];
                if (handler.context == null) {
                    this.m_handlers.splice(i, 1);
                }
            }
        }
    }
}