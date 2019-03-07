import { TConfig } from "./TConfig";


export interface ModelCfg extends IConfig {
	id:number;
	define?:string;
	name:string;
	path:string;
	type:number;
	bones?:string[];
	offsets?:cc.Vec2[];
	rots?:number[];
	subWeapon?:number;
}

export const ModelDefine = {
    "Hoodle": 1,
    "Drat": 2,
    "Bomb": 3
}

export class ModelCfgReader extends TConfig<ModelCfg> {
    protected _name : string = "Model";


}