import { Time } from "./Time";
import { Watcher } from "./Watcher";

interface PoolMap {
    [key: string]: Pool;
}

class _PoolManager {
    m_pools : PoolMap = {};

    public isExist(poolType : string) : boolean {
        return this.m_pools[poolType] != null;
    }

    /// <summary>
    /// 创建一类池
    /// </summary>
    /// <param name="poolType">池类型</param>
    /// <param name="groupNode">池实例对象挂载点，为null时会自动生成</param>
    /// <returns></returns>
    public create(poolType : string, target, groupNode : cc.Node = null) : Pool {
               
        try {            
            let pool : Pool = this.m_pools[poolType];
	        if (pool != null) {
                cc.error("Pool has Created:" + poolType);
                return pool;
	        }

            if (target == null) {
                cc.error("PoolManager.create target null", poolType)
            }     

	        /// 创建2个节点，一个是Pool，用于对象，一个是Prefab，存加载好的Prefab
	        let poolGO : cc.Node = null;
	        if (groupNode == null) {
                poolGO = new cc.Node(poolType);
                
	        } else {
	            poolGO = groupNode; ///外面来的跟节点就不改名字了 
	        }
            poolGO.position = cc.Vec2.ZERO;
            poolGO.rotation = 0;

	        pool = poolGO.addComponent(Pool);
            pool.Type = poolType;
            pool.Root = poolGO;
            pool.target = target;



            pool.DontDestroyOnLoad();
	        this.m_pools[poolType] = pool;
	        return pool;
        } catch (ex) {
            cc.error(ex);
        }
        return null;
    }

    /// <summary>
    /// 删除池
    /// </summary>
    /// <param name="poolType"></param>
    public destory(poolType) {
        let pool : Pool = this.m_pools[poolType];
        if (pool == null) {
            cc.error("Destory Pool no exist:" + poolType);
            return ;
        }
        delete this.m_pools[poolType];
        pool._Destory();
    }

    /// <summary>
    /// 清理池内的实例
    /// </summary>
    /// <param name="poolType"></param>
    /// <param name="grade">大于这个数的将被清理</param>
    public clear(poolType : string, grade : number) {
        let pool : Pool = this.m_pools[poolType];
        if (pool == null) {
            cc.error("Clear Pool no exist:" + poolType)
            return;
        }
        pool._Clear(grade);
    }

    public checkUnClear() {
        for (const key in this.m_pools) {
            const pool = this.m_pools[key];
            if (pool.Root == null) {
                continue;
            }
            if (pool.Root.childrenCount == 0) {
                continue;
            }
            ///如果这里报Log，表明有Pool在切场景的时候没有被调用Clear方法
            cc.warn("Pool wasn't cleared: " + key);
            cc.warn("First child:" + pool.Root.children[0].name);
        }
    }
}

export const PoolManager = new _PoolManager();

/// <summary>
/// 池的Despawned回调
/// 因为inst可能被外部删除，缓存数据需要删除请使用instanceID
/// </summary>
export type PoolDespawnDelegate = (data : PoolItem) => void;

/// <summary>
/// 实例创建数据回调，用于扩展数据支持，返回继承InstData的数据
/// </summary>
/// <param name="id"></param>
/// <param name="inst"></param>
/// <param name="spawner"></param>
/// <returns></returns>
export type PoolCreateDelegate = (id : number, inst : cc.Node, spawner : PoolSpawner) => PoolItem;

const {ccclass, property} = cc._decorator;

interface PoolSpawnerMap {
    [key: number]: PoolSpawner;
}

/*
@<Brief>: Pool处理同一类型的对象的对象池 
* 使用方法
* Manger用Create得到Pool对象，
* Pool调用CreateSpawner构建Prefab
* 用Spawn得到对象，Despawn销毁

    * 类之间的关系
    * PoolManager负责管理多个Pool，一个Pool对应一大类物件，如FX，Item
    * Pool有多个Spawner，每个Spawner对应确定的一种Prefab或者类，如XXXFX，XXXItem
    * Pool.Spawn -> Spawner.Spawn -> Spawner.SpawnNew 或者 从池里面拿出来一个旧的
    * Pool.Despawn流程相同
*/
@ccclass
export class Pool extends cc.Component {
    /// <summary>
    /// 生成的东西的localScale统一为One
    /// </summary>
    public MatchScale = false;

