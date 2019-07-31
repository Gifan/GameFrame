import { TConfig } from "./TConfig";


export interface DropCfg extends IConfig {
	id:number;
	intro:string;
	desc:string;
	name:string;
	toolType:number;
	lifeTime:number;
	hurtRange:number;
	hurt:number;
	bulletId:number;
	bulletNum:number;
	weaponId:number;
	buffTime:number;
	toolResPath:string;
	unlockWay:number[];
	showPos:number;
	toolEffectpath:string;
	needPreLoad:number;
}



export class DropCfgReader extends TConfig<DropCfg> {
    protected _name : string = "Drop";


}