import { Const } from "../config/Const";
import { GameVoManager } from "../manager/GameVoManager";
import { AlertManager, AlertType } from "../alert/AlertManager";
import NetAdapter from "../adpapter/NetAdapter";
import { ListenID } from "../ListenID";
import { HD_MODULE } from "../sdk/hd_module/hd_module";
import { Cfg } from "../config/Cfg";
import { ShareCode, Common_UIPath } from "../common/Common_Define";
import { Manager } from "../manager/Manager";
import { Util } from "../utils/Util";
import { Notifier } from "../frame/Notifier";
import { Time } from "../frame/Time";

export class SdkLauncher {
    private launchDesc: cc.Label = null;
    private progress: cc.ProgressBar = null;
    private _progressNum: number = 0;
    public constructor(launchDesc?: cc.Label, progress?: cc.ProgressBar) {
        this.launchDesc = launchDesc;
        this.progress = progress;
        this._progressNum = 10;
        this.loadFinish = false;
        this.setSdkInfo();
        this.loadShareTemplates();
        this.login();
    }
    public loadFinish: boolean = false;
    public get progressNum(): number {
        return this._progressNum > 100 ? 100 : this._progressNum;
    }
    public setSdkInfo() {
        Notifier.send(ListenID.Login_Start);
    }

    login() {
        this.loadOther();
        this.loadData();
    }

    async loadData() {
        await Promise.all([this.loadGameSwitchConfig(),, this.loadTime(), this.loadUserData(), this.loadScene()]);
        if (this.progress) { this.progress.progress = 1; this.launchDesc.string = "100%" };
        this.checkLogin().then(() => {
            this.initData();
            this.loadFinish = true;
            setTimeout(() => {
                Notifier.send(ListenID.Login_Finish);
            }, 100)

        }).catch(err => {
            this.reLogin();
        })
    }

    async loadTime() {
        return new Promise((resolve, reject) => {
            NetAdapter.getServerTime().then(res => {
                if (res && res.data) {
                    Time.setServerTime(res.data.timestamp * 1000);
                } else {
                    let time = Date.now();
                    Time.setServerTime(time);
                }
                // this.progress.progress += 0.1;
                // this._progressNum = Math.floor(this.progress.progress * 100);
                // this.launchDesc.string = `${this.progressNum}%`;
                resolve();
            }).catch(err => {
                // this.progress.progress += 0.1;
                // this._progressNum = Math.floor(this.progress.progress * 100);
                // this.launchDesc.string = `${this.progressNum}%`;
                let time = Date.now();
                Time.setServerTime(time);
                resolve();
            })
        })
    }

    /**加载被动分享模板 */
    loadShareTemplates() {
        HD_MODULE.PLATFORM.getOneShareInfoByType(ShareCode.regular, (shareInfo) => {
            if (shareInfo) {
                shareInfo.imageUrl = shareInfo.image_url;
                HD_MODULE.PLATFORM.setShareAppMsg(shareInfo);
            }
        }, () => {

        })
    }

    /**加载游戏开关控制 */
    async loadGameSwitchConfig() {
        return new Promise((resolve, reject) => {
            HD_MODULE.PLATFORM.getGameSwitchConfig().then(res => {
                // this.progress.progress += 0.1;
                // this._progressNum = Math.floor(this.progress.progress * 100);
                // this.launchDesc.string = `${this.progressNum}%`;
                GameVoManager.getInstance.updateSwitchVo(res.data.switch);
                resolve();
            }).catch(err => {
                console.error("switch", err);
                // this.progress.progress += 0.1;
                // this._progressNum = Math.floor(this.progress.progress * 100);
                // this.launchDesc.string = `${this.progressNum}%`;
                resolve();
            })
        })
    }

    /**加载用户数据 */
    async loadUserData() {
        return new Promise((resolve, reject) => {
            NetAdapter.getKVData().then(res => {
                if (res.data) {
                    try {
                        let data = JSON.parse(res.data.custom_data.public);
                        data = this.checkUserData(data);
                        GameVoManager.getInstance.myUserVo.updatetUserVo(data);
                        GameVoManager.getInstance.myUserVo.isGetData = true;
                        Notifier.send(ListenID.Login_User);
                    } catch (error) {
                        console.log("reject------");
                        console.error(error);
                    }
                }
                resolve(res);
                // this.progress.progress += 0.1;
                // this._progressNum = Math.floor(this.progress.progress * 100);
                // this.launchDesc.string = `${this.progressNum}%`;
            }).catch(err => {
                this.progress.progress += 0.1;
                // this._progressNum = Math.floor(this.progress.progress * 100);
                // this.launchDesc.string = `${this.progressNum}%`;
                resolve(err);
            })
        });
    }

    async loadScene() {
        return new Promise((resolve, reject) => {
            cc.director.preloadScene(Const.GAME_SCENENAME, (curcomplete, totalcount) => {
                // this.progress.progress += 0.1 * (1 / totalcount);
                // this._progressNum = Math.floor(this.progress.progress * 100);
                // this.launchDesc.string = `${this.progressNum}%`;
            }, () => {
                resolve();
            });
        })
    }

    public loadOther() {
        
    }

    public checkLogin(): Promise<any> {
        return new Promise((resolve, reject) => {
            if (!GameVoManager.getInstance.myUserVo.isGetData && HD_MODULE.PLATFORM.sdk) {
                AlertManager.showAlert(AlertType.COMMON, {
                    desc: '获取用户数据失败，点击确定重连', errorcb: () => {
                        NetAdapter.getKVData().then(res => {
                            if (res.data) {
                                try {
                                    let data = JSON.parse(res.data.custom_data.public);
                                    data = this.checkUserData(data);
                                    GameVoManager.getInstance.myUserVo.updatetUserVo(data);
                                    GameVoManager.getInstance.myUserVo.isGetData = true;
                                    Notifier.send(ListenID.Login_User);
                                    resolve();
                                } catch (error) {
                                    console.error(error);
                                    reject();
                                }
                            }
                        }).catch(err => {
                            reject()
                        })
                    }
                });
            } else {
                resolve();
            }
        })
    }

    public checkUserData(data: any) {

        return data;
    }

    public reLogin() {
        this.checkLogin().then(() => {
            this.initData();
            this.loadFinish = true;
            Notifier.send(ListenID.Login_Finish);
        }).catch(err => {
            this.reLogin();
        })
    }

    public initData() {
        let date = new Date(Time.serverTimeMs);
        let curday = date.getDate();
        let userData = GameVoManager.getInstance.myUserVo;
        if (curday != userData.day) {
            userData.day = curday;
            Notifier.send(ListenID.SecondDay);
        }
    }
}
