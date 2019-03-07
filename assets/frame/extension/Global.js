/*
 *解除循环引用的toJson
 */
window.toJson = function(o, skipKeys, space) {
    let cache = [];
    let json = JSON.stringify(o, function(key, value) {
        if (skipKeys != null && skipKeys.indexOf(key) !== -1) {
            return;
        }
        if (typeof value === 'object' && value !== null) {
            if (cache.indexOf(value) !== -1) {
                // Circular reference found, discard key
                return;
            }
            // Store value in our collection
            cache.push(value);
        }
        return value;
    }, space);
    cache = null;
    return json;
}

//object to Array
window.toArray = function(obj) {
    let array = [];
    if (obj === null || typeof obj !== 'object') {
        return array;
    }

    for (const key in obj) {
        const value = obj[key];
        array.push(value);
    }

    return array;
}

//只拷贝第一层
window.copy = function(obj) {
    // just return if obj is immutable value
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
        
    const copy = Array.isArray(obj) ? [] : {};    
    Object.keys(obj).forEach(key => {
        copy[key] = obj[key];
    })
    
    return copy;
}

//Vuex源码中发现了一个深拷贝方法
window.deepCopy = function(obj, cache = []) {
    function find (list, f) {
        return list.filter(f)[0];
    }
    
    // just return if obj is immutable value
    if (obj === null || typeof obj !== 'object') {
        return obj;
    }
    
    // if obj is hit, it is in circular structure
    const hit = find(cache, c => c.original === obj)
    if (hit) {
        return hit.copy;
    }
    
    const copy = Array.isArray(obj) ? [] : {}
    // put the copy into cache at first
    // because we want to refer it in recursive deepCopy
    cache.push({
        original: obj,
        copy
    });
    
    Object.keys(obj).forEach(key => {
        copy[key] = deepCopy(obj[key], cache);
    });
    
    return copy;
}

window.isNullOrEmpty = function(str){    
	if(str == null){
		return true;
    }
    if (str == "") {
        return true;
    }
    let type = typeof(str);
    if (type != "string" && type != "number") {
        cc.error("isNullOrEmpty error type", str)
    }
	return false;
};

window.isInteger = function(num) {
    if (!isNaN(num) && num % 1 === 0) {
      return true;
    } else {
      return false;
    }
}

window.assign = function(dst, scr) {
    if (scr === null || typeof scr !== 'object') {
        return ;
    }

    if (dst === null || typeof dst !== 'object') {
        return ;
    }
        
    Object.keys(scr).forEach(key => {
        dst[key] = scr[key];
    })
}

window.costFormat = function(haveNum, needNum, color) {
    if (color == null) {
        //white
        color = "FFFFFF";
    }
    if (haveNum >= needNum) {
        return `<color=#${color}>${haveNum}/${needNum}</c>`;
    }

    return `<color=#FF0000>${haveNum}</c><color=#${color}>/${needNum}</c>`;
}

window.shortFormat = function(value) {
    if (value < 10000) {
        return value.toString();
    } else if (value < 100000000) {
        return (value / 10000).toFixed(1) + "万";
    } else {
        return (value / 100000000).toFixed(1) + "亿";
    }
}

const secondPerMinute = 60;
const secondPerHour = 60 * 60;
const secondPerDay = 24 * 60 * 60;
window.timeoutFormat = function(value) {
    value = Math.floor(value);
    if (value < secondPerMinute) {
        return [value + "秒", 1];
    } else if (value < secondPerHour) {
        let min = Math.floor(value / secondPerMinute);
        let second = value % secondPerMinute;
        return [min + "分" + second + "秒", 1];
    } else if (value < secondPerDay) {
        let hour = Math.floor(value / secondPerHour);
        let remain = value % secondPerHour;
        let min = Math.floor(remain / secondPerMinute);
        remain = remain % secondPerMinute;
        return [hour + "小时" + min + "分", remain];
    } else {
        let day = Math.floor(value / secondPerDay);
        let remain = value % secondPerDay;
        let hour = Math.floor(remain / secondPerHour);
        remain = remain % secondPerHour;
        return [day + "天" + hour + "小时", remain];
    }
}