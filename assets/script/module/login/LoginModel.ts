import { MVCS } from "../../../frame/mvcs/MVCS";

export class LoginModel extends MVCS.AbsModel {
    public constructor() {
        super("Login", MVCS.eDataType.Temp);
    }
}