import { TConfig } from "./TConfig";


export interface InviteCfg extends IConfig {
	id:number;
	awardType:number;
	awardCount:number;
}



export class InviteCfgReader extends TConfig<InviteCfg> {
    protected _name : string = "Invite";


}