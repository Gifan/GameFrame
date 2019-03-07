import { TConfig } from "./TConfig";


export interface InviteCfg extends IConfig {
	id:number;
	items:number[];
	counts:number[];
	doubles:number[];
	doubleTypes:number[];
	showType:number;
}



export class InviteCfgReader extends TConfig<InviteCfg> {
    protected _name : string = "Invite";


}