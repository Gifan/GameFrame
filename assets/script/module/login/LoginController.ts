import { ListenID } from "../../ListenID";
import { Const } from "../../config/Const";
import { MVC } from "../../frame/MVC";
import { Notifier } from "../../frame/Notifier";

export class LoginController extends MVC.BaseController {
    public constructor() {
        super("LoginController");
        this.changeListener(true);
    }

    protected changeListener(enable: boolean): void {
        Notifier.changeListener(enable, ListenID.Login_Start, this.onLoginStart, this);
        Notifier.changeListener(enable, ListenID.Login_Finish, this.onLoginFinish, this);
    }

    private onLoginStart(): void {

    }

    private onLoginFinish(): void {
        this.loadResSuc()
    }

    loadResSuc() {
        // HD_MODULE.PLATFORM.showVideoByIndex(1, false);
        cc.director.loadScene(Const.GAME_SCENENAME, () => {
        });
    }
}
