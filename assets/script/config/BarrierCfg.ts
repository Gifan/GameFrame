import { TConfig } from "./TConfig";


export interface BarrierCfg extends IConfig {
	id:number;
	dropTool:number;
	toolPool:number[];
	bronRule:number[];
	unLockTool:number[];
	currencyType:number;
	diamondCount:number;
	powerCount:number;
	dropRule:number;
	extraAward:number[];
	tryOut:number[];
	treasure:number[];
}



export class BarrierCfgReader extends TConfig<BarrierCfg> {
    protected _name : string = "Barrier";


}