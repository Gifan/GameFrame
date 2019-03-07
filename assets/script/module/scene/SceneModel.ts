import { MVCS } from "../../../frame/mvcs/MVCS"
import { SceneVo } from "./SceneVo"

export class SceneModel extends MVCS.AbsModel {
    public constructor() {
        super("Scene", MVCS.eDataType.Temp);
    }

    private _prevId = 0;
    public get prevId() : number { return this._prevId; }

    private _vo : SceneVo;
    public get vo() : SceneVo { return this._vo; }
    public setScene(vo : SceneVo) {
        if (this._vo != null) {
            this._prevId = this._vo.id;
        }
        this._vo = vo;
    }
}