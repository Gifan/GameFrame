import { PoolManager, PoolItem, PoolSpawner } from "../../frame/Pool";
import { AbsAssetPool } from "./AbsAssetPool";
import { Cfg } from "../config/Cfg";
import { eAsset, AssetHandle, AssetHandlerCallback } from "./AssetHandle";

class PoolFxItem extends PoolItem {
    private m_scale : number;
    private m_fxs : cc.ParticleSystem[];
    private m_anims : cc.Animation[];

    public constructor(id : number, inst : cc.Node, spawner : PoolSpawner) {
        super(id, inst, spawner);
        let fxCsv = Cfg.Fx.get(id);
        inst.scale *= fxCsv.scale;
        this.m_scale = inst.scale;
        if (cc.ParticleSystem) {
            //代码可能被裁剪
            this.m_fxs = inst.getComponentsInChildren(cc.ParticleSystem);            
        }
        this.m_anims = inst.getComponentsInChildren(cc.Animation);

        if (this.m_anims.length > 0 && fxCsv.dura <= 0) {
            this.m_anims.forEach(anim => {
                anim.stop();
                let state = anim.play();
                state.wrapMode = cc.WrapMode.Loop;
            });
        }
    }

    public get Fxs() {
        return this.m_fxs;
    }

    public get Anims() {
        return this.m_anims;
    }

    public get scale() {
        return this.m_scale;
    }
}

export class FxPool extends AbsAssetPool {
    //选择播放clips中的index
    private m_clips_index:number;

    protected CheckPrefab(hanlder : AssetHandle) {
        if (!this.m_pool.CheckPrefab(hanlder.id)) {
            hanlder.SetState(eAsset.StartLoad);
            let csv = Cfg.Fx.get(hanlder.id);
            if (csv == null) {
                return false;
            }
            let name = csv.path;
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

    protected OnDelSpawner(id) {
        let csv = Cfg.Fx.get(id);
        if (csv == null) {
            return;
        }
        AbsAssetPool.s_unloadAssetHandler(csv.path);
    }

    protected PrefabCreateDelegate(id : number, inst : cc.Node, spawner : PoolSpawner) : PoolItem {
        return new PoolFxItem(id, inst, spawner);
    }

    protected ResetInfo(item : PoolFxItem) {
        this.RestartFx(item);
    }

    protected RestartFx(info : PoolFxItem) {
        if (info == null || !cc.isValid(info.node, true)) {
            return;
        }
        const fxCfg = Cfg.Fx.get(info.id);
        if (info.Fxs != null) {
            info.Fxs.forEach(fx => {
                fx.resetSystem();
            });
        }

        if (info.Anims != null) {
            info.Anims.forEach(anim => {
                anim.stop();
                if(this.m_clips_index != null){
                    let clips = anim.getClips();
                    if(clips[this.m_clips_index] != null){
                        //console.log("播放Clips", clips[this.m_clips_index].name)
                        anim.play(clips[this.m_clips_index].name);
                    }
                }else{
                    anim.play(anim.defaultClip.name);
                }
            });
        }
    }

    public constructor() {
        super();
        this.InitPool();
    }

    public InitPool() {
        this.m_poolType = "FxPool";
        if (PoolManager.isExist(this.m_poolType)) {
            return;
        }
        this.m_pool = PoolManager.create(this.m_poolType, this);
        this.m_pool.onDelSpawner = this.OnDelSpawner;
        this.m_pool.ClearAbove = 20;
        this.m_pool.ClearMaxPer = 15;
    }

    public ReqSpawn(id : number, pos ?: cc.Vec2, rot ?: number, root ?: cc.Node,
            create ?: AssetHandlerCallback, cParam ?: any, cTarget ?: any,
            destroy ?: AssetHandlerCallback, dParam ?: any, dTarget ?: any, m_clips_index ?:number) : AssetHandle {
        let delay = -1;
        let cfg = Cfg.Fx.get(id);
        if (cfg != null) {
            delay = cfg.dura;
        }
        this.m_clips_index = m_clips_index;
        return super.ReqSpawn(id, pos, rot, root, create, cParam, cTarget, destroy, dParam, dTarget, delay);
    }

    public ReqSeparateDespawn(hanlde : AssetHandle, delay : number) {
        if (hanlde == null) {
            return;
        }
        let csvFx = Cfg.Fx.get(hanlde.id);
        if (csvFx != null) {
            delay += csvFx.dura;
        }
        //特效脱离子弹，防止特效为到期就随子弹消失
        if (hanlde.node != null) {
            hanlde.node.parent = this.m_pool.Root;
        } else {
            //未加载完成的，去除绑定父节点
            let parent = hanlde.parent;
            if (parent) {
                let pos = parent.position.add(parent.convertToWorldSpace(hanlde.pos));
                let rot = parent.rotation;
                //用于未加载完成前就删除的重定位
                hanlde.parent = null;
                hanlde.pos = pos;
                hanlde.rot = rot;
            }
        }
        this.Despawn(hanlde, delay);
        cc.log("ReqDespawnSkill:" + hanlde.id + " index:" + hanlde.index + " " + hanlde.state + " " + delay);
    }

    //**********************函数接口***************************//

    //必须先设置父类，保证缩放
    public SetSize(item : PoolItem, size : number) {
        if (item == null) {
            cc.error("Fx SetSize Null");
            return;
        }
        let info = item as PoolFxItem;
        //ExDebug.Log(info.xform.name + " SetSize:" + size + " " + info.xform.localScale + info.xform.lossyScale + info.Size);
        info.node.scale = info.scale * size;
//         for (int i = 0; i < info.Fxs.Count; i++) {
//             info.Fxs[i].SetScale(size);
//         }
        //重启一下特效，防止已经释放的粒子不生效
        this.RestartFx(info);
    }    
}
