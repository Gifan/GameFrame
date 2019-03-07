import { TConfig } from "./TConfig";
import { Cost } from "../common/Cost";


export interface SceneCfg extends IConfig {
	id:number;
	define?:string;
	name?:string;
	path:string;
	icon?:string;
	vo?:string;
	unlock?:object;
	rewards?:Cost[][];
	music?:number;
	album:number;
	cost?:Cost;
}

export const SceneDefine = {
    "Login": 1,
    "Main": 2,
    "Guide": 1000,
    "Frist": 1001
}

export class SceneCfgReader extends TConfig<SceneCfg> {
    protected _name : string = "Scene";


}