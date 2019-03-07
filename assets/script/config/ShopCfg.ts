import { TConfig } from "./TConfig";


export interface ShopCfg extends IConfig {
	id:number;
	name:string;
	icon:string;
	index:number;
	relateType:number;
	relateId:number;
	oneNum:number;
	timesMax:number;
	timesType:number;
	priceId:number;
	price:number;
	rawPrice:number;
	discountStartTime?:string;
	discountEndTime?:string;
	desc?:string;
}



export class ShopCfgReader extends TConfig<ShopCfg> {
    protected _name : string = "Shop";


}