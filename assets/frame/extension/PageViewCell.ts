import { Cell } from "./Cell";

type EventHandler = (index : number) => void;
type EventHandlerWithSelf = (slider : PageViewCell, index : number) => void;

export class PageViewCell extends Cell {
    public Init(node : cc.Node) {
        super.Init(node);
        
        this._pageView = node.getComponent(cc.PageView);
    }

    private _pageView : cc.PageView;
    private _initListener = false;
    private _handler : EventHandler;
    private _handlerWithSelf : EventHandlerWithSelf;
    private _target :any;

    private initListener() {
        if (this._initListener) {
            return;
        }
        this._initListener = true;

        this._node.on("page-turning", this.onPageTurning, this)
    }

    private onPageTurning(event) : void {
        // console.log(this.node.name, "PageViewCell.onPageTurning", event);

        if (this._handler != null) {
            this._handler.call(this._target, this._pageView.getCurrentPageIndex());
        } else if (this._handlerWithSelf != null) {
            this._handlerWithSelf.call(this._target, this, this._pageView.getCurrentPageIndex());
        }
    }

    public getCurrentPageIndex(): number{
        return this._pageView.getCurrentPageIndex();
    }

    public setCurrentPageIndex(index: number){
        this._pageView.setCurrentPageIndex(index);
    }

    public scrollToPage(index: number, time:number){
        this._pageView.scrollToPage(index, time);
    }

    public addPage(node: cc.Node){
        this._pageView.addPage(node);
    }

    public insertPage(node: cc.Node, index: number){
        this._pageView.insertPage(node, index);
    }

    public getPages(){
        return this._pageView.getPages();
    }

    
    /// <summary>
    /// 设置点击事件回调，不支持多个回调，每次设置覆盖之前的回调
    /// </summary>
    public SetListener(handler : EventHandler, target : any) : void {
        this.initListener();
        this._handler = handler;
        this._handlerWithSelf = null;
        this._target = target;
    }

    /// <summary>
    /// 设置点击事件回调，不支持多个回调，每次设置覆盖之前的回调
    /// </summary>
    public SetListenerWithSelf(handler : EventHandlerWithSelf, target : any) : void {
        this.initListener();
        this._handler = null;
        this._handlerWithSelf = handler;
        this._target = target;
    }

    /// <summary>
    /// 清空点击回调
    /// </summary>
    public ClearListener() : void {
        this._handler = null;
        this._handlerWithSelf = null;
        this._target = null;
    }

    public Free() : void {
        this.ClearListener();
    }

    public get content() : cc.Node {
        return this._pageView.content;
    }

    //支持无限滚动
    
}