    /// <summary>
    /// 生成的东西的Layer统一为这个Pool自己的Layer
    /// </summary>
    public MatchLayer = false;

    /// <summary>
    /// 生成的东西回收后设置SetActive(false)
    /// 主要是特效类，方便重新播放 
    /// </summary>
    public BackActive = true;

    /// <summary>
    /// 池最大Prefab种类数，-1表示无限
    /// </summary>
    public ClearAbove = -1;

    /// <summary>
    /// 每次最大清除数量
    /// </summary>
    public ClearMaxPer = 5;

    public onDelSpawner : (times : number) => void;
    public target;

    /// <summary>
    /// The time in seconds to stop waiting for particles to die.
    /// A warning will be logged if this is triggered.
    /// </summary>
    public Type : string;

    /// <summary>
    /// 挂载Prefab根节点，也是Pool脚本挂载的位置
    /// </summary>
    public Root : cc.Node;

    /// <summary>
    /// 未使用实例的位置
    /// </summary>
    public GroupPosition = cc.v2(1000, 1000);

    public GetPrefab(id : number) : cc.Node {
        let spawner = this.m_spawners[id];
        if (spawner == null) {
            cc.error("Pool.getPrefab null", this.Type, id);
            return null;
        }
        return spawner.Prefab;
    }

    public CheckPrefab(id : number) : boolean {
        return this.m_spawners[id] != null;
    }

    public GetSpawner(id : number) : PoolSpawner {
        let spawner = this.m_spawners[id];
        if (spawner == null) {
            cc.warn("Pool.getSpawner null", this.Type, id);
            return null;
        }
        return spawner;
    }

    //Key通常是表的ID，Value对应表的一行的Prefab
    private m_spawners : PoolSpawnerMap = {};

    public GetDatas() : PoolItem[] {
        let datas = [];
        for (const key in this.m_spawners) {
            const spawner = this.m_spawners[key];
            datas.push(toArray(spawner.spawneds));
        }
        return datas;
    }

    public DontDestroyOnLoad() {
        cc.game.addPersistRootNode(this.Root);
    }

    /// <summary>
    /// 内部函数，必须通过PoolManager调用
    /// </summary>
    public _DespawnAll( ) {
        if (this.Root == null) {
            cc.error(this.Type + " is Null:Clear");
            return;
        }

        let spawners = toArray<PoolSpawner>(this.m_spawners);
        spawners.forEach(spawner => {
            spawner.DespawnAll();            
        });
    }

    /// <summary>
    /// 内部函数，必须通过PoolManager调用
    /// </summary>
    public _Clear(grade : number) {
        if (this.Root == null) {
            cc.error(this.Type + " is Null:Clear");
            return;
        }

        let spawners = toArray<PoolSpawner>(this.m_spawners);
        spawners.forEach(spawner => {
            if (grade >= spawner.grade) {
                delete this.m_spawners[spawner.Id];
                //删掉创建的Inst与预制件
                spawner.destory();
            } else {
                //降低优先级，防止一直占据内存
                --spawner.grade;
            }
        });
    }

    /// <summary>
    /// 内部函数，必须通过PoolManager调用
    /// </summary>
    public _Destory() {
        if (this.Root == null) {
            cc.error(this.Type + " is Null: Destroy");
            return;
        }
        //停止延迟回收的Coroutine，不然逻辑就有问题
        this.unscheduleAllCallbacks();

        for (const key in this.m_spawners) {
            const spawner = this.m_spawners[key];
            spawner.destory();
        }
        this.m_spawners = null;

        if (this.Root != null) {
            this.Root.destroy();
            this.Root = null;
        }
    }

