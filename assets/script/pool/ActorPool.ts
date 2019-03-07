import { PoolManager, PoolItem, PoolSpawner } from "../../frame/Pool";
import { AbsAssetPool } from "./AbsAssetPool";
import { Cfg } from "../config/Cfg";
import { eAsset, AssetHandle, AssetHandlerCallback } from "./AssetHandle";
import { AnimStub } from "../common/AnimStub";

export class PoolActorItem extends PoolItem {
    private m_animStub : AnimStub;

    public constructor(id : number, inst : cc.Node, spawner : PoolSpawner) {
        super(id, inst, spawner);
        let animator = inst.getComponentInChildren(sp.Skeleton);
        if (animator == null) {
            animator = inst.getComponent(sp.Skeleton);
        }
        if (animator != null) {
            this.m_animStub = new AnimStub(inst, animator);
        } else {
            cc.log("Skeleton can't find", inst.name)
        }
    }

    public get animStub() {
        return this.m_animStub;
    }
}

export class ActorPool extends AbsAssetPool {
    public constructor() {
        super();
        this.InitPool();
    }

    protected PrefabCreateDelegate(id : number, inst : cc.Node, spawner : PoolSpawner) : PoolItem {
        return new PoolActorItem(id, inst, spawner);
    }

    protected CheckPrefab(hanlder : AssetHandle) {
        let cfg = Cfg.Model.get(hanlder.id);
        if (!this.m_pool.CheckPrefab(cfg.id)) {
            hanlder.SetState(eAsset.StartLoad);
            let name = cfg.path;
            let list = this.m_loadingList[name];
            if (list == null) {
                list = [];
                this.m_loadingList[name] = list;
            }
            list.push(hanlder);
            //只做一次资源加载申请
            if (list.length == 1) {
                AbsAssetPool.s_loadAssetAsyncHandler(name, name, AbsAssetPool.kPrefabType, this.PrefabCallback, this);
            }
            return false;
        }
        return true;
    }

    protected OnDelSpawner(id : number) {
        let cfg = Cfg.Model.get(id);
        if (cfg == null) {
            return;
        }
        AbsAssetPool.s_unloadAssetHandler(cfg.path);
    }

    public InitPool() {
        this.m_poolType = "ActorPool";
        if (PoolManager.isExist(this.m_poolType)) {
            return;
        }        
        this.m_pool = PoolManager.create(this.m_poolType, this);
        this.m_pool.onDelSpawner = this.OnDelSpawner;
        this.m_pool.ClearAbove = 30;
        this.m_pool.ClearMaxPer = 15;
    }
}

