import { MVCS } from "./mvcs/MVCS"
import { Notifier } from "../frame/mvcs/Notifier";
import { NotifyID } from "../frame/mvcs/NotifyID";

declare interface FuncTypeMap {
    [key: number]: string;
}

declare interface TypeViewMap {
    [key: string]: MVCS.AbsView;
}

let _instance : UIManager;

/*
* UI控制类
*/
export class UIManager {
    //----------------- 外部接口 --------------------------
    public static Init() : void {
        _instance = new UIManager();
        _instance.initRoot();
    }

    public static get root() : cc.Node {
        return _instance._root;
    }

    public static get canvas() : cc.Canvas {
        return _instance._canvas;
    }

    public static get camera() : cc.Camera {
        return _instance._camera;
    }

    private static m_func2viewTypes : FuncTypeMap = {};
    public static RegisterViewType(funcId : number, viewType : string) : void {
        let existType = UIManager.m_func2viewTypes[funcId];
        if (existType != null) {
            cc.warn("UIManager.RegisterViewType repeated funcId:" + funcId + " " + existType + "->" + viewType);
        }
        UIManager.m_func2viewTypes[funcId] = viewType;
    }

    public static Open(type : number, args? : MVCS.OpenArgs ) : void {
        //cc.error("UIManager.Open:" + type);
        let viewType = UIManager.m_func2viewTypes[type];
        if (viewType == null) {
            cc.error("UIManager.Open unregistered funcId:" + type);
            return;
        }            
        _instance.open(viewType, args);
    }

    public static Close(type : number) : void {
        //cc.error("UIManager.Close:" + type);
        let viewType = UIManager.m_func2viewTypes[type];
        if (viewType == null) {
            cc.error("UIManager.Close unregistered funcId:" + type);
            return;
        }
        _instance.close(viewType);
    }

    public static OpenByType(viewType : string, args? : MVCS.OpenArgs ) : void {
        //cc.error("UIManager.OpenByType:" + type);     
        _instance.open(viewType, args);
    }

    public static CloseByType(viewType : string) : void {
        //cc.error("UIManager.Close:" + type);
        _instance.close(viewType);
    }

    public static CloseQueues() : void {
        _instance.closeQueues();
    }

    public static GetOpenCount(layer : MVCS.eUILayer) : number {
        return _instance.getOpenCount(layer);
    }

    // public static ChangeParent(parent : cc.Node, index : number = 999) : void {
    //     if (parent == null) {
    //         parent = cc.director.getScene();
    //     }
    //     _instance._root.parent = parent;
    //     _instance._root.position = cc.v2(kWidth / 2, kHeight / 2);
    //     _instance._root.setSiblingIndex(index);
    // }

    //----------------- 内部实现 --------------------------

    private _root : cc.Node;
    private _canvas : cc.Canvas;
    private _camera : cc.Camera;
    private _layerRoots : cc.Node[];
    private _views : TypeViewMap;
    private _viewQueues : MVCS.AbsView[][];
    private _layerCounts : number[];   

    private constructor() {
        this._views = {};
        this._viewQueues = [];
        for (let i = 0; i < MVCS.eUIQueue.None; i++) {
            this._viewQueues[i] = new Array<MVCS.AbsView>();
        }
        this._layerCounts = [];
        for (let i = 0; i < MVCS.eUILayer.Max; i++) {
            this._layerCounts[i] = 0;
        }

        MVCS.ViewHandler.initUIEvent(this.onOpen.bind(this), this.onClose.bind(this));        
    }

    private initRoot() : void {
        this._canvas = cc.find("Canvas").getComponent(cc.Canvas);
        let resolution = this._canvas.designResolution;
        this._root = new cc.Node("_UIRoot");
        this._root.group = "UI";
        this._root.parent = cc.director.getScene();
        this._root.width = resolution.width;
        this._root.height = resolution.height;
        this._root.setAnchorPoint(0, 0);
        cc.game.addPersistRootNode(this._root);

        let cameraNode = new cc.Node("_UICamera");
        cameraNode.parent = this._root;
        cameraNode.position = cc.v2(resolution.width / 2, resolution.height /2);
        this._camera = cameraNode.addComponent(cc.Camera);
        this._camera.cullingMask = 1<<5;
        this._camera.depth = 1;

        //cc.error("ui camera.cullingMask", this._camera.cullingMask);    

        this._layerRoots = new Array<cc.Node>();
        for (let i = MVCS.eUILayer.Scene; i < MVCS.eUILayer.Max; i++) {
            this._layerRoots[i] = this.addSubCanvas(MVCS.eUILayer[i], resolution);
        }

        MVCS.initResolution(this._root, resolution);
    }