    /// <summary>
    /// 创建池的预制件
    /// </summary>
    /// <param name="id">唯一标示id，一般是csv_id</param>
    /// <param name="prefab"></param>
    /// <returns></returns>
    public CreateSpawner(id : number, prefab : cc.Node, onSpawn : PoolCreateDelegate = null,
                onDespawned : PoolDespawnDelegate = null, preloadCount = 1, cullAbove = -1, grade = 0) : PoolSpawner {
        //cc.log(this.Type + " CreateSpawner id:" + id + " " + prefab);
        if (this.Root == null) {
            cc.error(this.Type + " is Null, CreateSpawner id:" + id);
            return null;
        }
        this.smoothClear();
        let spawner : PoolSpawner = this.m_spawners[id];
        if (spawner != null) {
            cc.error(this.Type + " CreateSpawner twice id:" + id);
            return spawner;
        }

        spawner = new PoolSpawner(id, prefab, this, onSpawn, onDespawned, preloadCount, cullAbove);
        spawner.grade = grade;
        this.m_spawners[spawner.Id] = spawner;
        spawner.PreloadInstances();

        return spawner;
    }

    public DelSpawner(id : number) {
        //cc.log(this.Type + " DelSpawner id:" + id);
        let spawner : PoolSpawner = this.m_spawners[id];
        if (spawner == null) {
            cc.error(this.Type + " DelSpawner Null id:" + id);
            return;
        }
        spawner.destory();
        delete this.m_spawners[id];
    }

    //按最后使用时间排序
    private poolSpawnerComparer(spawner1 : PoolSpawner, spawner2 : PoolSpawner) : number {
        return spawner1.lastSpawnTime - spawner2.lastSpawnTime;
    }

    private smoothClear() {
        if (this.ClearAbove < 0) {
            return;
        }        
        let num = 0;
        let clearList : PoolSpawner[] = [];
        for (const key in this.m_spawners) {
            const spawner = this.m_spawners[key];
            if (spawner.clearing) {
                continue;
            }
            ++num;
            //将没有使用的低优先级的加入清除队列
            if (spawner.grade == 0 && spawner.spawneds.length == 0) {
                clearList.push(spawner);
            }
        }

        //判断实际使用中的数量
        if (num < this.ClearAbove || clearList.length == 0) {
            return;
        }
        num = 0;
        clearList.sort(this.poolSpawnerComparer);
        for (let index = 0; index < clearList.length; index++) {
            const spawner = clearList[index];
            spawner.SmoothClear();
            ++num;
            //每次最多清除固定数量，防止卡顿
            if (num >= this.ClearMaxPer) {
                break;
            }
        }
    }

    public Spawn(id : number, pos = cc.Vec2.ZERO, rot = 0, parent : cc.Node = null) : PoolItem {
        if (this.Root == null) {
            cc.error(this.Type + " is Null, Spawn id:" + id);
            return null;
        }
        // if (this.Type == "ActorPool") {
        //     cc.warn("Pool.Spawn", this.Type, id);            
        // }

        let spawner = this.m_spawners[id];
        if (spawner == null) {
            cc.error(this.Type + " Can't Find Spawner id:" + id);
            return null;
        }
        return spawner.SpawnInstance(pos, rot, parent);
    }

    public Despawn(data : PoolItem) {
        this.despawn(data, false);
    }

