import { TConfig } from "./TConfig";


export interface TipsCfg extends IConfig {
	id:number;
	tips:string;
}



export class TipsCfgReader extends TConfig<TipsCfg> {
    protected _name : string = "Tips";


}