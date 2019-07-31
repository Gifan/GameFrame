import { TConfig } from "./TConfig";


export interface BulletCfg extends IConfig {
	id:number;
	name:string;
	bulletPath:string;
}



export class BulletCfgReader extends TConfig<BulletCfg> {
    protected _name : string = "Bullet";


}