    private despawn(data : PoolItem, destroy : boolean) {
        if (data == null) {
            cc.error(this.Type + " data is Null");
            return;
        }

        // if (this.Type == "ActorPool") {
        //     cc.warn("Pool.despawn", this.Type, data.id, "spawnTimes:", data.spawnTimes);
        // }

        if (data.spawnTimes <= 0) {
            //Debug.LogError(Type + " data is Clear:" + data.Id);
            return;
        }

        if (this.Root == null) {
            cc.error(this.Type + " is Null, despawn id:" + data.id + " inst:" + data.uuid);
            return;
        }

        if (!data.spawned) {
            cc.warn(this.Type + " despawn mult, id:" + data.id + " inst:" + data.uuid);
            return;
        }

        try {
            //只有destroy时spawner才会调用Pool的RemoveData函数来删除data
            if (data.spawner != null) {
                data.spawner.DespawnInstance(data, destroy);

                //已经没有使用中的实例，检查一次清除
                if (data.spawner.spawneds.length == 0) {
                    this.smoothClear();
                }
            } else {
                cc.error(this.Type + " spawner is Null!! id:" + data.id + "instanceID:" + data.uuid);
            }
        } catch (ex) {
            cc.error(ex);
        }
    }

    /// <summary>
    /// 延迟一段时间后回收
    /// </summary>
    /// <param name="PoolItem">回收对象</param>
    /// <param name="seconds">延迟时间</param>
    public DelayDespawn(data : PoolItem, seconds : number) {
        if (data == null) {
            cc.error(this.Type + " data is Null");
            return;
        }

        if (this.Root == null) {
            cc.error(this.Type + " is Null, DelayDespawn id:" + data.id + " inst:" + data.uuid);
            return;
        }
        let times = data.spawnTimes;
        Time.delay(seconds, this.onDelayDespawn, [data, times], this);
    }

    private onDelayDespawn([data, times] : [PoolItem, number]) {
        //确保是同一次请求
        if (data[0].spawnTimes == times) {
            this.Despawn(data);
        }
    }
}
    
export class PoolItem {
    /// <summary>
    /// 资源唯一标示id
    /// </summary>
    protected _id = 0;
    /// <summary>
    /// 资源Transform的唯一id，unity接口取得
    /// </summary>
    protected _uuid = "";
    /// <summary>
    /// 资源池循环使用的次数，产生时0表示第一次，回收时0表示删除
    /// </summary>
    protected m_spawnTimes = 0;
    /// <summary>
    /// 资源
    /// </summary>
    protected _node : cc.Node;

    /// <summary>
    /// 资源的原始名字
    /// </summary>
    protected _name : string;

    /// <summary>
    /// 归属的孵化器
    /// </summary>
    protected _spawner : PoolSpawner;

    /// <summary>
    /// 是否已经被使用
    /// </summary>
    protected m_spawned = false;

    public get id() {
        return this._id;
    }

    public get uuid() {    
        return this._uuid;
    }

    public get spawnTimes() {
        return this.m_spawnTimes;
    }

    public Spawn() {
        this.m_spawned = true;
        ++this.m_spawnTimes;
    }

    public Despawn() {
        this.m_spawned = false;
    }

    public Clear() {
        this.m_spawnTimes = 0;
    }

    public get node() {
        return this._node;
    }

    public get name() {
        return this._name;
    }

    public get spawner() {
        return this._spawner;
    }

    public get spawned() {
        return this.m_spawned;
    }

    public constructor(id : number, node : cc.Node, spawner : PoolSpawner) {
        this._id = id;
        this._uuid = node.uuid;
        this._node = node;
        this._name = node.name;
        this._spawner = spawner;
    }
}

/// <summary>
/// 每次清除间隔秒数
/// </summary>
const kCullGap = 10;
/// <summary>
/// 每次Cull不能一次删除太多，不然会卡顿
/// </summary> 
const kCullMaxPerPass = 5;

/// <summary>
///保存Prefab，记录对应生成的所有Item
/// </summary>
export class PoolSpawner {
    protected m_pool : Pool;
    protected m_id = 0;
    public get Id() {
       return this.m_id;
    }

    protected m_prefab : cc.Node;
    public get Prefab() {
        return this.m_prefab;
    }

    /// <summary>
    /// Prefab等级，用于清理时的判断
    /// </summary>
    public grade = 0;

    /// <summary>
    /// 大于这个数量的Despawned实例会被destroy
    /// 该数小于0表示不清除
    /// </summary>     
    public cullAbove = -1;

