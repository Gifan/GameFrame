import { TConfig } from "./TConfig";
import { eItemType } from "../common/eItemType";
import { eItemSourceType } from "../common/eItemSourceType";


export interface ItemCfg extends IConfig {
	id:number;
	define?:string;
	name:string;
	icon?:string;
	desc?:string;
	type:eItemType;
	max:number;
	relateId?:number;
	sourceTypes?:eItemSourceType[];
	sourceVals?:number[];
}

export const ItemDefine = {
    "Gold": 1,
    "Energy": 2
}

export class ItemCfgReader extends TConfig<ItemCfg> {
    protected _name : string = "Item";


}