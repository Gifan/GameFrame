import { Notifier } from "../../frame/mvcs/Notifier"
import { ListenID } from "../ListenID"

//地图滚动控制
const {ccclass, property} = cc._decorator;

enum ScrollType {
    Back,
    Mid,
    Fore,
}

class MapInfo {
    public index : number;
    public node : cc.Node;

    public constructor(index : number, node : cc.Node) {
        this.index = index;
        this.node = node;
    }
}

@ccclass
export class MapScroll extends cc.Component {
    @property({
        type : cc.Float,
        displayName : "速度%修正[-1,1]"
    })
    adjust: number = 0;

    @property({
        type : [cc.Integer],
        displayName : "显示顺序"
    })
    orders: number[] = [0, 1, 2, 3];

    _type : ScrollType;
    _rawX : number;
    _destX : number;
    _childrens : cc.Node[] = [];
    _pools : cc.NodePool[] = [];
    _content : MapInfo[] = [];
    _orderIndex : number = 0;
    _headX : number;
    _tailX : number;
    _rawCameraX : number;
    _cameraNode : cc.Node;

    start () {
        const name = this.node.name;
        switch (name) {
            case "background":
                this._type = ScrollType.Back;
                if (this.adjust == 0) {
                    this.adjust = 0.95;
                }
                break;
            case "midground":
                this._type = ScrollType.Mid;
                break;
            case "foreground":
                this._type = ScrollType.Fore;
                if (this.adjust == 0) {
                    this.adjust = -0.5;
                }
                break;
            default:
                cc.error("MapScroll name error:" + name);
                this._type = ScrollType.Mid;
                break;
        }

        this._rawX = this.node.x;
        this._childrens = copy(this.node.children);
        for (let i = 0; i < this._childrens.length; i++) {
            const element = this._childrens[i];
            let pool = new cc.NodePool();
            pool.put(element);
            this._pools.push(pool);
        }        

        this._cameraNode = cc.find("Canvas/Main Camera");

        this.reset();
    }

    protected onEnable(): void {
        //cc.log("MapScroll.onEnable", this.node.name);
        this.changeListener(true);
    }

    protected onDisable(): void {
        //cc.log("MapScroll.onDisable", this.node.name);
        this.changeListener(false);
    }

    protected changeListener(enable : boolean) : void {        
        Notifier.changeListener(enable, ListenID.Scene_PlayAgain, this.reset, this);
    }

    protected lateUpdate(): void {
        let dist = this._cameraNode.x - this._rawCameraX;
        this._destX = this._rawX + this.adjust * dist;
        this.node.x = this._destX;

        let center = (this._cameraNode.x - this._rawCameraX) * (1 - this.adjust);
        let min = center - this._cameraNode.width / 2 * 1.5;
        let max = center + this._cameraNode.width / 2 * 1.5;
        let head = this._content[0];    
        if (head.node.x + head.node.width < min) {
            //cc.log(this.node.name + " Push " + min, head);

            this.push(head.index, head.node);
            this._content.shift();
        }

        let tail = this._content[this._content.length - 1];
        if (tail.node.x < max) {
            const order = this.orders[this._orderIndex];
            let node = this.pop(order);
            let info = new MapInfo(order, node);
            this._content.push(info);

            node.setPosition(this._tailX, 0);
            this._tailX += node.width;
            this._orderIndex += 1;
            if (this._orderIndex >= this.orders.length) {
                this._orderIndex = 0;
            }
            //cc.log(this.node.name + " Pop " + this._orderIndex + " " + max, tail.node);
        }
    }

    private reset() {
        this.node.x = this._rawX;
        this._orderIndex = 0;
        this._content.forEach(info => {
            this.push(info.index, info.node);
        });
        this._content = [];

        let domain = this._cameraNode.width * 1.5;
        this._tailX = 0;
        this._rawCameraX = this._cameraNode.x;

        //至少存在一个屏幕
        for (let index = 0; index < this.orders.length; index++) {
            const order = this.orders[index];
            let node = this.pop(order);
            let info = new MapInfo(order, node);
            this._content.push(info);
            node.setPosition(this._tailX, 0);          

            //cc.log(this.node.name + " reset " + this._orderIndex + " " + this._tailX, node);
            if (this._tailX > domain) {
                this._tailX += node.width;
                this._orderIndex = index + 1;
                if (this._orderIndex >= this.orders.length) {
                    this._orderIndex = 0;
                }
                break;
            } else {
                this._tailX += node.width;
            }
        }
    }

    private pop(index : number) {
        if (index < 0) {
            cc.error(this.node.name + " pop error index:" + index);
            index = 0;            
        } else if (index >= this._pools.length) {
            cc.error(this.node.name + " pop error index:" + index);
            index = this._pools.length - 1;
        }        

        let node : cc.Node;
        let pool = this._pools[index];
        if (pool.size() > 0) {
            node = pool.get();
        } else {
            let prefab = this._childrens[index];
            node = cc.instantiate(prefab);
            //node.active = true;
            //cc.log("prefab:\n" + toJson(prefab, ["_parent", "_components"]) + "\ninst:\n" + toJson(node, ["_parent", "_components"]));            
        }      
        node.parent = this.node;
      
        return node;
    }

    private push(index : number, node : cc.Node) {
        if (index < 0) {
            index = 0;
        } else if (index >= this._pools.length) {
            index = this._pools.length - 1;
        }        

        let pool = this._pools[index];
        pool.put(node);
    }
}