    /// <summary>
    /// 是否正在Cull，不能重复启动
    /// </summary> 
    private m_cullWatcher : Watcher;

    /// <summary>
    /// 是否正在清理中
    /// </summary> 
    private m_clearing = false;
    public get clearing() {
        return this.m_clearing;
    }

    /// <summary>
    /// 预先加载多少个
    /// </summary>
    private m_preloadCount = 1;

    private m_preload = false;

    /// <summary>
    /// 最后一次产生实例的时间
    /// </summary>     
    private m_lastSpawnTime = 0;
    public get lastSpawnTime() {
        return this.m_lastSpawnTime;
    }

    /// <summary>
    /// 产生实例对象数据初始化回调
    /// </summary>
    private m_spawnedEvent : PoolCreateDelegate;

    /// <summary>
    /// 入池回调函数
    /// </summary>
    private m_despawnedEvent : PoolDespawnDelegate;

    /// <summary>
    /// 使用中的
    /// </summary>
    private m_spawneds : PoolItem[] = [];
    public get spawneds() {
        return this.m_spawneds;
    }
    /// <summary>
    /// 未使用的
    /// </summary>
    private m_despawneds : PoolItem[] = [];
    public get despawneds() {
        return this.m_despawneds;
    }

    private get TotalCount() {
        let count = 0;
        count += this.m_spawneds.length;
        count += this.m_despawneds.length;
        return count;        
    }

    public constructor(id : number, prefab : cc.Node, pool : Pool, onSpawned : PoolCreateDelegate,
                        onDespawned : PoolDespawnDelegate, preloadCount : number, cullAbove : number) {
        this.m_id = id;
        this.m_prefab = prefab;
        this.m_pool = pool;
        this.m_spawnedEvent = onSpawned;
        this.m_despawnedEvent = onDespawned;
        this.m_preloadCount = preloadCount;
        this.cullAbove = cullAbove;
        this.m_lastSpawnTime = Time.time;
    }

    public SmoothClear() {
        this.m_clearing = true;
        if (this.m_cullWatcher == null) {
            this.m_cullWatcher = Time.delay(kCullGap, this.cullDespawned, null, this, -1);
        }
    }

    public destory() {
        //回调到资源管理Unload资源
        if (this.m_pool.onDelSpawner != null) {
            this.m_pool.onDelSpawner.call(this.m_pool.target, this.m_id);
        }
        this.m_id = 0;
        if (cc.isValid(this.Prefab, true)) {
            //池里现在是原始资源，不需要销毁
            //this.m_prefab.destroy();
        }
        this.m_prefab = null;

        if (this.m_cullWatcher != null) {
            this.m_cullWatcher.Cancal();
            this.m_cullWatcher = null;
        }

        this.clear();
    }

    public clear() {
        /*
            * 因为Destory是延迟一帧执行的，所以InstData要脱离Group节点给Manager判断清空
        */
        this.m_despawneds.forEach(element => {
            this._clear(element);
        });
        this.m_despawneds = [];

        this.m_spawneds.forEach(element => {
            this._clear(element);
        });
        this.m_spawneds = [];
    }

    private _clear(data : PoolItem) {
        data.Clear();
        if (!cc.isValid(data.node, true)) {
            //cc.err("Error GameObject id:" + data.Id + " spawned:" + data.spawned + " Pool:" + m_pool.Type + " name:" + data.name);
            return;
        }
        data.Despawn();
        data.node.parent = null;
        data.node.destroy();
    }

    public DespawnAll() {
        for (let index = 0; index < this.m_spawneds.length; index++) {
            const data = this.m_spawneds[index];
            data.Despawn();
            if (cc.isValid(data.node, true)) {
                this.m_despawneds.push(data);

                //注意要OnDespond之后再重新挂回去
                data.node.parent = this.m_pool.Root;
                data.node.position = this.m_pool.GroupPosition;

                if (this.m_pool.BackActive) {
                    data.node.active = false;
                }

                this.despawnEvent(data);
            }
        }

        this.m_spawneds = [];
    }

