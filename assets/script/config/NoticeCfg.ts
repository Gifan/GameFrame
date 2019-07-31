import { TConfig } from "./TConfig";


export interface NoticeCfg extends IConfig {
	id:number;
	ver:string;
	text:string;
}



export class NoticeCfgReader extends TConfig<NoticeCfg> {
    protected _name : string = "Notice";


}