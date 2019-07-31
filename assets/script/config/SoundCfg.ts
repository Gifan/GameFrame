import { TConfig } from "./TConfig";


export interface SoundCfg extends IConfig {
	id:number;
	name:string;
	path:string;
	volume:number;
	loop:boolean;
}



export class SoundCfgReader extends TConfig<SoundCfg> {
    protected _name : string = "Sound";


}