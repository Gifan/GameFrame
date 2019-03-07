import { Time } from "../Time";
import { Notifier } from "../mvcs/Notifier";
import { NotifyID } from "../mvcs/NotifyID";

export enum AnimState {
    /// <summary>
    /// 待机
    /// </summary>
    Idle,
    /// <summary>
    /// 移动
    /// </summary>
    Move,
    /// <summary>
    /// 跳跃
    /// </summary>
    Jump,
    /// <summary>
    /// 展示动作
    /// </summary>
    Show,
    /// <summary>
    /// 受击，爬起
    /// </summary>
    Hit,
    /// <summary>
    /// 死亡只有状态标识，没有动作
    /// </summary>
    Die,
    /// <summary>
    /// 技能动作
    /// </summary>
    Skill,
    /// <summary>
    /// 施法恢复，收招
    /// </summary>
    Restore,
}

export enum AnimIdle {
    idle,
}

export enum AnimMove {
    run,
    //walk,
}

export enum AnimJump {
    jump3,
    jump1,
    jump2,
}

export enum AnimShow {
    /// <summary>
    /// 登场
    /// </summary>
    debut,
    /// <summary>
    /// 胜利
    /// </summary>
    win,
}

export enum AnimHit {
    /// <summary>
    /// 轻受击
    /// </summary>
    hit,
    hit1,
    hit2,
    hit3,
}

export enum AnimDie {
    /// <summary>
    /// 死亡
    /// </summary>
    death,
}

//动画控制
export class AnimStub {
    private _name : string = "unknown";
    private _uuid : string;
    private _spine : sp.Skeleton;
    private _speed = 1;

    public constructor(node : cc.Node, spine : sp.Skeleton) {
        if (node == null) {
            cc.error("AnimStub.Create node null")
            return;
        }
        this._name = node.name;
        this._uuid = node.uuid;
        this._spine = spine;        
        this._spine.setCompleteListener(this.onStateEnd.bind(this));
        this._spine.timeScale = this._speed * Time.scale;
        Notifier.addListener(NotifyID.Time_Scale, this.onTimeScale, this);
        //this._spine.debugBones = true;
    }

    private checkAnimator() : boolean {
        if(this._spine == null) {
            cc.error(this._name + " _spine is Null");
            return false;
        }
        return true;
    }

    public get node() {
        return this._spine.node;
    }

    public get spine() {
        return this._spine;
    }

    /// <summary>
    /// 设置播放速度,范围[0~1]
    /// </summary>
    /// <param name="speed"></param>
    public setSpeed(speed : number) {
        if(!this.checkAnimator()) {
            return;
        }
        this._speed = speed;
        this._spine.timeScale = speed * Time.scale;
    }

    private onTimeScale(scale : number) {
        this._spine.timeScale = this._speed * scale;
    }

    protected play(name : string, loop = false, layer = 0) {
        if(!this.checkAnimator()) {
            return;
        }
        this._spine.setAnimation(layer, name, loop);
    }

    private _playState(state : AnimState, index : number, name : string, loop = false, layer = 0) {
        //cc.log(this._name, "_playState", state, name, index);
        this.play(name, loop, layer);
        this.stateBegin(state, index, name);
    }

    private _animState : AnimState = AnimState.Idle;
    public get animState() {
        return this._animState;
    }

    public changeState(state : AnimState) {
        this._animState = state;
    }

    private _animIndex : number = 0;
    public get animIndex() {
        return this._animIndex;
    }

    private _animName : string = null;
    public get animName() {
        return this._animName;
    }    

    private stateBegin(state : AnimState, index : number, name : string) {
        this.stateEndEvent(true);

        this.setMix(this._animName, name);

        this._animState = state;
        this._animIndex = index;
        this._animName = name;

        this.stateBeginEvent();
    }

    // private onStateEnd(trackEntry : sp.spine.TrackEntry) {
    private onStateEnd(trackEntry) {
        if (this._animName == null) {
            return;
        }

        this.stateEndEvent(false);
    }

    private _animMixs = {};
    private setMix(name1 : string, name2 : string) {
        if (name1 == null || name2 == null) {
            return;
        }
        let mix = this._animMixs[name1];
        if (mix == null) {
            mix = {};
            this._animMixs[name1] = mix;
        }
        let time = mix[name2];
        if (time == null) {
            time = 0;
            mix[name2] = 0;
            this._spine.setMix(name1, name2, 0);
        }
    }

    /// <summary>
    /// 开始动作回调
    /// </summary>
    private stateBeginEvent() {
        // switch (this._animState) {
        //     case AnimState.Idle:
        //         break;
        //     case AnimState.Move:
        //         break;
        //     case AnimState.Show:
        //         break;
        //     case AnimState.Hit:
        //         break;
        //     case AnimState.Skill:
        //         break;
        //     case AnimState.Restore:
        //         break;
        //     case AnimState.Die:
        //         break;
        //     default:
        //         break;
        // }
    }

    /// <summary>
    /// 动画结束回调
    /// </summary>
    /// <param name="isBreak">是否被打断</param>
    private stateEndEvent(isBreak : boolean) {
        //cc.log("stateEndEvent", isBreak, this._animState);
        switch (this._animState) {
            case AnimState.Idle:
                break;
            case AnimState.Move:
                break;
            case AnimState.Jump:
                break;
            case AnimState.Show:
                this.onShowEnd(isBreak);
                break;
            case AnimState.Hit:
                this.onHitEnd(isBreak);
                break;
            case AnimState.Skill:
                break;
            case AnimState.Restore:
                this.onRestoreEnd(isBreak);
                break;
            case AnimState.Die:
                this.onDieEnd(isBreak);
                break;
            default:
                break;
        }
        this._animName = null;
    }

