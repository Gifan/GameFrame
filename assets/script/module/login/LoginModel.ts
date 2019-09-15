import { MVCS } from "../../frame/MVCS";


export class LoginModel extends MVCS.BaseModel {

    private static _instance: LoginModel = null;

    public constructor() {
        super();
        if (LoginModel._instance == null) {
            LoginModel._instance = this;
        }
    }
    public reset(): void {

    }

    public static get getInstance(): LoginModel {
        if (LoginModel._instance == null) {
            LoginModel._instance = new LoginModel();
        }
        return LoginModel._instance;
    }
}
