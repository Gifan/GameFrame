import { TConfig } from "./TConfig";


export interface StrikeCfg extends IConfig {
	id:number;
	button:string;
	rewardType:number;
	shareCount:number;
	videoCount:number;
	diamondCount:number[];
}



export class StrikeCfgReader extends TConfig<StrikeCfg> {
    protected _name : string = "Strike";


}