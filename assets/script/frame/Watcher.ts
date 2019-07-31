/// <summary>
/// 定时器
/// </summary>
export class Watcher {
    /// <summary>
    /// 序号
    /// </summary>
    private _index: number;
    public get index() { return this._index; }

    /// <summary>
    /// 下次生效时间ms
    /// </summary>
    private _nextTime: number;
    public get nextTime() { return this._nextTime; }
    /// <summary>
    /// 延迟时间ms
    /// </summary>
    private _delay: number;
    public get delay() { return this._delay; }
    public set delay(delay: number) { this._delay = delay }
    /// <summary>
    /// 剩余次数
    /// </summary>
    private _times: number;
    public get times() { return this._times; }
    private _func: (args: any) => void;
    private _args: any;
    private _target: any;

    public get enable() {
        return this._times > 0 || this.times == -1;
    }

    public constructor() { }

    _SetIndex(index) {
        this._index = index;
    }

    _SetCallback(nextTime: number, delay: number, func: (args: any) => void, args = null, target = null, times: number = 1) {
        //Debug.Log(index + " SetCallback:" + nextTime + " " + func);
        if (times < 0) {
            times = -1;
        }
        this._nextTime = nextTime;
        this._delay = delay;
        this._times = times;
        this._func = func;
        this._args = args;
        this._target = target;
    }

    public Cancal(complete = false) {
        //Debug.Log(index + " Cancal:" + endTime + " " + enable);
        if (complete) {
            this._CallBack();
        }
        this._times = 0;
    }

    _CallBack() {
        if (!this.enable) {
            return;
        }
        //cc.log("[Watcher] index:" + this.index  + " time:" + (this.nextTime - this.delay) + " CallBack:", this._func);
        if (this.times > 0) {
            this._times = this._times - 1;
            this._nextTime = this.nextTime + this.delay;
        } else if (this.times == -1) {
            this._nextTime = this.nextTime + this.delay;
        } else {
            cc.error("Watcher._CallBack times error:", this.times);
        }
        if (this._func != null) {
            this._func.call(this._target, this._args);
        }
    }

    public toString() {
        let str = "[Watcher] index:" + this.index + " time:" + this.nextTime + " times:" + this.times;
        if (this._args == null) {
            str += " func:" + this._func;
        } else {
            str += " argfunc:" + this._func + " " + this._args;
        }
        return str;
    }
}