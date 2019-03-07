/// <reference path="../creator.d.ts"/>
/// <reference path="lib.dom.d.ts"/>
// Global Namespace
declare let require : (str : string)=>any;

declare function toJson(o : any, skipKeys?:string[], space?: string | number) : string;

declare function toArray<T>(o : object | T[]) : T[];

//浅拷贝,只拷贝第一层
declare function copy(o : any) : any;

//深拷贝,递归拷贝，支持嵌套的
declare function deepCopy(o : any) : any;

declare function isNullOrEmpty(str : string) : boolean;

declare function isInteger(num : number) : boolean;

//赋值,只拷贝第一层
declare function assign(dst : any, scr : any)

//转换为消耗的显示格式
declare function costFormat(haveNum : number, needNum : number, color ?: string) : string;

//转换为数字缩写
declare function shortFormat(value : number) : string;

/*
 * 转换为倒计时显示
 * 返回[倒计时,下次刷新剩余秒数]
 */
declare function timeoutFormat(value : number) : [string, number];