import { TConfig } from "./TConfig";


export interface BossCfg extends IConfig {
	id:number;
	bronRule:number[];
	bosstime:number;
}



export class BossCfgReader extends TConfig<BossCfg> {
    protected _name : string = "Boss";


}