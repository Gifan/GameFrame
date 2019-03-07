interface Date{
	format(format:string):string;
}

function charString(char, count) {
    var str = "";
    while (count--) {
        str += char;
    }
    return str;
}

/** 
 * 对日期进行格式化， 和C#大致一致 默认yyyy-MM-dd HH:mm:ss
 * 可不带参数 一个日期参数 或一个格式化参数
 */
Date.prototype.format = function (format) {
    var map = {
        "y": this.getFullYear() + "",
        "M": this.getMonth() + 1 + "",
        "d": this.getDate() + "",
        "H": this.getHours(),
        "m": this.getMinutes() + "",
        "s": this.getSeconds() + "",
        "q": Math.floor((this.getMonth() + 3) / 3) + "",
        "f": this.getMilliseconds() + "" //毫秒 
    };
    //小时 12
    if (map["H"] > 12) {
        map["h"] = map["H"] - 12 + "";
    } else {
        map["h"] = map["H"] + "";
    }
    map["H"] += "";
    var reg = "yMdHhmsqf";
    var all = "",
        str = "";
    for (var i = 0, n = 0; i < reg.length; i++) {
        n = format.indexOf(reg[i]);
        if (n < 0) {
            continue;
        }
        all = "";
        for (; n < format.length; n++) {
            if (format[n] != reg[i]) {
                break;
            }
            all += reg[i];
        }
        if (all.length > 0) {
            if (all.length == map[reg[i]].length) {
                str = map[reg[i]];
            } else if (all.length > map[reg[i]].length) {
                if (reg[i] == "f") {
                    str = map[reg[i]] + charString("0", all.length - map[reg[i]].length);
                } else {
                    str = charString("0", all.length - map[reg[i]].length) + map[reg[i]];
                }
            } else {
                switch (reg[i]) {
                    case "y":
                        str = map[reg[i]].substr(map[reg[i]].length - all.length);
                        break;
                    case "f":
                        str = map[reg[i]].substr(0, all.length);
                        break;
                    default:
                        str = map[reg[i]];
                        break;
                }
            }
            format = format.replace(all, str);
        }
    }
    return format;
};