import { PoolManager, Pool, PoolItem, PoolSpawner } from "../../frame/Pool";
import { Time } from "../../frame/Time";
import { Watcher } from "../../frame/Watcher";
import { IAssetPool, eAsset, AssetHandle, AssetHandlerCallback } from "./AssetHandle";

export type AvatarSpawnCallBack = (param : object) => void;
export type LoadAssetHandler = (name: string, path: string, type: typeof cc.Asset, callback: (name: string, asset: object) => void, target: any ) => void;
export type UnloadAssetHandler = (name: string) => void;

interface HandleMap {
    [key: string]: AssetHandle;
}

interface HandlesMap {
    [key: string]: AssetHandle[];
}

interface NumberMap {
    [key: number]: number;
}

const kTimeOutSecond = 12.0;

/// <summary>
/// 资源加载管理基类
/// </summary>
/// <typeparam name="T">管理器类型</typeparam>
export abstract class AbsAssetPool implements IAssetPool {
    public static s_loadAssetAsyncHandler : LoadAssetHandler;
    public static s_unloadAssetHandler : UnloadAssetHandler;

    protected static kPrefabType = cc.Prefab;

    /// <summary>
    /// 资源目录
    /// </summary>
    protected m_assetDir : string;
    protected m_poolType : string;

    protected m_pool : Pool;
    //资源加载回调Spawn
    protected m_loadingList : HandlesMap = {};

    //资源异步Spawn
    protected m_spawningList : AssetHandle[] = [];
    //资源申请 index -> AssetHandler
    protected m_index2Hanlders : HandleMap = {};
    protected m_cullAbove = -1;

    protected Add_Index2Hanlders(hanlder : AssetHandle) {
        this.m_index2Hanlders[hanlder.index] = hanlder;
    }

    protected Del_Index2Hanlders(hanlder : AssetHandle) {
        //Debug.Log("Del_Index2Hanlders:" + hanlder.ID + " index:" + hanlder.Index + " state:" + hanlder.State);
        //先将标示改为删除，免得外部保存的Hanlder重复删除
        if (hanlder.state < eAsset.Del) {
            hanlder.SetState(eAsset.Del);
        }
        delete this.m_index2Hanlders[hanlder.index];
    }

    protected CheckPool() {
        if (this.m_pool == null || this.m_pool.Root == null) {
            return false;
        }
        return true;
    }

    protected DoSpawn(hanlde : AssetHandle) {
        if (!this.CheckPool()) {
            //池不存在，直接做超时处理，避免回调进程卡死
            this.TimeOut(hanlde);
            return false;
        }
        //取消加载，直接返回
        if (hanlde.state != eAsset.StartLoad && hanlde.state != eAsset.StartSpawn) {
            this.Del_Index2Hanlders(hanlde);
            return true;
        }

        let item = this.m_pool.Spawn(hanlde.id, hanlde.pos, hanlde.rot, hanlde.parent);
        if (item != null) {
            hanlde.SetAsset(item);
            hanlde.SetState(eAsset.Spawned);
            hanlde.scale = hanlde.scale;

            this.DoSpawnEx(hanlde);

            if (hanlde.createCallBack != null) {
                hanlde.createCallBack.call(hanlde.createTarget, hanlde);
            }

            if (hanlde.destroyDelay > 0 && hanlde.destroyWatcher == null) {
                this.DoDelayDespawn(hanlde, hanlde.destroyDelay);
            }
            return true;
        } else {
            //Spwan失败，直接做超时处理，避免回调进程卡死
            this.TimeOut(hanlde);
            return false;
        }
    }

    protected DoDelayDespawn(hanlde : AssetHandle, delay : number) {
        //Debug.Log("DoDespawn:" + hanlde.id + " index:" + hanlde.index + " " + hanlde.state + " " + " " + delay);
        if (delay > 0) {
            if (hanlde.destroyWatcher != null) {
                hanlde.destroyWatcher.Cancal();           
            }
            hanlde.destroyWatcher = Time.delay(delay, this.DoDespawn, hanlde, this);
        } else {
            this.DoDespawn(hanlde);
        }
        return true;
    }

