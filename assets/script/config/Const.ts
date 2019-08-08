import { appConfig } from "../sdk/hd_module/config/AppConfig";

export namespace Const {
    export const APP_ID = "wxc93ee93882288748";

    export const designWidth = 720;
    export const designHeight = 1280;

    export const GAME_SCENENAME = "GameScene";
    export const GameName: string = "热血猎手";

    /**是否开启输出console.log */
    export const SHOW_LOG = true;

    //本地缓存key
    export const STORAGE_SETTING: string = "setting";//设置
    export const STORAGE_NEWUSER: string = "newuser";//新用户标记
    export const STORAGE_LOADMENU: string = "loadmenu";//加载一次资源

    export const JsonRemoteUrl: string = `https://cdn.heidong.fun/gameres/t3/p1/release/zijie/${appConfig.app_version}/config/`;

    /**组名 */
    export const GroupDefault = "Default";
    export const GroupTerrain = "Terrain";
    export const GroupDecorate = "Decorate";
    export const GroupMainRole = "MainRole";
    export const GroupMonster = "Monster";
    export const GroupBomb = "Bomb";
    export const GroupBullet = "Bullet";
    export const GroupTool = "Tool";
    export const GroupUI = "UI";

}