    private despawnEvent(data : PoolItem) : boolean {
        try {
            if (this.m_despawnedEvent != null) {
                this.m_despawnedEvent.call(this.m_pool.target, data);
                if (!cc.isValid(data.node, true)) {
                    cc.warn(this.m_pool.Type + " despawnEvent Error uuid:" + data.uuid + " Id:" + data.id);
                }
            }
            return true;
        } catch (ex) {
            cc.error(ex);
        }
        return false;
    }

    public DespawnInstance(data : PoolItem, destroy : boolean, sendEvent = true) : boolean {
        if (data == null) {
            cc.error("DespawnInstance data null, Pool:" + this.m_pool.Type);
            return false;
        }

        data.Despawn();
        if (sendEvent && !this.m_spawneds.remove(data)) {
            cc.error("spawneds can't find:", data.id, data.uuid, data.name);
        } else {
            this.logSpawneds("DespawnInstance", data);
        }

        //OnDespawn调用可能把这个对象都删掉，如挂在UI下面的特效
        if (cc.isValid(data.node, true)) {
            if (destroy) {
                /// 如果要清理，不还回池里面的，直接清理掉
                data.node.destroy();
                data.Clear();
                cc.log(this.m_pool.Type, "DespawnInstance destroy", data.id, "uuid:" + data.uuid, data.name);
            } else {
                this.m_despawneds.push(data);

                //注意要OnDespond之后再重新挂回去
                data.node.parent = this.m_pool.Root;
                data.node.position = this.m_pool.GroupPosition;

                if (this.m_pool.BackActive) {
                    data.node.active = false;
                }
            }
        } else {
            cc.warn(this.m_pool.Type + " DespawnInstance Error uuid:" + data.uuid + " Id:" + data.id);
        }

        if (this.m_cullWatcher == null && this.cullAbove >= 0 && this.m_despawneds.length > this.cullAbove) {
            this.m_cullWatcher = Time.delay(kCullGap, this.cullDespawned, null, this, -1);
        }

        if (sendEvent && !this.despawnEvent(data))
            return false;

        return true;
    }

    private cullDespawned() : void {
        let cullNum = this.cullAbove;
        if (this.m_clearing || this.cullAbove <= 0) {
            cullNum = 0;
        }
        let length = this.m_despawneds.length;
        if (length > cullNum) {
            if (length > kCullMaxPerPass) {
                length = kCullMaxPerPass;
            }
            for (let index = length - 1; index >= 0; index--) {
                const data = this.m_despawneds.pop();
                this._clear(data);
            }
        } else {
            this.m_cullWatcher.Cancal();
            this.m_cullWatcher = null;
            //清除预制件
            if (this.m_clearing && this.m_id != 0) {
                this.m_pool.DelSpawner(this.m_id);                
            }
        }
        //Debug.Log(m_pool.Type + " " + m_id + " Cull Over:" + m_despawneds.Count);
    }

    //修复有人直接删除池里的object，导致池里引用找不到
    private fixErrorDestory() {
        let length = this.m_spawneds.length;
        for (let index = length - 1; index >= 0; index--) {
            const data = this.m_spawneds[index];
            if (!cc.isValid(data.node, true)) {
                this._clear(data);
                this.m_spawneds.removeAt(index);
            }
        }

        length = this.m_despawneds.length;
        for (let index = length - 1; index >= 0; index--) {
            const data = this.m_despawneds[index];
            if (!cc.isValid(data.node, true)) {
                this._clear(data);
                this.m_despawneds.removeAt(index);
            }
        }
    }