    protected DoDespawn(hanlde : AssetHandle) {        
        this.Del_Index2Hanlders(hanlde);
        if (hanlde.destroyWatcher != null) {
            hanlde.destroyWatcher.Cancal();
            hanlde.destroyWatcher = null;
        }
        if (hanlde.item == null) {
            if (hanlde.destroyCallBack != null) {
                hanlde.destroyCallBack.call(hanlde.destroyTarget, hanlde);
            }
        } else {
            this.m_pool.Despawn(hanlde.item);
        }
    }

    /// <summary>
    /// 超时处理
    /// </summary>
    /// <param name="hanlder"></param>
    protected TimeOut(hanlde : AssetHandle) {
        //cc.log("TimeOut:" + hanlde.id + " index:" + hanlde.index);
        hanlde.SetState(eAsset.TimeOut);
        if (hanlde.createCallBack != null) {
            hanlde.createCallBack.call(hanlde.createTarget, hanlde);
        }
        if (hanlde.destroyCallBack != null) {
            hanlde.destroyCallBack.call(hanlde.destroyTarget, hanlde);
        }
        this.Del_Index2Hanlders(hanlde);
    }

    //用于延迟一帧回调，统一资源为异步处理用 
    private m_isDelaySpawn : Watcher;
    protected OpenDelaySpawn() {
        if (this.m_isDelaySpawn != null) {
            //cc.log(this.m_poolType, "OpenDelaySpawn ready");
            return;
        }
        this.m_isDelaySpawn = Time.delay(0.001, this.DelaySpawn, null, this, -1);
    }

    private DelaySpawn() {
        //cc.log(this.m_poolType, Time.time, "DelaySpawn length:", this.m_spawningList.length);
        if (this.m_spawningList.length <= 0) {
            this.m_isDelaySpawn.Cancal();
            this.m_isDelaySpawn = null;
            //cc.log(this.m_poolType, "DelaySpawn finish");
            return;
        }

        //回调中可能会修改m_spawningList，需要拷贝一份
        let list = copy(this.m_spawningList);
        this.m_spawningList = [];
        list.forEach(hanlder => {
            //因为延迟了一帧，需要判断是否取消加载，预制件是否存在
            if (hanlder.state >= eAsset.Spawned || !this.CheckPrefab(hanlder)) {
                cc.log(this.m_poolType, "DelaySpawn skip:", hanlder.id, hanlder.uuid,hanlder.state);
                return;
            }
            //cc.log(this.m_poolType, "DelaySpawn:", hanlder.id, hanlder.index);
            this.DoSpawn(hanlder);
        });
        //cc.log(this.m_poolType, Time.time, "DelaySpawn over", list.length);
    }

    //延迟一段时间后检查，资源加载是否超时
    protected OpenTimeOutCheck(name : string) {
        Time.delay(kTimeOutSecond, this.OnTimeOutFunc, name, this);
    }

    protected OnTimeOutFunc(name : string) {
        cc.log(this.m_poolType, "OnTimeOutFunc:" + name);
        let list = this.m_loadingList[name];
        if (list == null) {
            return;
        }
        //回调可能会去加载新资源而改变list，所以这边拷贝出来
        let iAssets = copy(list);
        delete this.m_loadingList[name];
        iAssets.forEach(hanlder => {
            switch (hanlder.state) {
                case eAsset.StartLoad:
                case eAsset.StartSpawn:
                    this.TimeOut(hanlder);
                    break;
                //可能是切换材质，与模型共用一个hanlder
                case eAsset.Spawned:
                    this.Despawn(hanlder);
                    break;
                case eAsset.WaitDel:
                    this.Del_Index2Hanlders(hanlder);
                    break;
                default:
                    cc.error("Error LoadingList State:" + hanlder.state + " id:" + hanlder.id + " pool type: " + this.m_pool.Type);
                    break;
            }            
        });
    }

    protected OnPrefabDespawned(item : PoolItem) {
        let hanlder = AssetHandle.Get(item.uuid);
        if (hanlder != null) {
            if (hanlder.destroyCallBack != null) {
                hanlder.destroyCallBack.call(hanlder.destroyTarget, hanlder);
            }
            AssetHandle.Remove(item.uuid);
        } else {
            //可能是切换场景删除了
            cc.warn("hanlder Error:" + item.id, item.uuid, "name:" + item.name);
        }
        //cc.log("OnPrefabDespawned", this);
        if (item.spawnTimes <= 0) {
            this.DelInfo(item);
        } else {
            this.ResetInfo(item);
        }
    }

