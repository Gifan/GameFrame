import { Notifier } from "./mvcs/Notifier";
import { NotifyID } from "./mvcs/NotifyID";
import { ObjectPool } from "./collections/ObjectPool";
import { MinSortList } from "./collections/MinSortList";
import { Watcher } from "./Watcher";

class _Time {
    private _time : number = 0;
    //游戏启动的时间
    public get time() : number {
        return this._time;
    }

    private _deltaTime : number = 0;
    //上一帧的时间
    public get deltaTime() : number {
        return this._deltaTime;
    }

    private _frameCount : number = 0;
    //游戏经过的帧数
    public get frameCount() : number {
        return this._frameCount;
    }

    private _clientTimeMs : number = 0;
    //客户端时间，毫秒
    public get clientTimeMs() : number {
        return this._clientTimeMs;
    }

    private _clientDate : Date = new Date();
    //客户端日期
    public get clientDate() : Date {
        return this._clientDate;
    }

    private _serverUpdateMs : number = 0;
    private _serverInitMs : number = 0;
    private _serverTimeMs : number = 0;
    //服务器时间，毫秒
    public get serverTimeMs() : number {
        return this._serverTimeMs;
    }

    private _isPause = false;
    public get isPause() {
        return this._isPause;
    }

    public pause() {
        this._isPause = true;
    }

    public resume() {
        this._isPause = false;
    }

    public update(dt : number) {
        this._frameCount += 1;
        if (this._scaling) {
            dt *= this.scale;
        }
        this._deltaTime = dt;
        if (this._isPause) {
            return;
        }
        this._time += dt;
        this._clientDate = new Date();
        this._clientTimeMs = Date.now();
        this._serverTimeMs = this._serverInitMs + this._clientTimeMs - this._serverUpdateMs;

        //cc.log("_Time.update", dt, this._time, this._frameCount, this._clientTimeMs);

        //更新定时器
        let times = 0;
        while (true) {
            let first = this._watchers.peek();
            if (first == null || first.nextTime > this._time) {
                break;
            }
            //cc.log(this._frameCount + " " + this._time + "\n" + first.toString());
            this._watchers.pop();
            first._CallBack();
            if (first.enable) {
                this._watchers.add(first);
            } else {
                this._pool.push(first);
            }
            ++times;
            if (times > 10000) {
                cc.error("watchers too many! frist:" + first.toString());
                break;
            }
        }

        this.updateScale(dt);

        if (Notifier.isExist(NotifyID.Game_Update)) {
            //cc.log("Game_Update");
            Notifier.send(NotifyID.Game_Update);            
        }
    }

    public setServerTime(timeMs : number) {
        this._serverTimeMs = timeMs;
        this._serverInitMs = timeMs;
        this._serverUpdateMs = Date.now();
        console.log("setServerTime", timeMs, this._serverUpdateMs);
    }

    private compareTime(left : Watcher, right : Watcher) {
        if (left.nextTime < right.nextTime) {
            return -1;
        }
        if (left.nextTime > right.nextTime) {
            return 1;
        }
        return 0;
    }

    private _index = 0;
    private _pool = new ObjectPool<Watcher>(function () {
        return new Watcher();
    });
    private _watchers = new MinSortList<Watcher>(this.compareTime);

    /// <summary>
    /// 带参数的定时器回调
    /// </summary>
    /// <param name="delay"></param>
    /// /// <param name="times">重复次数，-1表示无限次数</param>
    /// <param name="callback"></param>
    /// <param name="arg"></param>
    /// <returns></returns>
    public delay(delay : number, callback : (arg : any) => void, arg : any = null, target = null, times = 1) : Watcher {
        if (callback == null) {
            cc.error("Delay ArgCallback null:" + callback + " arg:" + arg);
            return null;
        }
        if (delay == null || delay < 0) {
            cc.error("Timer.Delay delay:" + delay);
            return null;
        }
        let watcher = this._pool.pop();
        watcher._SetIndex(++this._index);
        watcher._SetCallback(this._time + delay, delay, callback, arg, target, times);
        this._watchers.add(watcher);
        return watcher;
    }

    private doCancal(watcher : Watcher) {
        if (watcher == null) {
            return;
        }
        watcher.Cancal();
        this._pool.push(watcher);
    }

    public reset() {
        this._index = 0;
        this._watchers.clear(this.doCancal, this);
        cc.warn("Time.reset");
    }

    private _scaling = false;
    private _scale = 1;
    private _scaleDura = 0;
    private _scaleTimeout = 0;
    private _scaleSmooth = true;
    public setScale(scale : number, dura : number, smooth = true) {
        this._scaling = true;
        this._scale = scale;
        this._scaleDura = dura;
        this._scaleTimeout = this._time + dura;
        this._scaleSmooth = smooth;

        cc.director.getScheduler().setTimeScale(scale);
        Notifier.send(NotifyID.Time_Scale, scale);
    }

    private updateScale(dt : number) {
        if (!this._scaling) {
            return;
        }
        if (this._time > this._scaleTimeout) {
            this._scaling = false;
            cc.director.getScheduler().setTimeScale(1);
            Notifier.send(NotifyID.Time_Scale, 1);
            return;
        }

        if (this._scaleSmooth) {
            let scale = Math.lerp(this._scale, 1, 1 - (this._scaleTimeout - this._time) / this._scaleDura);
            cc.director.getScheduler().setTimeScale(scale);
            Notifier.send(NotifyID.Time_Scale, scale);
            //cc.log("updateScale", dt, scale);
        }
    }

    public get scale() {
        return cc.director.getScheduler().getTimeScale();
    }
}

export const Time = new _Time();