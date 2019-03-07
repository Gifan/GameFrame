import { TConfig } from "./TConfig";


export interface BadgeCfg extends IConfig {
	id:number;
	define?:string;
	name?:string;
	father?:number;
}

export const BadgeDefine = {
    "Invite": 1,
    "Raffle": 2,
    "Shop": 3,
    "Sign": 4,
    "Rank": 5
}

export class BadgeCfgReader extends TConfig<BadgeCfg> {
    protected _name : string = "Badge";


}