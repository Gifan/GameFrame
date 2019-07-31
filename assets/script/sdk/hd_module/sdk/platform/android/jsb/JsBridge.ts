
declare let window;

let jsbCall = window.jsb ? jsb.reflection.callStaticMethod : () => {};
/**
 * js调用Android原生平台方法
 */
export default class JsBridge {
    /** java方法的类的默认路径 */
    public static defaultClassPah: String = "org/cocos2dx/javascript/HdModule";

    /** 初始化 */
    public static init(){
        jsbCall(this.defaultClassPah, 'init', "()V");
    }

    /** 短震 */
    public static vibrateShort(){
        jsbCall(this.defaultClassPah, 'vibrateShort', "(I)V", 100);
    }

    /** 获取设备信息 */
    public static getDevicesInfo(){
        let infoT = {};
        let infoStr = jsbCall(this.defaultClassPah, 'getDevicesInfo', "()Ljava/lang/String;");
        if(infoStr){
            let infoArr = infoStr.split('\n');
            if(infoArr){
                for(let i = 0; i < infoArr.length; ++i){
                    if(infoArr[i]){
                        let infoKVArr = infoArr[i].split(' = ');
                        if(infoKVArr)
                            infoT[infoKVArr[0]] = infoKVArr[1];
                    }
                }
            }
        }
        return infoT;
    }
}
