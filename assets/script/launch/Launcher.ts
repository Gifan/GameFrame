/**
 *
 *
 *                                                    __----~~~~~~~~~~~------___
 *                                   .  .   ~~//====......          __--~ ~~
 *                   -.            \_|//     |||\\  ~~~~~~::::... /~
 *                ___-==_       _-~o~  \/    |||  \\            _/~~-
 *        __---~~~.==~||\=_    -_--~/_-~|-   |\\   \\        _/~
 *    _-~~     .=~    |  \\-_    '-~7  /-   /  ||    \      /
 *  .~       .~       |   \\ -_    /  /-   /   ||      \   /
 * /  ____  /         |     \\ ~-_/  /|- _/   .||       \ /
 * |~~    ~~|--~~~~--_ \     ~==-/   | \~--===~~        .\
 *          '         ~-|      /|    |-~\~~       __--~~
 *                      |-~~-_/ |    |   ~\_   _-~            /\
 *                           /  \     \__   \/~                \__
 *                       _--~ _/ | .-~~____--~-/                  ~~==.
 *                      ((->/~   '.|||' -_|    ~~-/ ,              . _||
 *                                 -_     ~\      ~~---l__i__i__i--~~_/
 *                                 _-~-__   ~)  \--______________--~~
 *                               //.-~~~-~_--~- |-------~~~~~~~~
 *                                      //.-~~~--\
 *                               神兽保佑
 *                              代码无BUG!
 */
const { ccclass, property } = cc._decorator;

import { NetLauncher } from "./NetLauncher";
import { ModuleLauncher } from "./ModuleLauncher";
import { Manager } from "../manager/Manager";
import { Cfg } from "../config/Cfg";
import { Util } from "../utils/Util";
import NetAdapter from "../adpapter/NetAdapter";
import { AlertManager, AlertType } from "../alert/AlertManager";
import { Time } from "../frame/Time";
import { appConfig } from "../sdk/hd_module/config/AppConfig";
import { UILanuncher } from "./UILauncher";
import { HD_MODULE } from "../sdk/hd_module/hd_module";
import { SdkLauncher } from "./SdkLauncher";

@ccclass
export default class Launcher extends cc.Component {

    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null;

    @property(cc.Label)
    text: cc.Label = null;

    @property(cc.Label)
    progressText: cc.Label = null;

    @property(cc.Label)
    version: cc.Label = null;

    onLoad() {
        cc.game.addPersistRootNode(this.node);
        
    }

    start() {
        this.version && (this.version.string = 'ver:' + appConfig.app_version);
        let can = cc.director.getScene().children[1];
        let node = can.getChildByName("bg");
        Util.resizeNode(node);
        this.schedule(() => {
            NetAdapter.onlineTime(10);
        }, 10);
        new UILanuncher();
        //先启动网络
        new NetLauncher();

        this.login();
    }

    login() {
        let this1 = this;
        HD_MODULE.PLATFORM.silenceLogin().then(res => {
            this1.loadConfig();
        }).catch(err => {
            AlertManager.showAlert(AlertType.NET_ERROR, {
                errorcb: () => {
                    this1.login();
                }
            })
        });
    }

    public progressNum: number = 0;
    public loadTime: number = 0;
    private count: number = 0;
    private downtime: number = 0.5;
    private loadState: number = 0;
    private stateStr = ['正在  首次安装下载', '正在  初始化资源', '正在  登录信息', '正在 下载2D资源'];
    private onloadTime: number = 5 / 8;  //每个加载基本时长8秒

    update(dt: number) {
        Time.update(dt);
        Manager.loader.Update(dt);
        if (this.downtime < 999999) {
            this.downtime -= dt;
            if (this.downtime <= 0) {
                this.moveon();
            }
        }
        if (this.sdklauncher && this.sdklauncher.loadFinish) return;
        this.loadTime += dt;
        this.progressNum = Math.lerp(this.progressNum, 100, dt * this.onloadTime);
        if (this.progressNum >= 99) {
            this.loadState += 1;
            this.loadState %= this.stateStr.length;
            this.progressNum = 0;
            this.moveon();
        }
        this.progressText.string = `${this.progressNum.toFixed(0)}%`;
        this.progress.progress = this.progressNum / 100;
    }

    public sdklauncher: SdkLauncher = null;

    //加载配置
    async loadConfig() {
        this.progress.progress = 0;
        await Promise.all([
            Cfg.initRemoteJson("Barrier"),
        ]); //等待所有数据返回
        //在启动模块
        new ModuleLauncher();
        //启动SDK
        this.sdklauncher = new SdkLauncher();
    }

    showDebug() {
        // if (appConfig.env == Environment.release) {
        //     console.log = function () { };
        //     console.debug = function () { };
        // }
    }

    moveon() {
        try {
            if (this.text) {
                this.count %= 6;
                this.text.string = this.getString("·", this.count);
                ++this.count;
                this.downtime = 0.5;
            } else {
                this.downtime = 999999;
            }
        } catch (error) {
            this.downtime = 999999;
        }
    }
    getString(str, count) {
        let newstr = this.stateStr[this.loadState];
        let a = str;
        for (let i = 0; i < count; i++) {
            a += str;
        }
        newstr += a;
        return newstr;
    }
}