    private _defaultLoop = false;
    private _defaultState : AnimState = AnimState.Idle;
    private _defaultIndex : number = AnimIdle.idle;
    private _defaultAnim : string = AnimIdle[AnimIdle.idle];
    public setDefaultState(state : AnimState, index : number, anim : string, loop = true) {
        this._defaultState = state;
        this._defaultIndex = index;
        this._defaultAnim = anim;
        this._defaultLoop = loop;
    }

    public backToDefault() {
        //cc.error(this._name, Time.time, "backToDefault", this._defaultState, this._defaultIndex, this._defaultAnim, this._animState, this._animName);            
        //this._playState(this._defaultState, this._defaultIndex, this._defaultAnim, this._defaultLoop);
        this.stateBegin(this._defaultState, this._defaultIndex, this._defaultAnim);
        this.setSpeed(1);
    }

    /// <summary>
    /// 切换待机动作
    /// </summary>
    /// <param name="e">类型</param>
    public playIdle(e : AnimIdle = AnimIdle.idle) {
        this._playState(AnimState.Idle, e, AnimIdle[e], this._defaultLoop);
    }

    /// <summary>
    /// 切换移动动作
    /// </summary>
    public playMove(e : AnimMove = AnimMove.run) {
        this._playState(AnimState.Move, e, AnimMove[e], true);
    }

    /// <summary>
    /// 切换跳跃动作
    /// </summary>
    public playJump(e : AnimJump = AnimJump.jump3) {
        //cc.log("playJump", AnimJump[e]);
        this._playState(AnimState.Jump, e, AnimJump[e], e == AnimJump.jump3);
    }

    /// <summary>
    /// 切换展示动作
    /// </summary>
    public playShow(e : AnimShow) {
        this._playState(AnimState.Show, e, AnimShow[e], false);
    }

    private _showAnims : string[];
    private _showFinishCallback : (isBreak : boolean, param : any) => boolean;
    private _showFinishTarget : any;
    private _showFinishParam : any;

    /// <summary>
    /// 播放多个展示动作
    /// </summary>
    /// <param name="callback">完成回调，返回结果表示是否切换为待机</param>
    public playShows(names : string[], callback : (isBreak : boolean, param : any) => boolean = null, target = null, param = null) {
        if (names == null)        {
            return;
        }
        this._playState(AnimState.Show, 0, this._showAnims[0], false);
        this._showAnims = names;
        this._showFinishCallback = callback;
        this._showFinishTarget = target;
        this._showFinishParam = param;
    }

    private onShowEnd(isBreak : boolean) {
        //Debug.Log("OnShowEnd");
        if (isBreak) {
            this._showAnims = null;
            this._showFinishCallback = null;
            this._showFinishTarget = null;
            this._showFinishParam = null;
            return;
        }
        if (this._showAnims == null) {            
            this.backToDefault();            
            return;
        }

        let index = this._animIndex + 1;
        if (this._showAnims.length > index) {
            this._playState(AnimState.Show, index, this._showAnims[index], false);
        } else {
            if (this._showFinishCallback != null) {
                let restore = this._showFinishCallback.call(this._showFinishTarget, this._showFinishParam);
                if (restore) {
                    this.backToDefault();
                }
            } else {
                this.backToDefault();
            }

            this._showAnims = null;
            this._showFinishCallback = null;
            this._showFinishTarget = null;
            this._showFinishParam = null;
        }
    }

    /// <summary>
    /// 切换受击动作
    /// </summary>
    public playHit(e : AnimHit = AnimHit.hit) {
        this._playState(AnimState.Hit, e, AnimHit[e], false);
    }

    private onHitEnd(isBreak : boolean) {
        //cc.log("OnHitEnd");
        if (isBreak) {
            return;
        }

        switch (this._animIndex) {
            case AnimHit.hit:
            case AnimHit.hit1:
            case AnimHit.hit2:
            case AnimHit.hit3:
                this.backToDefault(); 
                break;        
            default:
                this.backToDefault(); 
                cc.error("OnHitEnd error animIndex", this._animIndex);
                break;
        }
    }

    public playDie(e : AnimDie = AnimDie.death, callback : Function = null) {
        this._onDieCallback = callback;
        this._playState(AnimState.Die, e, AnimDie[e], false);
    }

    private _onDieCallback : Function = null;
    protected onDieEnd(isBreak : boolean) {
        //cc.log("OnDieEnd");
        if (isBreak) {
            return;
        }

        if (this._onDieCallback != null) {
            this._onDieCallback();
            this._onDieCallback = null;
        }
    }

    public playSkill(id : number, name : string, loop = false) {
        this._playState(AnimState.Skill, id, name, loop);
    }

    public playRestore(id : number, name : string) {
        this._playState(AnimState.Restore, id, name, false);
    }

    protected onRestoreEnd(isBreak : boolean) {
        //cc.log("OnDieEnd");
        if (isBreak) {
            return;
        }

        this.backToDefault(); 
    }
}
