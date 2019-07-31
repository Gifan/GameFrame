import { TConfig } from "./TConfig";


export interface WeaponCfg extends IConfig {
	id:number;
	name:string;
	weaponType:number;
	unlockWay:number[];
	bulletNum:number;
	chamber:number;
	scatterRatio:number;
	shootDelta:number;
	singleNum:number;
	hurt:number[];
	resPath:string;
	shootSpeed:number[];
	hurtRange:number;
	isCross:number;
	bulletId:number;
	showPos:number;
	fireAudioId:number;
	hitEffectId:number;
	fireEffectId:number;
	dropId:number;
	sortIndex:number;
	hitBack:number;
	effectType:number;
	hitAudioId:number[];
	bulletType:number[];
	attackRange:number[];
	qte:number[];
	duration:number[];
	warning:number;
}



export class WeaponCfgReader extends TConfig<WeaponCfg> {
    protected _name : string = "Weapon";


}