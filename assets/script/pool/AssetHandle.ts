import { PoolItem } from "../../frame/Pool";
import { Watcher } from "../../frame/Watcher";
import { Time } from "../../frame/Time";

interface HandleMap {
    [key: string]: AssetHandle;
}

//资源申请状态
export enum eAsset {
    //初始化
    Init,
    //待生成
    StartSpawn,
    //待加载
    StartLoad,
    //已生成
    Spawned,
    //待删除
    WaitDel,
    //加载超时
    TimeOut,
    //已删除
    Del
}

export type AssetHandlerCallback = (asset : AssetHandle) => void;

export interface IAssetPool {
    InitPool() : void;
    SetSpawnerGrade(id : number, grade : number) : boolean;
    Clear(grade : number) : boolean;
    Destory() : boolean;

    ContainsKey(id : number) : boolean;
    ReqPreLoad(id : number);
    ReqPreLoad(id : number, num : number, grade : number);
    PreLoad(handle : AssetHandle);

    ReqSpawn(id : number, pos ?: cc.Vec2, rot ?: number, root ?: cc.Node,
                    create ?: AssetHandlerCallback, cParam ?: any, cTarget ?: any,
                    destroy ?: AssetHandlerCallback, dParam ?: any, dTarget ?: any, dDelay ?: number) : AssetHandle;
    Spawn(handle : AssetHandle) : boolean;
    SingleSpawn(handle : AssetHandle);

    Despawn(handle : AssetHandle) : boolean;
    Despawn(handle : AssetHandle, delay : number) : boolean;
    DespawnArray(hanlders : AssetHandle[]);
    DespawnArray(hanlders : AssetHandle[], delay : number);
}

/// <summary>
/// 游戏GameObject资源申请管理类
/// </summary>
export class AssetHandle {
    //资源申请唯一序号生成，自增，拥有资源加载控制
    private static s_index = 0;

    public static Create(pool : IAssetPool, id : number, pos ?: cc.Vec2, rot ?: number, root ?: cc.Node,
                    create ?: AssetHandlerCallback, cParam ?: any, cTarget ?: any,
                    destroy ?: AssetHandlerCallback, dParam ?: any, dTarget ?: any,
                    dDelay ?: number) : AssetHandle {
        let handle = new AssetHandle(pool, id);
        handle.parent = root;
        handle.m_pos = pos || cc.Vec2.ZERO;
        handle.m_rot = rot || 0;
        handle.createCallBack = create;
        handle.createParam = cParam;
        handle.createTarget = cTarget;
        handle.destroyCallBack = destroy;
        handle.destroyParam = dParam;
        handle.destroyTarget = dTarget;
        handle.destroyDelay = dDelay || -1;        
        return handle;
    }

    //Transform InstanceID -> AssetHandler
    private static m_xform2Hanlders : HandleMap = {};

    /// <summary>
    /// 通过instanceID查找AssetHandler
    /// </summary>
    /// <param name="uuid"></param>
    /// <returns></returns>
    public static Get(uuid : string) : AssetHandle {
        let handler = AssetHandle.m_xform2Hanlders[uuid];
        if (handler == null) {
            cc.warn(Time.time, "AssetHandle.Get xform2Hanlders can't find:" + uuid);
        }
        return handler;
    }

    public static Remove(uuid : string) {
        //cc.warn(Time.time, "AssetHandle.Remove", uuid);
        delete AssetHandle.m_xform2Hanlders[uuid];
    }

    public static Clear() {
        cc.warn(Time.time, "AssetHandle.Clear");
        AssetHandle.m_xform2Hanlders = {};
    }

    private constructor(pool : IAssetPool, id : number) {
        this.m_pool = pool;
        this.m_id = id;
        this.m_index = ++AssetHandle.s_index;
        this.m_state = eAsset.Init;

        //ExDebug.Log("AssetHandler id:" + id + " index:" + index, "00BB00");
    }

    //申请的资源id
    private m_id : number;
    public get id() : number {
        return this.m_id;
    }

    //申请的唯一标示
    private m_index : number;
    public get index() {
        return this.m_index;
    }

    private m_pool : IAssetPool;

    //生成的资源
    private m_poolItem : PoolItem;

    public get item() {
        return this.m_poolItem;
    }

    private m_state = eAsset.Init;
    public get state() {
        return this.m_state;
    }

    public IsSucc() {
        return this.m_state == eAsset.Spawned;
    }

    public NeedDespawn() {
        return this.m_state < eAsset.WaitDel && this.destroyDelay <= 0;
    }

