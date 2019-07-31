import { AlertManager, AlertType } from "../alert/AlertManager";

export class UserVo {
    public isAuthorize:number = 0;                  //是否已授权
    public nickName:string = "匿名";
    public avatarUrl:string = "";
    public isGetData:boolean = false;
    public channel_code:string = "";
    public day:number = 0;
    //----------不保存-----------//
    public updatetUserVo(res: any): void {
        Object.getOwnPropertyNames(this).forEach(function (key) {
            if (res.hasOwnProperty(key) && key != "version") {
                if (key != "member")
                    this[key] = res[key];
                else {
                    for (let i in res[key]) {
                        this[key][i] = res[key][i];
                    }
                }
            }
        }.bind(this));
    }

    public serialize(): string {
        let data = {
            day:this.day,
        }
        let str = "";
        try {
            str = JSON.stringify(data);
            if (str == "{}" || str == null || str == "") {
                AlertManager.showAlert(AlertType.COMMON, { desc: "数据序列化出错" + str + ",请截图反馈给客服" });
            }
        } catch (error) {
            AlertManager.showAlert(AlertType.COMMON, { desc: "数据序列化出错" + error + ",请截图反馈给客服" });
        }
        return str;
    }
}
