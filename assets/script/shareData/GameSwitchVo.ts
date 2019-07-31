

export class GameSwitchVo { // 分享字段结构体信息
    public result: boolean = true;
    public shop:boolean = false;
    public relive:boolean = false;
    public invite:boolean = false;
    public box:boolean = false;
    public dsp:boolean = false;
    public banner:boolean = false;   //banner误触开关
    public sign: boolean = false;
    public extraReward: boolean = false;   
    public freeGold: boolean = false; 
    public shareContorller: boolean = false;
    public gunAway: boolean = false;
    public signWeapon: boolean = false;     // 主界面签到武器
    public animationGuide: boolean = true;
    public updateSwitchVo(res: any): void {
        Object.getOwnPropertyNames(this).forEach(function (key) {
            if (res.hasOwnProperty(key)) {
                this[key] = res[key];
            }
        }.bind(this));
    }
}