    protected abstract CheckPrefab(hanlde : AssetHandle) : boolean;

    protected PrefabCallback(name : string, asset : cc.Node) : void {
        if (asset == null) {
            this.OnTimeOutFunc(name);
            return;
        }

        let list = this.m_loadingList[name];
        if (list == null) {
            return;
        }
        delete this.m_loadingList[name];

        list.forEach(hanlder => {
            if (!this.m_pool.CheckPrefab(hanlder.id)) {
                let preloadCount = this.m_preloads[hanlder.id] || 1;
                let cullAbove = this.m_cullAboves[hanlder.id] || 0;
                let grade = this.m_grades[hanlder.id] || 0;
                this.m_pool.CreateSpawner(hanlder.id, asset, this.PrefabCreateDelegate, this.OnPrefabDespawned, preloadCount, cullAbove, grade);
            }
            this.DoSpawn(hanlder);
        });
    }

    protected PrefabCreateDelegate(id : number, inst : cc.Node, spawner : PoolSpawner) : PoolItem {
        return new PoolItem(id, inst, spawner);
    }

    protected DelInfo(item : PoolItem) {
        if (item != null) {
            AssetHandle.Remove(item.uuid);
        }
    }

    protected ResetInfo(item : PoolItem) {

    }

    protected DoSpawnEx(hanlder : AssetHandle) {

    }

    protected abstract OnDelSpawner(id : number);

    public abstract InitPool();

    public ContainsKey(id : number) : boolean {
        return this.CheckPool() && this.m_pool.CheckPrefab(id);
    }

    public Spawn(hanlde : AssetHandle) : boolean {
        //cc.log(this.m_poolType, "Spawn:" + hanlde.id + " index:" + hanlde.index, hanlde.state, Time.time, this.CheckPrefab(hanlde));
        if (!this.CheckPool()) {
            //InitPool();
            //池不存在，直接做超时处理
            this.TimeOut(hanlde);
            return false;
        }
        if (!hanlde.SetState(eAsset.StartSpawn)) {
            cc.log("Spawn state skip:" + hanlde.id + " index:" + hanlde.index, hanlde.state);
            return false;
        }
        this.Add_Index2Hanlders(hanlde);
        if (this.CheckPrefab(hanlde)) {
            this.m_spawningList.push(hanlde);
            this.OpenDelaySpawn();
            //cc.log(this.m_poolType, "Spawn add spawningList:" + this.m_spawningList.length);
        }
        return true;
    }

    /// <summary>
    /// AssetHandler.ID => AssetHandler
    /// </summary>
    protected m_singleHanlders : HandleMap = {};

    /// <summary>
    /// 单例生成资源，简单实现：缓存已经生成的资源，在再次申请时先回收上次资源
    /// </summary>
    /// <param name="hanlder"></param>
    public SingleSpawn(hanlde : AssetHandle) {
        let existHanlder = this.m_singleHanlders[hanlde.id];
        if (existHanlder != null) {
            if (existHanlder != hanlde) {
                this.Despawn(existHanlder);
            }
            this.Spawn(hanlde);
        } else {
            this.Spawn(hanlde);
        }
        this.m_singleHanlders[hanlde.id] = hanlde;
    }

    public Despawn(hanlde : AssetHandle, delay = 0) {
        if (hanlde == null) {
            cc.warn(this.m_poolType + " ReqDespawn hanlder null");
            return false;
        }
        if (!this.CheckPool()) {
            hanlde.SetState(eAsset.Del);
            if (hanlde.node != null) {
                cc.error(this.m_poolType, "Despawn Pool not exist", hanlde.id)
                hanlde.node.destroy();                
            }
            return false;
        }
        let ret = true;
        switch (hanlde.state) {
            case eAsset.Init:
                //ExDebug.LogError("ReqDespawn Hanlder never Spawn!!!! id:" + hanlder.id + " index:" + hanlder.index);
                ret = false;
                break;
            case eAsset.StartLoad:
            case eAsset.StartSpawn:
                if (delay > 0) {
                    this.DoDelayDespawn(hanlde, delay);
                } else {
                    hanlde.SetState(eAsset.WaitDel);
                }
                break;
            case eAsset.Spawned:
                this.DoDelayDespawn(hanlde, delay);
                break;
            case eAsset.TimeOut:
            //TimeOut状态只存在一瞬间，应该不会进入这里，除非回调函数没检查状态又进行调用
            //ret = false;
            //break;
            case eAsset.WaitDel:
            case eAsset.Del:
                //ExDebug.LogWarning("ReqDespawn Mult Times!!!!! Hanlde id:" + hanlde.id + " index:" + hanlde.index + " state:" + hanlde.state);
                ret = false;
                break;
        }
        //Debug.Log("ReqDespawn:" + hanlde.id + " index:" + hanlde.index + " " + hanlde.state + " " + ret + " " + delay);
        return ret;
    }

