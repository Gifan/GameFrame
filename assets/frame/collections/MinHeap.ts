type CompareDelegate = (left, right) => number

/// <summary>
/// 最小堆容器，排序不稳定
/// </summary>
/// <typeparam name="T"></typeparam>
export class MinHeap<T> {

    private _size = 0;
    private _element: T[];
    private _compareEv: CompareDelegate;
    public constructor(compareEv: CompareDelegate) {
        this._compareEv = compareEv;
        this._element = new Array();
    }

    public clear(action: (t: T) => void = null, target = null) {
        if (this._element == null) {
            return;
        }
        this._size = 0;
        if (action != null) {
            this._element.forEach(element => {
                action.call(target, element);
            });
        }
        this._element.splice(0, this._element.length);
    }

    public frist(predicate: (t: T) => boolean, target = null): T {
        if (predicate == null) {
            cc.error("MinHeap Frist predicate null");
            return null;
        }
        if (this._element == null) {
            return null;
        }

        for (let index = 0; index < this._element.length; index++) {
            const element = this._element[index];
            if (predicate.call(target, element)) {
                return element;
            }
        }
        return null;
    }

    public forEach(action: (t: T) => void, target: any) {
        if (this._element == null) {
            return;
        }
        this._element.forEach(element => {
            action.call(target, element);
        });
    }

    private m_emptyNum = 0;
    private m_log = "";
    private toStringT(t: T) {
        if (t == null) {
            ++this.m_emptyNum;
            return;
        }
        this.m_log += t.toString() + "\n";
    }

    public toString() {
        this.m_emptyNum = 0;
        this.m_log = "";
        this.forEach(this.toStringT, this);
        if (this.m_emptyNum > 0) {
            this.m_log += "empty:" + this.m_emptyNum;
        }
        return this.m_log;
    }

    public get size() {
        return this._size;
    }

    public add(t: T) {
        let index = this._size++;
        this.up(index, t);
    }

    public del(t: T) {
        let index = this._element.indexOf(t);
        if (index < 0) {
            return;
        }
        --this._size;
        this.down(index, this._element[this._size]);
        this.insert(this._size, null);
    }

    public peek(): T {
        if (this._size <= 0) {
            return null;
        }
        return this._element[0];
    }

    public pop(): T {
        if (this._size <= 0) {
            return null;
        }
        let t: T = this._element[0];
        let index = --this._size;
        this.down(0, this._element[index]);
        this.insert(index, null);
        return t;
    }

    /// <summary>
    /// 更改排序
    /// </summary>
    /// <param name="t">更改目标</param>
    /// <param name="increase">排序权值是否增加</param>
    public change(t: T, increase: boolean) {
        let index = this._element.indexOf(t);
        if (index < 0) {
            return;
        }
        if (increase) {
            this.down(index, t);
        } else {
            this.up(index, t);
        }
    }

    private insert(index: number, t: T) {
        if (this._element.length <= index) {
            this._element.splice(index, 0, t);
        } else {
            this._element[index] = t;
        }
    }

    private up(index: number, t: T) {
        while (index > 0) {
            let parent = (index - 1) / 2;
            let tmp = this._element[parent];
            if (this._compareEv(this._element[parent], t) < 0) {
                break;
            }
            this.insert(index, tmp);
            index = parent;
        }
        this.insert(index, t);
    }

    private down(index: number, t: T) {
        let half = this._size / 2;
        while (index < half) {
            let child = 2 * index + 1;
            let right = child + 1;
            let childT = this._element[child];
            let rightT = this._element[right];
            if (right < this._size && this._compareEv(childT, rightT) > 0) {
                child = right;
            }
            if (this._compareEv(t, this._element[child]) < 0) {
                break;
            }
            this.insert(index, this._element[child]);
            index = child;
        }
        this.insert(index, t);
    }
}