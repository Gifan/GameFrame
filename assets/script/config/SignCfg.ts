import { TConfig } from "./TConfig";


export interface SignCfg extends IConfig {
	id:number;
	day:string;
	awardType:number;
	awardCount:number;
	awardID:number;
	extraType:number;
	extraCount:number;
	extraTips:string;
}



export class SignCfgReader extends TConfig<SignCfg> {
    protected _name : string = "Sign";


}