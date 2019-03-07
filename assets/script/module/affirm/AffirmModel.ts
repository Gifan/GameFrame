import { MVCS } from "../../../frame/mvcs/MVCS"

export class AffirmModel extends MVCS.AbsModel {
    public constructor() {
        super("_Affirm", MVCS.eDataType.Temp);
    }

    public reset() : void {
        //用于重连时重置数据
    }
}