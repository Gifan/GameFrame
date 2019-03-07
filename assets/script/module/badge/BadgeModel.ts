import { MVCS } from "../../../frame/mvcs/MVCS";
import { Badge } from "../../message/Badge";
import { Cfg } from "../../config/Cfg";

declare interface Map{
    [key:number] : Badge;
}

export class BadgeModel extends MVCS.AbsModel {
    public constructor() {
        super("_Badge", MVCS.eDataType.Temp);

        let cfgs = Cfg.Badge.getAll();
        for (const key in cfgs) {
            const cfg = cfgs[key];                
            let badge = new Badge(cfg.id);
            this.add(badge);
            if (cfg.father != null) {
                let father = this.get(cfg.father);
                if (father == null) {
                    cc.error("BadgeModel father null, id:", cfg.id);
                    continue;
                }
                father.addChildren(badge);
                badge.parent = father;
            }
        }
    }

    public reset() : void {
        for (const key in this._map) {
            const badge = this._map[key];                
            badge.reset();
        }
    }

    private _map : Map = {};

    public get(id : number) {
        return this._map[id];
    }

    public add(badge : Badge) {
        if (this._map[badge.id] != null) {
            cc.error("BadgeModel.add multi times, id:", badge.id);
        }            
        this._map[badge.id] = badge;
    }
}