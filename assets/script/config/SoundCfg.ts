import { TConfig } from "./TConfig";


export interface SoundCfg extends IConfig {
	id:number;
	define?:string;
	name:string;
	author?:string;
	prob?:number;
	paths:string[];
	weights:number[];
	volume:number;
	remix?:boolean;
	loop?:boolean;
	kind:number;
	prior?:number;
}

export const SoundDefine = {
    "BtnStart": 1,
    "BtnBack": 2,
    "Readygo": 4,
    "Win": 5,
    "Lost": 6,
    "ChestOpen": 7,
    "WinStar": 8
}

export class SoundCfgReader extends TConfig<SoundCfg> {
    protected _name : string = "Sound";


}