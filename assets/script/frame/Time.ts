
import { ObjectPool } from "./collections/ObjectPool";
import { MinSortList } from "./collections/MinSortList";
import { Watcher } from "./Watcher";
import { Notifier } from "./Notifier";
import { NotifyID } from "./NotifyID";
import NetAdapter from "../adpapter/NetAdapter";
import { ListenID } from "../ListenID";

class _Time {
    private _time: number = 0;
    //游戏启动的时间
    public get time(): number {
        return this._time;
    }

    private _deltaTime: number = 0;
    //上一帧的时间
    public get deltaTime(): number {
        return this._deltaTime;
    }

    private _frameCount: number = 0;
    //游戏经过的帧数
    public get frameCount(): number {
        return this._frameCount;
    }

    private _clientTimeMs: number = 0;
    //客户端时间，毫秒
    public get clientTimeMs(): number {
        return this._clientTimeMs;
    }

    private _clientDate: Date = new Date();
    //客户端日期
    public get clientDate(): Date {
        return this._clientDate;
    }

    private _serverUpdateMs: number = 0;
    private _serverInitMs: number = 0;
    private _serverTimeMs: number = 0;
    private _gameTime: number = 0;

    constructor() {
        Notifier.changeListener(true, NotifyID.Game_onHide, this.onHideCallBack, this);
    }

    private _isUpdateServerTime: boolean = true;
    public onHideCallBack() {
        this._isUpdateServerTime = false;
    }

    //服务器时间，毫秒
    public get serverTimeMs(): number {
        this._serverTimeMs = this._serverInitMs + Date.now() - this._serverUpdateMs;
        return this._serverTimeMs;
    }

    /** 获取服务器时间，如果是真服务器时间，则走then，否则走catch */
    public getServetTime(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (this._isUpdateServerTime) {
                resolve(this.serverTimeMs);
            } else {
                this.updateServerTime().then(resolve).catch(reject);
            }
        });
    }
    public getServetTime1(suc, eff) {
        if (this._isUpdateServerTime) {
            suc(this.serverTimeMs);
        } else {
            this.updateServerTime();
            eff();
        }
    }

    /** 矫正服务器时间，防止且后台更换时间刷 */
    public updateServerTime(): Promise<any> {
        return new Promise((resolve, reject) => {
            NetAdapter.getServerTime().then(res => {
                if (res && res.data) {
                    Time.setServerTime(res.data.timestamp * 1000);
                    this._isUpdateServerTime = true;
                    resolve();
                } else {
                    let time = Date.now();
                    Time.setServerTime(time);
                    this._isUpdateServerTime = false;
                    this.tokenExpire -= 60;
                    reject();
                }
            }).catch(err => {
                this._isUpdateServerTime = false;
                reject();
            });
        });
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

    public update(dt: number) {
        this._frameCount += 1;
        if (this.isgetToken) {
            this.tokenExpire -= dt;
            if (this.tokenExpire < 300 && this.getTokenState != 1) {
               Notifier.send(ListenID.Sdk_UpdateToken);
                this.getTokenState = 1;
            }
        }
        if (this._scaling) {
            dt *= this.scale;
        }
        this._deltaTime = dt;
        if (this._isPause) {
            return;
        }
        this._time += dt;
        this._gameTime += dt;
        // this._clientDate = new Date();
        // this._clientTimeMs = Date.now();
        // this._serverTimeMs = this._serverInitMs + this._clientTimeMs - this._serverUpdateMs;

        //cc.log("_Time.update", dt, this._time, this._frameCount, this._clientTimeMs);

        //更新定时器
        let times = 0;
        this.updateScale(dt);
        if (Notifier.isExist(NotifyID.Game_Update)) {
            Notifier.send(NotifyID.Game_Update, dt);
        }

        while (true) {
            let first = this._watchers.peek();
            if (first == null || first.nextTime > this._time) {
                break;
            }
            // cc.log(this._frameCount + " " + this._time + "\n" + first.toString());
            this._watchers.pop();
            first._CallBack();
            if (first.enable) {
                this._watchers.add(first);
            } else {
                // this._pool.push(first);
            }
            ++times;
            if (times > 5000) {
                cc.error("watchers too many! frist:" + first.toString());
                break;
            }
        }
    }

    public setServerTime(timeMs: number) {
        this._serverTimeMs = timeMs;
        this._serverInitMs = timeMs;
        this._serverUpdateMs = Date.now();
    }

    private compareTime(left: Watcher, right: Watcher) {
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
    public delay(delay: number, callback: (arg: any) => void, arg: any = null, target = null, times = 1): Watcher {
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

    public doCancal(watcher: Watcher) {
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
    public setScale(scale: number, dura: number, smooth = true) {
        this._scaling = true;
        this._scale = scale;
        this._scaleDura = dura;
        this._scaleTimeout = this._time + dura;
        this._scaleSmooth = smooth;

        cc.director.getScheduler().setTimeScale(scale);
        Notifier.send(NotifyID.Time_Scale, scale);
    }

    private updateScale(dt: number) {
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
        }
    }

    public get scale() {
        return cc.director.getScheduler().getTimeScale();
    }

    public get isScaling(): boolean {
        return this._scaling;
    }

    public startGameTimeLog() {
        this._gameTime = 0;
    }

    /**
     * 游戏开始总时长
     */
    public get gameTime(): number {
        return this._gameTime;
    }

    public tokenExpire: number = 3600;
    public isgetToken: boolean = false;
    public getTokenState: number = 0;//0未获取 1获取中 2已获取
    public initTokenTime() {
        this.getTokenState = 2;
        this.tokenExpire = 3600;//s
        this.isgetToken = true;
    }
}

export const Time = new _Time();