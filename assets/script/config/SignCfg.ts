import { TConfig } from "./TConfig";


export interface SignCfg extends IConfig {
	id:number;
	Icon:string;
	item:number;
	count:number;
	double:number;
	doubleType:number;
	round:number;
	showType:number;
	showId:number;
	name:string;
}



export class SignCfgReader extends TConfig<SignCfg> {
    protected _name : string = "Sign";


}