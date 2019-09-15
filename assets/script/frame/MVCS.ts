import { DefaultTransition } from "./Transition/DefaultTransition";
import { ScaleTransition } from "./Transition/ScaleTransition";
import { MoveTransition } from "./Transition/MoveTransition";

export namespace MVCS {

    /**
     * @description 基础数据模型类
     * @author 吴建奋
     * @export
     * @abstract
     * @class BaseModel
     */
    export abstract class BaseModel {
        public abstract reset(): void;
    }

    abstract class BaseNet {
        public constructor() {
            this.register();
        }
        protected abstract register(): void;

        public abstract reset(): void;

        // protected show
        protected httpRequest(method, url, body?: Object, authon?: string, rspType: XMLHttpRequestResponseType = 'json'): Promise<any> {
            return new Promise((resolve, reject) => {
                let xmlHttp = cc.loader.getXMLHttpRequest();
                xmlHttp.timeout = 5000;
                if (method == 'GET' && body) {
                    let str = "?";
                    for (let k in body) {
                        if (str != "?") {
                            str += "&";
                        }
                        str += k + "=" + body[k];
                    }
                    url = url + str;
                }
                xmlHttp.open(method, url, true);
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == 4) {
                        if (xmlHttp.status == 200) {
                            if (rspType == 'json') {
                                resolve(JSON.parse(xmlHttp.responseText))
                            } else {
                                resolve(xmlHttp.response)
                            }
                        } else {
                            reject({ code: -1, msg: Error(`xmlHttp status = ${xmlHttp.status}`), data: {} })
                        }
                    } else {
                        reject({ code: -100, msg: "" });
                    }
                }
                // xmlHttp.onerror = function () {
                //     reject({ code: -1, msg: Error('xmlhttp something error'), data: {} });
                // }
                xmlHttp.ontimeout = () => {
                    reject({ code: -200, msg: Error('timeout'), data: {} });
                }

                // set request header
                switch (rspType) {
                    case 'json':
                        xmlHttp.setRequestHeader('content-type', 'application/json')
                        xmlHttp.setRequestHeader('Authorization', authon)
                        break
                }
                // set reponse type ，如果是二进制，则最好是arraybuffer或者blob
                if (rspType == 'blob' || rspType == 'arraybuffer') {
                    xmlHttp.responseType = rspType
                }

                xmlHttp.send(body ? JSON.stringify(body) : '')
            });
        }
    }

    /**
     * @description 基础控制器类
     * @author 吴建奋
     * @export
     * @abstract
     * @class BaseController
     */
    export class BaseController extends BaseNet {
        private _name: string = "";
        public constructor(classname: string) {
            super();
            this._name = classname;
            ControllerContainer.add(this);
        }
        //做为容器唯一标示，用类名即可
        public get _classname(): string {
            return this._name;
        }

        protected register(): void {
            // throw new Error("Method not implemented.");
        }

        public reset(): void {

        }

        protected changeListener(enable: boolean): void {

        }
    }

    interface controlMap {
        [key: string]: BaseController
    }
    export class ControllerContainer {
        private static s_container: controlMap = {};
        public static add<T extends BaseController>(instance: BaseController): void {
            const name = instance._classname;
            if (ControllerContainer.getInstance(name) != null) {
                cc.error("LogicContainer.Add repeat:" + name);
                return;
            }
            ControllerContainer.s_container[name] = instance;
        }

        public static getInstance<T extends BaseController>(name: string): T {
            const item = ControllerContainer.s_container[name];
            if (item) {
                return item as T;
            }

            return null;
        }

        public static reset(): void {
            for (const key in ControllerContainer.s_container) {
                ControllerContainer.s_container[key].reset();
            }
        }
    }

    type LoadAssetHandler = (name: string, path: string, type: typeof cc.Asset, callback: (name: string, asset: object, assetspath: string, args: any) => void, target: any, arg: any) => void;
    type Node = cc.Node

    //和AbsView定义放一起，防止相互import不完全
    export class ViewHandler {
        private static _loadAssetHandler: LoadAssetHandler;
        public static get loadAssetHandler(): LoadAssetHandler {
            return ViewHandler._loadAssetHandler;
        }

        private static _unloadAssetHandler: (name: string) => void;
        public static get unloadAssetHandler(): (name: string) => void {
            return ViewHandler._unloadAssetHandler;
        }

        public static initAssetHandler(loadAsset: LoadAssetHandler, unloadAsset: (name: string) => void): void {
            ViewHandler._loadAssetHandler = loadAsset;
            ViewHandler._unloadAssetHandler = unloadAsset;
        }

        private static _onOpenEvent: (view: BaseView) => void;
        public static get onOpenEvent(): (view: BaseView) => void {
            return ViewHandler._onOpenEvent;
        }

        private static _onCloseEvent: (view: BaseView, assetpath: string) => void;
        public static get onCloseEvent(): (view: BaseView, assetpath: string, isclean: boolean) => void {
            return ViewHandler._onCloseEvent;
        }

        public static initUIEvent(onOpen: (view: BaseView) => void, onClose: (view: BaseView, assetpath: string) => void): void {
            ViewHandler._onOpenEvent = onOpen;
            ViewHandler._onCloseEvent = onClose;
        }
    }

    /**组件prefabs加载管理 */
    export class ComponentHandler {
        private static _loadAssetHandler: LoadAssetHandler;
        public static get loadAssetHandler(): LoadAssetHandler {
            return ComponentHandler._loadAssetHandler;
        }

        private static _unloadAssetHandler: (name: string) => void;
        public static get unloadAssetHandler(): (name: string) => void {
            return ComponentHandler._unloadAssetHandler;
        }
        public static initAssetHandler(loadAsset: LoadAssetHandler, unloadAsset: (name: string) => void): void {
            ComponentHandler._loadAssetHandler = loadAsset;
            ComponentHandler._unloadAssetHandler = unloadAsset;
        }
    }

    /**
     * @description 基础视图类
     * @author 吴建奋
     * @export
     * @abstract
     * @class BaseView
     */
    export abstract class BaseView extends cc.Component {
        /// UI进入，退出动画控制
        private _transition: ITransition;
        private _isclean: boolean;
        protected init(uiLayer: eUILayer = eUILayer.Panel, transition: eTransition = eTransition.Default, assetspath: string, isClean: boolean = false) {
            this._uiLayer = uiLayer;
            this._assetsPath = assetspath;
            switch (transition) {
                case eTransition.Scale:
                    this._transition = new ScaleTransition();
                    break;
                case eTransition.Move:
                    this._transition = new MoveTransition();
                    break;
                case eTransition.Default:
                default:
                    this._transition = new DefaultTransition();
                    break;
            }
            this._transition.init(this.node, isClean);
            this._isClosed = false;
            this._isOpened = false;
            this._isclean = isClean;
        }

        private _uiLayer: eUILayer;
        public get uiLayer(): eUILayer {
            return this._uiLayer;
        }

        protected _assetsPath: string;
        public get assetsPath(): string {
            return this._assetsPath;
        }

        /**是否已经关闭 */
        protected _isClosed: boolean = false;
        public get isClosed(): boolean {
            return this._isClosed;
        }

        /**是否完全打开 */
        private _isOpened: boolean = false;
        public get isOpened(): boolean {
            return this._isOpened;
        }

        public open(args: any = null): void {
            if (!this._isOpened) {
                this._transition.show().then(() => {
                    this.openCallBack();
                });
                this._isClosed = false;
                this.onOpen(args);
                this._isOpened = true;
            }
            else {
                this.setInfo(args);
            }
        }

        public onOpen(args: any = null): void {
            this.changeListener(true);
            ViewHandler.onOpenEvent(this);
        }


        public onClose(): void {
            if (this._isClosed) {
                cc.warn(`asset ${this._assetsPath} is closing`);
                return;
            }
            this._isClosed = true;
            this._isOpened = false;
            this.changeListener(false);
            ViewHandler.onCloseEvent(this, this._assetsPath, this._isclean);
            this._transition.hide();
        }

        public close(): void {
            this.onClose();
        }

        // 设置事件监听
        protected abstract changeListener(enable: boolean): void;

        protected onClickFrame() {
            //点击UI框，屏蔽底部的UI
        }

        /**打开界面之后 设置信息 */
        protected setInfo(args) {

        }

        /** 打开界面并且动画完成 */
        protected openCallBack() {

        }
    }

    export enum eTransition {
        Default,
        Scale,
        Move
    }

    /// UI切换过渡动画
    export interface ITransition {
        init(node: Node, isClean: boolean): void;
        show(): Promise<any>;
        hide(): void;
    }

    /// 加载状态
    export enum eLoadState {
        Unload,
        Loading,
        Loaded,
    }

    /// UI分层
    export enum eUILayer {
        /// 场景UI
        Scene,
        /// 主界面
        Main,
        /// 打开的界面
        Panel,
        /// 弹出的次级界面
        Guide,
        /// 新手引导界面
        Popup,
        /// 临时存在的提示
        Tips,
        /// 进度加载界面
        Loading,

        Max
    }

    /**
     * @description UI互斥
     * @export
     * @enum {number}
     */
    export enum eUIQueue {
        Panel,
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

}
