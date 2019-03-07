import { TConfig } from "./TConfig";


export interface SkinCfg extends IConfig {
	id:number;
	define?:string;
	name:string;
	desc:string;
	icon:string;
	hide?:boolean;
	man:string;
	woman:string;
}



export class SkinCfgReader extends TConfig<SkinCfg> {
    protected _name : string = "Skin";


}