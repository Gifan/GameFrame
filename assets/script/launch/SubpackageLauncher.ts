import { WeChatSDK } from "../../sdk/WeChatSDK";
import { Notifier } from "../../frame/mvcs/Notifier";
import { NotifyID } from "../../frame/mvcs/NotifyID";

export class SubpackageLauncher {
    public constructor() {

    }

    private onLoad(name : string, error: Error, resolve, reject) {
        if (error) {
            cc.error("Subpackage.onLoad error", name, this._retry, error);
            if (this._retry <= 0) {
                reject();                
            } else {
                --this._retry;
                cc.loader.downloader.loadSubpackage(name, (error: Error) => {
                    this.onLoad(name, error, resolve, reject);
                });
            }
            return;
        }
        this._packages.remove(name);
        if (this._packages.length <= 0) {
            resolve();
            Notifier.send(NotifyID.Subpackage_Loaded);
        }
        console.log("Subpackage.onLoad finish:", new Date().format("HH:mm:ss fff"), name);
    }

    private _packages : string[] = [];
    private _retry = 5;

    /*
    * 必选的子包，影响游戏流程
    */
    public async initRequired() {
        console.log("Subpackage.initRequired start:" + new Date().format("HH:mm:ss fff"));
        return new Promise((resolve, reject)=>{
            if (!WeChatSDK.isWeChat()) {
                resolve();
                return;
            }
       
            this._packages = [
                'loading',
                'icon',
                'skin',
                'world',
            ];            
            for (let index = 0; index < this._packages.length; index++) {
                const name = this._packages[index];
                cc.loader.downloader.loadSubpackage(name, (error: Error) => {
                    this.onLoad(name, error, resolve, reject);
                });                
            }       
        });
    }

    /*
    * 可选的子包，不影响游戏流程
    */
    public async initOptional() {        
        console.log("Subpackage.initOptional start:" + new Date().format("HH:mm:ss fff"));
        return new Promise((resolve, reject)=>{
            if (!WeChatSDK.isWeChat()) {
                resolve();
                return;
            }
            this._packages = [                
                'audio'
            ];
            for (let index = 0; index < this._packages.length; index++) {
                const name = this._packages[index];
                cc.loader.downloader.loadSubpackage(name, (error: Error) => {
                    this.onLoad(name, error, resolve, reject);
                });                
            }
        });
    }

}