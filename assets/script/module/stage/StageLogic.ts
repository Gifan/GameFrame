import { MVCS } from "../../../frame/mvcs/MVCS";
import { Notifier } from "../../../frame/mvcs/Notifier";
import { NotifyID } from "../../../frame/mvcs/NotifyID";
import { Time } from "../../../frame/Time";
import { ListenID } from "../../ListenID";
import { CallID } from "../../CallID";
import { StageModel } from "./StageModel"
import { StageNet } from "./StageNet"
import { Cfg } from "../../config/Cfg";
import { IItem } from "../../message/IItem";
import { AlbumDefine } from "../../config/AlbumCfg";
import { SceneDefine } from "../../config/SceneCfg";

/*
 * 关卡系统
 */
export class StageLogic extends MVCS.MNLogic<StageModel, StageNet> {
    public constructor() {
        super("Stage");

        this.setup(new StageModel(), new StageNet());
        this.changeListener(true);
    }

    protected changeListener(enable : boolean) : void {
        Notifier.changeCall(enable, CallID.Stage_GetCurId, this.getCurId, this);
        Notifier.changeCall(enable, CallID.Stage_GetNextId, this.getNextId, this);
        Notifier.changeCall(enable, CallID.Stage_GetLastId, this.getLastId, this);
        Notifier.changeCall(enable, CallID.Stage_GetAlbumId, this.getAlbumId, this);
        Notifier.changeCall(enable, CallID.Stage_GetAlbumStar, this.getAlbumStar, this);
        Notifier.changeCall(enable, CallID.Stage_GetTotalStar, this.getTotalStar, this);
        Notifier.changeCall(enable, CallID.Stage_GetStage, this.getStage, this);
        Notifier.changeCall(enable, CallID.Stage_IsFavor, this.isFavor, this);
        Notifier.changeCall(enable, CallID.Stage_GetFavors, this.getFavors, this);
    }

    private getCurId() : number {
        let albumId = this.getAlbumId();
        let index = this._model.curStageIndex;
        // if (albumId == AlbumDefine.Favor) {
        //     let favors = this._model.favors;
        //     if (favors.length > index) {
        //         return favors[index];
        //     } else {
        //         cc.error("curStageIndex out range favors", index, favors);
        //         return SceneDefine.Frist;
        //     }
        // } else {
            let sceneCfgs = Cfg.Scene.filter({album : albumId});
            let sceneCfg = sceneCfgs[index];
            if (sceneCfg != null) {
                return sceneCfg.id;
            } else {
                cc.error("curStageIndex out range stage", index, albumId, sceneCfgs);
                return SceneDefine.Frist;
            }
        // }
    }

    private getNextId() : number {
        let albumId = this.getAlbumId();
        let index = this._model.curStageIndex + 1;
        // if (albumId == AlbumDefine.Favor) {
        //     let favors = this._model.favors;
        //     if (favors.length > index) {
        //         return favors[index];
        //     } else {
        //         //收藏的歌曲循环播放
        //         return favors[0];
        //     }
        // } else {
            let sceneCfgs = Cfg.Scene.filter({album : albumId});
            let sceneCfg = sceneCfgs[index];
            if (sceneCfg == null) {
                let sceneCfgs = Cfg.Scene.filter({album : albumId + 1});
                if (sceneCfgs.length <= 0) {
                    cc.log("getNextId next albumId lock", albumId);
                    return null;
                }
                sceneCfg = sceneCfgs[0];
            }

            // let stage = this.getStage(sceneCfg.id);
            // if (stage == null) {
            //     //未解锁
            //     cc.log("getNextId stage lock", sceneCfg.id);
            //     return null;
            // }

            return sceneCfg.id;
        // }
    }

    private getLastId() : number {
        return this._model.getLastId();
    }

    private getAlbumId() : number {
        return this._model.curAlbumId;
    }

    private getStage(id : number) {
        return this._model.getStage(id);
    }

    private getAlbumStar(album : number) : number {        
        return this._model.getAlbumStar(album);        
    }

    private getTotalStar() : number {
        return this._model.getTotalStar();
    }

    private isFavor(id : number) : boolean {
        return this._model.isFavor(id);
    }

    private getFavors() {
        return this._model.favors;
    }
}