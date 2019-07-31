import Net from "./net/net";
import Platform from "./sdk/platform/platform";

export class HD_MODULE {
    public static NET: Net = null;                         //网络模块
    public static PLATFORM: Platform = null;               //平台模块

    /** 获取网络模块 */
    public static getNet(){
        return this.NET;
    }

    /** 获取平台模块 */
    public static getPlatform(){
        return this.PLATFORM;
    }

    /** 模块初始化*/
    public static init(){
        /** 初始化网络模块 */
        HD_MODULE.NET = new Net();

        /** 初始化平台模块,将自动执行平台SDK初始化,平台相关静默登录 */
        HD_MODULE.PLATFORM = new Platform();
    }
}
// HD_MODULE.init();