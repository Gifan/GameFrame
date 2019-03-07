interface String{
	format(...args:any[]):string;
	/*
	* 判断字符串长度（英文占1个字符，中文汉字占2个字符）
	*/
	gblen() : number;
	/*
	* 限制最大长度
	*/
	sublimit(maxLen : number) : string;
}

/**
* 格式化输出
* @param str 源字符串
* @param args 格式化参数，支持数值和对象两种方式
* {0},{1} => [str0, str1]
* {rank},{scroe} => { rank : 1, scroe : 999}
*/
String.prototype.format = function(...args:any[]){
	if(args == null || args.length == 0){
		cc.error("String.format args error");
		return this;
	}
	//cc.error("format", toJson(args))
	if (args.length == 1 && typeof (args[0]) == "object") {
			let obj = args[0];
			return this.replace(/{([a-z0-9]+)}/g, function(match, key) { 
				//cc.log("key", key, match, obj[key]);
				return typeof obj[key] != 'undefined'
					? obj[key]
					: match
				;
			});
	}	else {
		return this.replace(/{(\d+)}/g, function(match, number) { 
			return typeof args[number] != 'undefined'
				? args[number]
				: match
			;
		});
	}
	
	return this;
};

String.prototype.gblen = function() {  
    let len = 0;  
    for (let i=0; i < this.length; i++) {  
        if (this.charCodeAt(i) > 127 || this.charCodeAt(i) == 94) {  
            len += 2;  
        } else {  
            len ++;  
        }  
    }  
    return len;  
}  


String.prototype.sublimit = function(maxLen : number) {
	if (maxLen < 2) {
		cc.error("sublimit maxLen must > 2")
		return this;
	}

	let len = 0;
    for (let i=0; i < this.length; i++) {  
        if (this.charCodeAt(i) > 127 || this.charCodeAt(i) == 94) {  
            len += 2;  
        } else {  
            len ++;  
		}
		if (len > maxLen) {
			return this.substr(0, i) + "...";
		}
    }  
	return this;
}