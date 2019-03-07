import { TConfig } from "./TConfig";


export interface FuncCfg extends IConfig {
	id:number;
	define?:string;
	name?:string;
	view?:string;
	father?:number;
	icon?:string;
	unlock?:object;
}

export const FuncDefine = {
    "Login": 1,
    "Setting": 2,
    "Affirm": 3,
    "SceneLoading": 4,
    "FlowTips": 5,
    "Guide": 6,
    "ItemTrack": 7,
    "Main": 8,
    "Fight": 9,
    "Settle": 10,
    "More": 11,
    "Sign": 12,
    "Raffle": 13,
    "Shop": 14,
    "Invite": 15,
    "Rank": 16,
    "Album": 17,
    "AlbumPick": 18,
    "Chest": 19,
    "Energy": 20,
    "GetReward": 21,
    "Stage": 22
}

export class FuncCfgReader extends TConfig<FuncCfg> {
    protected _name : string = "Func";


}