    /// <summary>
    /// 加载资源成功后进行设置，返回Transform的唯一id
    /// </summary>
    /// <param name="item"></param>
    /// <returns>0表示设置失败</returns>
    public SetAsset(item : PoolItem) : string {
        if (item == null) {
            cc.error("AssetHandler.SetAsset null id:" + this.id + " index:" + this.index + " SetAsset " + this.state);
            return;
        }
        if (this.m_poolItem != null) {
            cc.error("AssetHandler id:" + this.id + " index:" + this.index + " SetAsset mult times!!!!!!!   " + item);
            return null;
        }
        //cc.log("AssetHandler id:" + this.id + " uuid:" + item.uuid + " index:" + this.index + " SetAsset " + this.state);

        this.m_poolItem = item;
        AssetHandle.m_xform2Hanlders[item.uuid] = this;

        return item.uuid;
    }

    public SetState(state : eAsset) {
        //cc.log("AssetHandler id:" + this.id + " uuid:" + this.uuid + " index:" + this.index + " SetState " + state);
        if (state >= this.m_state) {
            this.m_state = state;
            return true;
        } else {
            cc.error("AssetHandler id:" + this.id + " index:" + this.index + " SetState Error Old:" + this.m_state + " New:" + state);
            return false;
        }
    }

    public get uuid() {
        if (this.m_poolItem == null) {
            return null;
        }
        return this.m_poolItem.uuid;
    }

    public get node() {
        if (this.m_poolItem == null) {
            return null;
        }
        return this.m_poolItem.node;
    }

    //生成资源参数(注意参数不一定有值，使用前需判断)
    //父节点，位置，面向，生成回调及参数，回收回调，回收延迟
    private m_parent : cc.Node;
    public get parent() {
        return this.m_parent; 
    }
    public set parent(value) {
        this.m_parent = value;
        if (this.node != null) {
            this.node.parent = this.m_parent;
        }
    }

    private m_pos : cc.Vec2;
    public get pos() {
        return this.m_pos; 
    }
    public set pos(value) {
        this.m_pos = value;
        if (this.node != null) {
            this.node.position = this.m_pos;
        }        
    }

    private m_rot : number;
    public get rot() {
        return this.m_rot; 
    }
    public set rot(value) {
        this.m_rot = value;
        if (this.node != null) {
            this.node.rotation = this.m_rot;
        }        
    }

    private m_scale : number = 1;
    public get scale() {
        return this.m_scale; 
    }
    public set scale(value) {
        this.m_scale = value;
        if (this.node != null) {
            this.node.scale = this.m_scale;
        }        
    }

    public createCallBack : AssetHandlerCallback;
    public createParam : any;
    public createTarget;

    public destroyCallBack : AssetHandlerCallback;
    public destroyParam : any;
    public destroyTarget;
    public destroyDelay : number = -1;
    public destroyWatcher : Watcher;

    public ReqDespawn(delay = 0) {
        return this.m_pool.Despawn(this, delay);
    }

    private _anim : cc.Animation;
    public get anim() {
        if (this._anim == null) {
            if (!cc.isValid(this.node, true)) {
                cc.error("AssetHandler id:" + this.id + " index:" + this.index + " Animation null", this.node);
                return;
            }
            this._anim = this.node.getComponent(cc.Animation);
        }
        return this._anim; 
    }

    private _widget : cc.Widget;
    public get widget() {
        if (this._widget == null) {
            if (!cc.isValid(this.node, true)) {
                cc.error("AssetHandler id:" + this.id + " index:" + this.index + " Widget null", this.node);
                return;
            }
            this._widget = this.node.getComponent(cc.Widget);
        }
        return this._widget; 
    }

    private _rigidBody : cc.RigidBody;
    public get rigidBody() {
        if (this._rigidBody == null) {
            if (!cc.isValid(this.node, true)) {
                cc.error("AssetHandler id:" + this.id + " index:" + this.index + " RigidBody null", this.node);
                return;
            }
            this._rigidBody = this.node.getComponent(cc.RigidBody);
        }
        return this._rigidBody; 
    }

    private _collider : cc.Collider;
    public get collider() {
        if (this._collider == null) {
            if (!cc.isValid(this.node, true)) {
                cc.error("AssetHandler id:" + this.id + " index:" + this.index + " Collider null", this.node);
                return;
            }
            this._collider = this.node.getComponent(cc.Collider);
        }
        return this._collider; 
    }
}