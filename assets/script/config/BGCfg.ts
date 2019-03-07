import { TConfig } from "./TConfig";


export interface BGCfg extends IConfig {
	id:number;
	define?:string;
	name:string;
	desc:string;
	icon:string;
	hide?:boolean;
	asset:string;
}



export class BGCfgReader extends TConfig<BGCfg> {
    protected _name : string = "BG";


}