    public SpawnInstance(pos : cc.Vec2, rot : number, parent : cc.Node) : PoolItem {
        //关闭缓慢回收
        this.m_clearing = false;
        this.m_lastSpawnTime = Time.time;
        //cc.log("SpawnInstance:" + pos + " " + rot + " parent:" + parent);
        let data : PoolItem = null;
        while (data == null) {
            if (this.m_despawneds.length <= 0) {
                //没有未使用的对象，就新产生一个
                data = this.spawnNew(pos, rot, parent);
                break;
            } else {
                data = this.m_despawneds.shift();
                //资源被直接删除，有人没有走正常回收流程导致池里信息错误
                if (!cc.isValid(data.node, true)) {
                    cc.error(this.m_pool.Type + " Despawn Error inst:" + data.uuid + " ID:" + data.id + " Name:" + data.name);
                    data = null;
                    this.fixErrorDestory();
                }
            }
        }

        if (data == null) {
            cc.error("SpawnInstance null", data.id + " Name:" + data.name);
            return null;
        }

        if (parent != null && cc.isValid(parent, true)) {
            data.node.parent = parent;
            if (this.m_pool.MatchLayer) {
                this.SetRecursively(data.node, parent.groupIndex);
            }
        }
        data.node.position = pos;
        data.node.rotation = rot;
        data.node.active = true;
        this.m_spawneds.push(data);

        this.logSpawneds("SpawnInstance", data);

        data.Spawn();

        return data;
    }

    private spawnNew(pos : cc.Vec2 = null, rot = 0, parent : cc.Node = null) : PoolItem {
        // pool has destroy
        if (this.m_pool == null || this.m_pool.Root == null) {
            cc.warn(this.m_pool, "Pool has destroy!!!, id:", this.m_id);
            return null;
        }
        if (this.m_prefab == null) {
            cc.error(this.m_pool, "Pool prefab null!!!, id:", this.m_id);
            return null;
        }

        if (pos == null) {
            pos = this.m_pool.GroupPosition;
        }
        if (parent == null || !cc.isValid(parent, true)) {
            parent = this.m_pool.Root;
        }
        let inst = cc.instantiate<cc.Node>(this.m_prefab);
        if (inst == null) {
            cc.error(this.m_pool, "Pool inst null!!!, id:", this.m_id, this.m_prefab);
            //return null;
        }
        inst.name = this.m_prefab.name;
        this.nameInstance(inst);
        inst.parent = parent;
        inst.position = pos;
        inst.rotation = rot;
        if (this.m_pool.MatchScale) {
            inst.scale = 1;
        }

        let data;
        if (this.m_spawnedEvent != null) {
            data = this.m_spawnedEvent.call(this.m_pool.target, this.m_id, inst, this);
        } else {
            data = new PoolItem(this.m_id, inst, this);
        }

        if (this.m_pool.MatchLayer) {
            this.SetRecursively(inst, parent.groupIndex);
        }
        return data;
    }

    private logSpawneds(title : string, data : PoolItem) {
        return;
        let str = "[len:" + this.m_spawneds.length;
        this.m_spawneds.forEach(element => {
            str += ", " + element.uuid + " " + element.name;
        });
        str += "]";
        cc.error(data.id, title, Time.time, data.uuid, data.name, str);
    }

    /// <summary>
    /// Sets the layer of the passed transform and all of its children
    /// </summary>
    /// <param name="xform">The transform to process</param>
    /// <param name="layer">The new layer</param>
    private SetRecursively(node : cc.Node, layer : number) {
        node.groupIndex = layer;
        node.children.forEach(child => {
            this.SetRecursively(child, layer);
        });
    }

    public PreloadInstances() {
        if (this.m_preload) {
            cc.log(this.m_pool.Type + " Preload twice " + this.m_prefab.name);
            return;
        }

        if (this.cullAbove > 0 && this.m_preloadCount > this.cullAbove) {
            cc.error(this.m_pool.Type + " PreloadCount > cullAbove ", this.m_prefab.name);
        }
        this.m_preload = true;
        while (this.TotalCount < this.m_preloadCount) {
            let data = this.spawnNew();
            this.DespawnInstance(data, false, false);
        }
    }

    private _cursor = 0;
    private nameInstance(instance : cc.Node) {
        ++this._cursor;
        instance.name += "_" + ++this._cursor;
    }
}
