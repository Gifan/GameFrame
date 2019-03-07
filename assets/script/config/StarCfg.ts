import { TConfig } from "./TConfig";
import { Cost } from "../common/Cost";


export interface StarCfg extends IConfig {
	id:number;
	star:number;
	reward:Cost[];
}



export class StarCfgReader extends TConfig<StarCfg> {
    protected _name : string = "Star";


}