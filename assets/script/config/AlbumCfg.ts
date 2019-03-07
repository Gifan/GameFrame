import { TConfig } from "./TConfig";


export interface AlbumCfg extends IConfig {
	id:number;
	define?:string;
	name:string;
	icon?:string;
	desc?:string;
	unlockStar?:number;
}

export const AlbumDefine = {
    "Default": 1
}

export class AlbumCfgReader extends TConfig<AlbumCfg> {
    protected _name : string = "Album";


}