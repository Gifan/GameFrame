/**
 * 全局通知事件
 * 注册时必须 传target参数，一般都传this
 * 取消注册有三种方式
 * 1. off(type, target) 取消该target注册的type事件的回调
 * 2. offType(type) 取消该type下的所有回调
 * 3. offTarget(target) 取消该target注册的所有type
 */
export class EventManager {
    private static _eventMap: Map<string, Map<object, { callback: any; target: any }>> = new Map();

    /**
     * 注册事件监听
     * @param type 事件名
     * @param callback 事件回调
     * @param target 对象标志，必须设置
     */
    public static on(type: any, callback: Function, target: any) {
        if (!type || !target) {
            throw new Error(`EventUtil must have type and target. type:${type} target:${target}`);
        }

        if (this._eventMap.get(type) === undefined) {
            this._eventMap.set(type, new Map());
        }
        // //console.log(`${target.toString()}-${callback.toString()}`);
        this._eventMap.get(type).set(target, {
            callback: callback,
            target: target
        });
        // this._eventMap[type].push({ callback: callback, target: target });
    }

    /**
     * 发送事件
     * @param type 事件名
     * @param parameter 传参数，会默认带上event_type的参数
     */
    public static emit(type, parameter?: any) {
        var map = this._eventMap.get(type);
        if (map === undefined) {
            console.warn("没有找到全局事件：" + type);
            return;
        }

        map.forEach((value, key) => {
            value.callback.call(value.target, parameter);
        });
    }

    /**
     * 根据type 和 target标志清除事件
     * @param type 事件名
     * @param target 事件标志
     */
    public static off(type, target) {
        var map = this._eventMap.get(type);
        if (map === undefined) return;

        let key = undefined;
        for (const iterator of Array.from(map.entries())) {
            if (iterator[1].target === target) {
                key = iterator[0];
                break;
            }
        }
        if (key) map.delete(key);
    }

    /**
     * 根据事件名清除事件名注册的所有事件
     * @param type 事件名
     */
    public static offType(type) {
        this._eventMap.delete(type);
    }

    /**
     * 清楚所有target绑定的事件
     * @param target
     */
    public static offTarget(target) {
        this._eventMap.forEach((value, key) => {
            const deleteKeys = [];
            value.forEach((value, key) => {
                if (value.target === target) {
                    deleteKeys.push(key);
                }
            });
            deleteKeys.forEach(key => value.delete(key));
        });
    }
}
