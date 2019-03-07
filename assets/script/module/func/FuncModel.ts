import { MVCS } from "../../../frame/mvcs/MVCS"
import { FuncVo } from "./FuncVo";
import { Const } from "../../config/Const";

export class FuncModel extends MVCS.AbsModel {
    public constructor() {
        super("_Func");
    }
    public reset() : void {
        
    }

    private _vo : FuncVo = new FuncVo();
    public get vo(){return this._vo;};

    public serialize( ) : string { 
        let data = {
            shareNum : this.vo.shareNum,
            firstTime : this.vo.firstTime,
        }
        return JSON.stringify(data); 
    }

    public initFunc(data: any){
        if(data === null){
            this.vo.shareNum = 0;
            this.vo.firstTime = "";
        }else{
            this.vo.shareNum = data.shareNum;
            this.vo.firstTime = data.firstTime;
        }
    }
    
    public getShareNum(){
        return this._vo.shareNum;
    }
    public updateShareNum(){
        this._vo.shareNum += 1;
        if(this._vo.shareNum >= Const.EnergyShareTimes){
            this._vo.shareNum = Const.EnergyShareTimes;
        }
    }
    public resetNum(){
        this._vo.shareNum = 0;
    }

    public getFirstTime(){
        return this._vo.firstTime;
    }

    public setFirstTime(firstTime: string){
        this._vo.firstTime = firstTime;
    }

}