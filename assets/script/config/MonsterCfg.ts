import { TConfig } from "./TConfig";


export interface MonsterCfg extends IConfig {
	id:number;
	monName:string;
	monType:number;
	hp:number;
	hurt:number;
	shootDelta:number;
	attackRange:number;
	moveSpeed:number[];
	monResPath:string;
	reward:number;
	skillRange:number;
	weaponId:number[];
	needRotate:number;
	deadAudioID:number;
	dropPool:number[];
	bodyScale:number[];
}



export class MonsterCfgReader extends TConfig<MonsterCfg> {
    protected _name : string = "Monster";


}