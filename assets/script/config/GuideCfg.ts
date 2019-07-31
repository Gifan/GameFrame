import { TConfig } from "./TConfig";


export interface GuideCfg extends IConfig {
	guideId:number;
	type:number;
	clickAnyClose:number;
	eventId:number;
	condition:object;
	nodeTag:number;
	shape:number;
	rectSize:number[];
	lightSize:number[];
	arrowPos:number[];
	arrowDir:number;
	tipsContent:string;
	tipsPos:number[];
	nextId:number;
}



export class GuideCfgReader extends TConfig<GuideCfg> {
    protected _name : string = "Guide";


}