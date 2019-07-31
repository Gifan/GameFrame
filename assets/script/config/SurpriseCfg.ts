import { TConfig } from "./TConfig";


export interface SurpriseCfg extends IConfig {
	id:number;
	dialID:number;
	sector:number;
	awardType:number;
	lotteryCcount:number;
	awardCardinal:number;
	weight:number;
	buff:number;
	text:string;
	next:number;
	iocn:string;
}



export class SurpriseCfgReader extends TConfig<SurpriseCfg> {
    protected _name : string = "Surprise";


}