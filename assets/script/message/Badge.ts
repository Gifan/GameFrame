import { Notifier } from "../../frame/mvcs/Notifier";
import { NotifyID } from "../../frame/mvcs/NotifyID";
import { ListenID } from "../ListenID";


//小红点红点对象
export class Badge {
    public constructor(id : number) {
        this._id = id;
    }

    private _id : number
    /**
     * id
     */
    public get id() {
        return this._id;
    }

    private _count : number = 0;
    /**
     * id
     */
    public get count() {
        let cnt = this._count;
        if (this.children != null) {
            for (let index = 0; index < this.children.length; index++) {
                const child = this.children[index];
                cnt += child.count;
            }
        }
        return cnt;
    }

    public setCount(cnt : number) {
        this._count = cnt;
        Notifier.send(ListenID.Badge_Changed, this);

        let parent = this.parent;
        while (parent != null) {
            Notifier.send(ListenID.Badge_Changed, parent);
            parent = parent.parent;
        }
    }

    public reset() {
        this._count = 0;
        // if (this.children != null) {
        //     for (let index = 0; index < this.children.length; index++) {
        //         const child = this.children[index];
        //         child.reset();
        //     }
        // }
    }

    public parent : Badge;
    public children : Badge[];

    public addChildren(badge : Badge) {
        if (this.children == null) {
            this.children = [];
        }
        this.children.push(badge);
    }
}