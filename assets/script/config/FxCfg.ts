import { TConfig } from "./TConfig";


export interface FxCfg extends IConfig {
	id:number;
	define?:string;
	name?:string;
	path:string;
	scale:number;
	shape?:boolean;
	dura:number;
	follow?:boolean;
	bones?:string[];
	offsets?:cc.Vec2[];
	rots?:number[];
	endTrigger?:number;
	endAnim?:string;
}

export const FxDefine = {
    "FlashL": 1,
    "FlashS": 2,
    "Crush": 3,
    "Boom": 4
}

export class FxCfgReader extends TConfig<FxCfg> {
    protected _name : string = "Fx";


}