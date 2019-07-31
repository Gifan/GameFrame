import { TConfig } from "./TConfig";


export interface TreasureCfg extends IConfig {
	id:number;
	type:number;
	awardCardinal:number;
	weight:number;
	icon:string;
	text:string;
	shine:number;
	next:number;
	roll:number;
}



export class TreasureCfgReader extends TConfig<TreasureCfg> {
    protected _name : string = "Treasure";


}