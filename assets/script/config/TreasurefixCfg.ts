import { TConfig } from "./TConfig";


export interface TreasurefixCfg extends IConfig {
	id:number;
	type:number;
	awardCardinal:number;
	icon:string;
	text:string;
}



export class TreasurefixCfgReader extends TConfig<TreasurefixCfg> {
    protected _name : string = "Treasurefix";


}