    /// <summary>
    /// id -> preloadCount
    /// </summary>
    protected m_preloads : NumberMap = {};

    /// <summary>
    /// id -> preloadCount
    /// </summary>
    protected m_cullAboves  : NumberMap = {};

    /// <summary>
    /// 预加载资源
    /// </summary>
    /// <param name="id"></param>
    public ReqPreLoad(id : number, num = 0, grade = 0) {
        if (id == 0) {
            return;
        }
        
        this.m_preloads[id] = num;
        let hanlder = AssetHandle.Create(this, id);
        this.Spawn(hanlder);
        this.Despawn(hanlder);        
        this.SetSpawnerGrade(id, grade);
    }

    public PreLoad(hanlder : AssetHandle) {
        this.Spawn(hanlder);
        this.Despawn(hanlder);        
    }

    /// <summary>
    /// id -> grade
    /// </summary>
    protected m_grades : NumberMap = {};

    public SetSpawnerGrade(id : number, grade : number) : boolean {
        let spawner = this.m_pool.GetSpawner(id);
        if (spawner != null) {
            spawner.grade = grade;
            return true;
        } else {
            this.m_grades[id] = grade;
            return false;
        }
    }

    public DespawnAll( ) : boolean {
        if (!this.CheckPool()) {
            return false;
        }

        this.m_pool._DespawnAll();
        return true;
    }

    public Clear(grade : number) : boolean {
        if (!this.CheckPool()) {
            return false;
        }
        this.m_loadingList = {};
        this.m_spawningList = [];

        this.m_index2Hanlders = {};
        this.m_singleHanlders = {};

        PoolManager.clear(this.m_poolType, grade);
        cc.error(this.m_poolType, "Clear");
        return true;
    }

    public Destory() : boolean {
        if (!this.CheckPool()) {
            return false;
        }
        this.m_loadingList = {};
        this.m_spawningList = [];

        this.m_index2Hanlders = {};
        this.m_singleHanlders = {};

        PoolManager.destory(this.m_poolType);
        cc.error(this.m_poolType, "Destory");
        return true;
    }

    public ReqSpawn(id : number, pos ?: cc.Vec2, rot ?: number, root ?: cc.Node,
            create ?: AssetHandlerCallback, cParam ?: any, cTarget ?: any,
            destroy ?: AssetHandlerCallback, dParam ?: any, dTarget ?: any, dDelay ?: number) : AssetHandle {
        let hanlder = AssetHandle.Create(this, id, pos, rot, root, create, cParam, cTarget, destroy, dParam, dTarget, dDelay);
        this.Spawn(hanlder);
        return hanlder;
    }

    public DespawnArray(hanlders : AssetHandle[]) {
        if (hanlders == null) {
            return;
        }
        hanlders.forEach(hanlder => {
            this.Despawn(hanlder);            
        });
    }

    /// <summary>
    /// 这个函数主要是脱手技能
    /// </summary>
    /// <param name="hanlders"></param>
    /// <param name="delay"></param>          
    public ReqDespawnArray(hanlders : AssetHandle[], delay = 0) {
        if (hanlders == null || hanlders.length == 0) {
            return;
        }
        //cc.log("ReqDespawnArray:" + hanlders[0].id + " delay:" + delay);
        hanlders.forEach(hanlder => {
            if (hanlder != null && hanlder.node != null) {
                /// 注意:必须先脱离原来的Parent，如脱手技能.防止技能时间比特效时间短，导致显示异常的问题
                hanlder.node.parent = this.m_pool.Root;
            }
            this.Despawn(hanlder, delay);            
        });
    }

}