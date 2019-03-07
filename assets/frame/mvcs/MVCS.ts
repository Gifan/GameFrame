export namespace MVCS {
    export enum eDataType {
        //临时数据，不保存
        Temp,
        //本地保存
        Loacl,
        //网络保存
        Net,        
    }

    export abstract class AbsModel {
        public constructor(type : string, dataType = eDataType.Net) {
            this._type = type;
            this._dataType = dataType;
        }

        /*
        * 类名做为容器唯一标示
        */
        private _type : string;
        public getType() {
            return this._type;
        };

        private _dataType : eDataType;
        public get dataType() {
            return this._dataType;
        };

        protected _changed = false;
        public get changed() {
            return this._changed;
        };

        public setChanged() {
            this._changed = false;
        };

        public reset() : void { }

        /*
        * 返回序列化保存的字符串
        */
        public serialize( ) : string { return null; }
    }

    export abstract class AbsNet<TModel extends AbsModel> {
        public constructor() {
            this.register();
        }
    
        protected _model : TModel;
        public initModel(model : TModel) : void {
            this._model = model;
        }
    
        protected abstract register() : void;
        public abstract reset() : void;
    }

    export class LogicContainer {
        private static s_container : Array<AbsLogic> = [];
        public static add<T extends AbsLogic>(instance : AbsLogic) : void {
            const name = instance.getType();
            if (LogicContainer.getInstance(name) != null) {
                cc.error("LogicContainer.Add repeat:" + name, instance);
                return;
            }
            LogicContainer.s_container.push(instance);
        }

        public static getInstance<T extends AbsLogic>(name : string) : T {
            for (const item of LogicContainer.s_container) {
                if (item.getType() == name) {
                    return item as T;
                }
            }

            return null;
        }

        public static reset() : void {
            for (let i = 0; i < LogicContainer.s_container.length; i++) {
                LogicContainer.s_container[i].reset();
            }
        }
    }

    /// <summary>
    /// 模块代理基类
    /// </summary>
    export abstract class AbsLogic {
        public constructor(type : string) {
            this._type = type;
            LogicContainer.add(this);
        }

        protected _isSetup : boolean;
        public get isSetup() : boolean { 
            return this._isSetup;
        }

        //类名做为容器唯一标示
        private _type : string;
        public getType() {
            return this._type;
        };

        public abstract setup(model?, net?) : boolean;
        public abstract reset() : void;
        protected changeListener(enable : boolean) : void { }
    }

    export class MLogic<TModel extends AbsModel> extends AbsLogic {
        public constructor(type : string) {
            super(type);
        }

        protected _model : TModel;
        public setup(model?:TModel, net?) : boolean {
            if (this.isSetup) {
                return true;
            }
            this._isSetup = true;

            this._model = model;// new TModel();
            return false;
        }

        public reset() : void {
            if (!this.isSetup) {
                return ;
            }

            this._model.reset();
        }
    }

    /// <summary>
    /// Logic with Model,Net
    /// </summary>
    /// <typeparam name="TModel"></typeparam>
    /// <typeparam name="TNet"></typeparam>
    export class MNLogic<TModel extends AbsModel, TNet extends AbsNet<TModel>> extends AbsLogic {
        public constructor(type : string) {
            super(type);
        }

        protected _model : TModel;
        protected _net : TNet;
        public get net() : TNet {
            return this._net;
        }

        public setup(model?:TModel, net?:TNet) : boolean {
            if (this.isSetup) {
                return true;
            }
            this._isSetup = true;

            this._model = model;
            this._net = net;
            this._net.initModel(this._model);
            return false;
        }

        public reset() : void {
            if (!this.isSetup) {
                return;
            }

            this._model.reset();
            this._net.reset();
        }
    }

    /*****************************************************************************************************************/

    type LoadAssetHandler = (name: string, path: string, type: typeof cc.Asset, callback: (name: string, asset: object) => void, target: any ) => void;
    type Node = cc.Node

    /// <summary>
    /// 加载状态
    /// </summary>
    export enum eLoadState {
        Unload,
        Loading,
        Loaded,
    }

    /// <summary>
    /// UI分层
    /// </summary>
    export enum eUILayer {
        /// <summary>
        /// 场景UI
        /// </summary>
        Scene,
        /// <summary>
        /// 主界面
        /// </summary>
        Main,
        /// <summary>
        /// 打开的界面
        /// </summary>
        Panel,
        /// <summary>
        /// 弹出的次级界面
        /// </summary>
        Popup,
        /// <summary>
        /// 临时存在的提示
        /// </summary>
        Tips,
        /// <summary>
        /// 进度加载界面
        /// </summary>
        Loading,
        /// <summary>
        /// 新手引导界面
        /// </summary>
        Guide,

        Max
    }

    /// <summary>
    /// UI互斥分类
    /// </summary>
    export enum eUIQueue {
        Main,
        Panel,
        Tips,
        None,
    }

    /*
    * UI应答选项
    */
    export enum eReplyOption {
        //超时
        Timeout = -2,
        //拒绝
        Refuse = -1,
        //取消
        Cancel = 0,
        //确定
        Confirm = 1,
    }


    /// <summary>
    /// 打开消息结构
    /// </summary>
    export class OpenArgs {
        private _id : number;
        public get id() : number { 
            return this._id;
        }
        public SetId(id : number) : OpenArgs {
            this._id = id;
            return this;
        }

        private _index : number;
        public get index() : number { 
            return this._index;
        }
        public SetIndex(index : number) : OpenArgs {
            this._index = index;
            return this;
        }

        private _tab : number;
        public get tab() : number { 
            return this._tab;
        }
        public SetTab(tab : number) : OpenArgs {
            this._tab = tab;
            return this;
        }

        private _select : number;
        public get select() : number { 
            return this._select;
        }
        public SetSelect(select : number) : OpenArgs {
            this._select = select;
            return this;
        }

        private _num : number;
        public get num() : number { 
            return this._num;
        }
        public SetNum(num : number) : OpenArgs {
            this._num = num;
            return this;
        }

        /// <summary>
        /// 回调函数，可选
        /// </summary>
        private _callback : (result : eReplyOption, param : object) => void;
        public get callback() { 
            return this._callback;
        }

        public SetCallback(callback : (result : eReplyOption, param : object) => void) : OpenArgs {
            this._callback = callback;
            return this;
        }

        /// <summary>
        /// 回调上下文，可选
        /// </summary>
        private _context : any;
        public get context() : any { 
            return this._context;
        }
        public SetContext(context : any) : OpenArgs {
            this._context = context;
            return this;
        }

        /// <summary>
        /// 回调参数，可选
        /// </summary>
        private _param : any;
        public get param() : any { 
            return this._param;
        }
        public SetParam(param : any) : OpenArgs {
            this._param = param;
            return this;
        }
    }
        
    export enum eAffirmStyle {
        //
        Yes = 1,
        //
        YesOrNo = 3,
    }

    /// <summary>
    /// 二次确认参数
    /// </summary>
    export class AffirmArgs extends OpenArgs {
        private _info : string;

        /// <summary>
        /// 文字内容，必选
        /// </summary>
        public get info() : string { 
            return this._info; 
        }
        public SetInfo(info : string) : AffirmArgs {
            this._info = info;
            return this;
        }

        private _title : string;
        /// <summary>
        /// 标题，可选
        /// </summary>
        public get title() : string { 
            return this._title; 
        }
        public SetTitle(title : string) : AffirmArgs {
            this._title = title;
            return this;
        }

        private _style : eAffirmStyle = eAffirmStyle.Yes;
        /// <summary>
        /// 确认风格
        /// </summary>
        public get style() : eAffirmStyle { 
            return this._style; 
        }
        public SetStyle(style : eAffirmStyle) : AffirmArgs {
            this._style = style;
            return this;
        }
    }

    //和AbsView定义放一起，防止相互import不完全
    export class ViewHandler {
        private static _loadAssetHandler : LoadAssetHandler;
        public static get loadAssetHandler() : LoadAssetHandler { 
            return ViewHandler._loadAssetHandler;
        }

        private static _unloadAssetHandler : (name: string) => void;
        public static get unloadAssetHandler() : (name: string) => void { 
            return ViewHandler._unloadAssetHandler;
        }

        public static initAssetHandler(loadAsset : LoadAssetHandler, unloadAsset : (name: string) => void) : void {
            ViewHandler._loadAssetHandler = loadAsset;
            ViewHandler._unloadAssetHandler = unloadAsset;
        }

        private static _onOpenEvent : (view : AbsView) => void;
        public static get onOpenEvent() : (view : AbsView) => void { 
            return ViewHandler._onOpenEvent;
        }

        private static _onCloseEvent : (view : AbsView) => void;
        public static get onCloseEvent() : (view : AbsView) => void { 
            return ViewHandler._onCloseEvent;
        }

        public static initUIEvent(onOpen: (view : AbsView) => void, onClose: (view : AbsView) => void) : void {
            ViewHandler._onOpenEvent = onOpen;
            ViewHandler._onCloseEvent = onClose;
        }
    }

    /// <summary>
    /// UI切换过渡动画
    /// </summary>
    export interface ITransition {
        init(node : Node) : void;
        show() : void;
        hide() : void;
    }

    export interface IViewConstructor {
        new ();
    }

    //标准分辨率中心坐标
    let _designCenter : cc.Vec2;
    /*
    * 标准分辨率大小
    */
    export function designCenter() : cc.Vec2 {
        return _designCenter;
    }

    let _designResolution : cc.Size;
    /*
    * 标准分辨率大小
    */
    export function designResolution() : cc.Size {
        return _designResolution;
    }

    let _contentResolution : cc.Size;
    /*
    * 内容拉伸的大小
    */
    export function contentResolution() : cc.Size {
        return _contentResolution;
    }

    let _bgResolution : cc.Size;
    /*
    * 背景缩放大小
    */
    export function bgResolution() : cc.Size {
        return _bgResolution;
    }

    //刘海屏留出偏移
    let _bangsScreenOffset = 100;
    let _bangsScreenHalfOffset = _bangsScreenOffset / 2;
    let _isBangsScreen : boolean = false;

    /**
     * 是否刘海屏
     */
    export function isBangsScreen() : boolean{
        return _isBangsScreen;
    }

    export function initResolution(root : cc.Node, resolution : cc.Size) : void {
        _designResolution = resolution;

        _designCenter = cc.v2(
            resolution.width / 2,
            resolution.height / 2
        );

        let size = cc.view.getCanvasSize();
        let scaleX = size.width / resolution.width;
        let scaleY = size.height / resolution.height;
        let contentScale : number;
        let bgScale : number;
        if (scaleX <= scaleY) {
            contentScale = scaleX;
            bgScale = size.height / (resolution.height * contentScale);
        } else {
            contentScale = scaleY;
            bgScale = size.width / (resolution.width * contentScale);
        }

        _contentResolution = cc.size(
            Math.ceil(size.width / contentScale),
            Math.ceil(size.height / contentScale),
        );

        _bgResolution = cc.size(
            Math.ceil(resolution.width * bgScale),
            Math.ceil(resolution.height * bgScale)
        );

        //cc.error(scaleX, scaleY, "content", contentScale, "bg", bgScale, "size", size, _contentResolution, _bgResolution);

        let ratio : number;
        if (size.width > size.height) {
            ratio = size.width / size.height;

            //通过长宽比判断是否刘海屏
            if (ratio > 1.97) {
                _isBangsScreen = true;

                //全面屏需要留出空间
                _contentResolution.width -= _bangsScreenOffset;
                _designCenter.x -= _bangsScreenHalfOffset;
                //_origin.x += _bangsScreenOffset;
                root.x += _bangsScreenOffset;

           }            
        } else {
            ratio = size.height / size.width;

            //通过长宽比判断是否刘海屏
            if (ratio > 1.97) {
                _isBangsScreen = true;

                //全面屏需要留出空间
                _contentResolution.height -= _bangsScreenOffset;
                _designCenter.y -= _bangsScreenHalfOffset;
                //不需要改变原点
            }  
        }
        //cc.error("isBangsScreen", ratio, _contentResolution, _designCenter);
    }

    /*
    * UI显示类
    */
    export abstract class AbsView {
        /*
         * asset 资源加载路径或者已经在场景中的资源节点
         * uiLayer ui所在图层，决定遮盖关系
         * uiQueue ui在打开队列，同一队列的UI，后打开的后隐藏之前的，关闭后会恢复之前的，通过UIManager.closeQueues来关闭之前的ui
         * transition 打开关闭动画
         */
        public constructor(asset : string | Node, uiLayer : eUILayer, uiQueue : eUIQueue, transition : ITransition) {
            this._uiLayer = uiLayer;
            this._uiQueue = uiQueue;
            this._transition = transition;

            if (typeof asset === "string") {
                let names = asset.split(`/`);
                this._assetName = names[names.length - 1];
                this._assetPath = asset;            
            } else {
                this._needContentFitScreen = false;
                this._loadState = eLoadState.Loaded;
                this._assetName = asset.name;
                this.onSetNode(asset, false);
            }
        }

        private _assetName: string;
        /// <summary>
        /// UI Prefab路径
        /// </summary>
        private _assetPath : string;
        public get assetPath() {
            return this._assetPath;
        }

        private _uiLayer : eUILayer;
        public get uiLayer() : eUILayer {
            return this._uiLayer;
        }

        private _uiQueue : eUIQueue = eUIQueue.None;
        public get uiQueue() : eUIQueue {
            return this._uiQueue;
        }

        private _node : Node;
        public get node()  : Node{
            return this._node;
        }

        private _parent : Node;
        public get parent() : Node {
            return this._parent;
        }

        public setParent(parent : Node, worldPositionStays : boolean) : void {
            this._parent = parent;
            if (this._node != null) {
                this._node.parent = parent;
                if (!worldPositionStays) {
                    this._node.position = cc.Vec2.ZERO;
                    this._node.rotation = 0;                   
                    this._node.scale = 1;
                }
            }
        }

        /// <summary>
        /// UI进入，退出动画控制
        /// </summary>
        private _transition : ITransition;

        private _loadState : eLoadState = eLoadState.Unload;
        public get loadState() : eLoadState {
            return this._loadState;
        }

        private static kPrefabType = cc.Prefab;
        private load() : void {
            if (ViewHandler.loadAssetHandler == null) {
                cc.log(this._assetName + ".load init loadAssetEvent frist");
                return;
            }
            if (this._loadState != eLoadState.Unload) {
                cc.error(this._assetName + ".load multi times");
                return;
            }
            this._loadState = eLoadState.Loading;

            ViewHandler.loadAssetHandler(this._assetName, this._assetPath, AbsView.kPrefabType, this.onLoadCallback, this);
        }

        private onLoadCallback(name : string, asset : object) : void {
            let prefab : Node = asset as Node;
            if (prefab == null) {
                cc.error(this._assetName + ".loadCallback GameObject null:" + name);
                return;
            }
            if (this._loadState != eLoadState.Loading) {
                //中途已经取消加载，应该回收资源
                return;
            }
            this._loadState = eLoadState.Loaded;

            let node : Node = cc.instantiate<Node>(prefab);
            this.onSetNode(node, false);
        }

        protected setGroup(node : cc.Node, group : string) {
            node.group = group;
            for (let index = 0; index < node.childrenCount; index++) {
                const child = node.children[index];
                this.setGroup(child, group);
            }
        }

        protected _needContentFitScreen = true;
        /*
        * 屏幕适配
        */
        protected setContentFitScreen() : void {
            let size = this.node.getContentSize();
            if (!size.equals(_designResolution)) {
                //cc.warn(this._assetName, "setFitScreen skip");
                return;
            }
            this.node.setContentSize(_contentResolution);            
            if (_isBangsScreen) {
                this.node.y -= _bangsScreenOffset;
            }
            //cc.error(this._assetName, "setFitScreen", this._needContentFitScreen, _contentResolution, this.node.y);
            // let widgets = this.node.getComponentsInChildren(cc.Widget);
            // for (let index = 0; index < widgets.length; index++) {
            //     const widget = widgets[index];
            //     widget.updateAlignment();                
            // }
        }

        protected setBgFitScreen(bgNode : cc.Node) : void {
            bgNode.setContentSize(_bgResolution);
        }

        private onSetNode(node :Node, worldPositionStays : boolean) : void {
            this._node = node;
            node.setGroup("UI");
            if (this._parent) {
                this.setParent(this._parent, worldPositionStays);                
            }
            if (this._needContentFitScreen) {
                this.setContentFitScreen();                
            }
            this._transition.init(node);

            this.onLoad();

            if (!this._isOpened) {
                //中途关闭界面
                this._transition.hide();
                return;
            }

            this.onOpen();
        }

        /// <summary>
        /// 设置UI根GameObject，用于不使用Loader加载的UI资源
        /// </summary>
        /// <param name="go"></param>
        public setNode(node : Node, relocaltion : boolean) : void {
            if (node == null) {
                cc.error(this._assetName + ".SetGameObject GameObject null");
                return;
            }
            if (this._loadState != eLoadState.Unload) {
                cc.error(this._assetName + ".SetGameObject loadState error:" + node.name + " " + this._loadState);
                return;
            }
            this.onSetNode(node, relocaltion);
        }

        protected abstract onLoad() : void;

        public unload() : void {
            if (this._loadState == eLoadState.Unload) {
                cc.error(this._assetName + ".Unload multi times");
                return;
            }

            if (this._loadState == eLoadState.Loading) {
                //加载中途取消
                this._loadState = eLoadState.Unload;
                return;
            }
            this._loadState = eLoadState.Unload;

            if (this._isOpened) {
                this.close();
            }

            this.onUnload();

            cc.warn("view.unload", this._assetPath);

            //最后才销毁
            if (this._node != null) {
                //回收动态加载的图片
                // let loaders : GraphicLoader[] = this.m_gameObject.getComponents<GraphicLoader>();
                // for (int i = 0; i < loaders.Length; i++) {
                //     loaders[i].UnLoad();
                // }

                this._node.destroy();
                this._node = null;
            }
            if (ViewHandler.unloadAssetHandler == null) {
                cc.error(this._assetName + ".unload init unloadAssetHandler frist");
                return;
            }
            //通知资源管理
            if (this._assetPath != null) {
                ViewHandler.unloadAssetHandler(this._assetPath);
            }
        }

        protected abstract onUnload() : void;

        protected _openArgs : OpenArgs;
        public setOpenArgs(openArgs : OpenArgs) : void {
            this._openArgs = openArgs;
        }

        private _isOpened : boolean = false;
        public get isOpened() : boolean {
            return this._isOpened;
        }

        public open() : void {
            if (this._isOpened) {
                return;
            }
            this._isOpened = true;
            this._isWaitingShow = true;
            //cc.warn("view.open:" + this._assetName);

            switch (this._loadState) {
                case eLoadState.Unload:
                    this.load();
                    break;
                case eLoadState.Loading:
                    break;
                case eLoadState.Loaded:
                    this.onOpen();
                    break;
                default:
                    cc.error(this._assetName + ".Open unsupport loadState:" + this._loadState);
                    break;
            }

            for (let index = 0; index < this._children.length; index++) {
                const childview = this._children[index];
                childview.open();
            }
        }

        /// <summary>
        /// 每次打开UI只会调用一次
        /// </summary>
        protected onOpen() : void {
            this.changeListener(true);
            ViewHandler.onOpenEvent(this);
            if (this._isWaitingShow) {
                this._isWaitingShow = false;
                this.show();
            }
        }

        public close() : void {
            if (!this._isOpened) {
                return;
            }
            this._isOpened = false;
            //cc.warn("view.close:" + this._assetName);

            for (let index = 0; index < this._children.length; index++) {
                const childview = this._children[index];
                childview.close();
            }

            this.hide();
            this.onClose();
        }

        /// <summary>
        /// 每次打开UI只会调用一次，一般用于资源回收
        /// </summary>
        protected onClose() : void {
            this.changeListener(false);
            this.onHide();
            ViewHandler.onCloseEvent(this);
        }

        /// <summary>
        /// 是否等待显示中
        /// </summary>
        private _isWaitingShow : boolean = false;

        private _isShowed : boolean = false;
        public get isShowed() : boolean {
            return this._isShowed;
        }

        public show() : void {
            if (this._loadState < eLoadState.Loaded) {
                this._isWaitingShow = true;
            }
            if (this._isShowed) {
                return;
            }
            this._isShowed = true;

            this.onShow();

            for (let index = 0; index < this._children.length; index++) {
                const childview = this._children[index];
                childview.show();
            }
        }

        protected onShow() : void {
            this._transition.show();
        }

        public hide() : void {
            if (this._loadState < eLoadState.Loaded) {
                this._isWaitingShow = false;
            }
            if (!this._isShowed) {
                return;
            }
            this._isShowed = false;

            for (let index = 0; index < this._children.length; index++) {
                const childview = this._children[index];
                childview.hide();
            }
            
            this.onHide();
        }

        protected onHide() : void {
            this._transition.hide();
        }

        /// <summary>
        /// 设置事件监听
        /// </summary>
        /// <param name="enable"></param>
        protected changeListener(enable : boolean) : void {

        }

        protected onClickFrame() {
            //点击UI框，屏蔽底部的UI
        }

        protected _children : AbsView[] = [];
        /*
        * 添加子视图，会跟父视图一起刷新
        * 禁止出现环形引用，会导致死循环
        */
        protected addChildren(view : AbsView) {
            if (this._children.contains(view)) {
                cc.error("AddChildren repetition", this._assetName, view._assetName);
                return;
            }
            this._children.push(view);
            if (this._isOpened) {
                view.open();
            }
        }

        protected delChildren(view : AbsView) {
            let suss = this._children.remove(view);
            if (!suss) {
                cc.warn("DelChildren can't find", this._assetName, view._assetName);
            }
        }
    }

}

