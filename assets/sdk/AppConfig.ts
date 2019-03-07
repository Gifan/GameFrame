export namespace AppConfig {
    export const AppID = "wx6f7f99aff27156f9";
    export const ProgramId = "d608bb811ada11e9a954311336379bf2";
    
    //版本号,判断是否审核版本，获取浮动广告
    export const GameVersion = "1.0.0";

    export const TigerID = {
        login : "85696",
        gameOver : "85797",
        splash : "85595"
     }

    export const needSplash = true;

    //游戏服地址
    export const Servers = [
        { "name" : "正式服", "url" : "https://xyx.kuaiyugo.com/node3/t1/public/p2" },
        { "name" : "预发布服", "url" : "https://xyx.kuaiyugo.com/pre/public/p2" },
        { "name" : "测试服", "url" : "https://xyx.kuaiyugo.com/test/dev/public" },
    ];

    export const GameUrlDefaultIndex = 2;
}