    private addSubCanvas(name : string, resolution : cc.Size) : cc.Node {
        let node = new cc.Node(name + "_Root");
        node.setGroup("UI");
        node.parent = this._root;
        node.width = resolution.width;
        node.height = resolution.height;
        node.position = cc.Vec2.ZERO;
        node.rotation = 0;
        node.scale = 1;

        return node;
    }
    
    private open(type : string, args : MVCS.OpenArgs) : void {
        //cc.warn("UIManager.open:" + type);
        let view : MVCS.AbsView = this._views[type];
        if (view == null) {
            let mod = require(type);
            let modClass = mod[type];
            //let modClass = mod.default;
            view = new modClass() as MVCS.AbsView;
            view.setParent(this._layerRoots[view.uiLayer], false);
            this._views[type] = view;

            //cc.log("UIManager.open ", type, view)
        }

        if (view.isOpened) {
            cc.error("UIManager.open:" + type + " is repeatedly");
            return;
        }

        view.setOpenArgs(args);
        view.open();
    }

    private onOpen(view : MVCS.AbsView) : void {
        this._layerCounts[view.uiLayer] = this._layerCounts[view.uiLayer] + 1;
        Notifier.send(NotifyID.View_Opened, view);

        if (view.uiQueue == MVCS.eUIQueue.None) {
            return;
        }

        let viewQueue = this._viewQueues[view.uiQueue];
        if (viewQueue.length > 0) {
            //隐藏队列中的最后一个
            let lastView = viewQueue[viewQueue.length - 1];
            lastView.hide();
        }
        viewQueue.push(view);
    }

    private close(type : string) : void {
        //cc.warn("UIManager.close:" + type);
        let view : MVCS.AbsView = this._views[type];
        if (view == null) {
            cc.error("UIManager.close:" + type + " null");
            return;
        }

        if (!view.isOpened) {
            cc.error("UIManager.close:" + type + " is repeatedly");
            return;
        }

        view.close();
    }

    private onClose(view : MVCS.AbsView) : void {
        this._layerCounts[view.uiLayer] = this._layerCounts[view.uiLayer] - 1;
        Notifier.send(NotifyID.View_Closed, view);

        if (view.uiQueue == MVCS.eUIQueue.None) {
            return;
        }

        let viewQueue = this._viewQueues[view.uiQueue];
        if (viewQueue.length <= 0) {
            cc.log("UIManager.onClose:" + view.assetPath + " viewQueue:" + view.uiQueue + " Count < 0");
            //closeQueues 会清空队列
            return;
        }
        let lastView = viewQueue[viewQueue.length - 1];
        if (lastView != view) {
            let suss = viewQueue.remove(view);
            if (!suss) {
                cc.warn("UIManager.onClose:" + view.assetPath + " can't find, last:" + lastView.assetPath);
            }
            return;
        }
        viewQueue.pop();

        //恢复上一个界面显示
        if (viewQueue.length > 0) {
            lastView = viewQueue[viewQueue.length - 1];
            lastView.show();
        }
    }

    private closeQueues() : void {
        for (let i = 0; i < this._viewQueues.length; i++) {
            if (this._viewQueues[i].length <= 0) {
                continue;
            }
            //需要拷贝出来
            let viewQueue = copy(this._viewQueues[i]);
            this._viewQueues[i] = new Array<MVCS.AbsView>();
            for (let j = 0; j < viewQueue.length; j++) {
                viewQueue[j].close();
            }
        }
    }

    private getOpenCount(layer : MVCS.eUILayer) {
        if (layer != MVCS.eUILayer.Max) {
            return this._layerCounts[layer] || 0;
        } 

        let count = 0;
        for (let index = 0; index < this._layerCounts.length; index++) {
            const element = this._layerCounts[index];
            if (element) {
                count += element;                
            }
        }
        return count;
    }
}