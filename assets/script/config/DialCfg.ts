import { TConfig } from "./TConfig";


export interface DialCfg extends IConfig {
	id:number;
	sector:number;
	multNum:number;
	weight:number;
}



export class DialCfgReader extends TConfig<DialCfg> {
    protected _name : string = "Dial";


}