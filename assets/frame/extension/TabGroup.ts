import { MVCS } from "../mvcs/MVCS";
import { ToggleCell } from "./ToggleCell";

class TabInfo {
    private _tab : number;
    public get tab() : number {
        return this._tab;
    }

    private _classType : string;
    public get classType() : string {
        return this._classType;
    }

    private _panel : MVCS.AbsView;
    public get panel() : MVCS.AbsView {
        return this._panel;
    }
    public setPanel(panel : MVCS.AbsView) {
        this._panel = panel;
    }

    private _toggle : ToggleCell;
    public get toggle() : ToggleCell {
        return this._toggle;
    }

    private _node : cc.Node;
    public get node() : cc.Node {
        return this._node;
    }

    public constructor(tab : number, classType : string, panel : MVCS.AbsView, toggle : ToggleCell, node : cc.Node) {
        this._tab = tab;
        this._classType = classType;
        this._panel = panel;
        this._toggle = toggle;
        this._node = node;
    }
}

//多标签切换控制
export class TabGroup {
    private _tabInfos : TabInfo[];

    private _onTabChanged : (index : number, enabled : boolean) => void;
    private _target : any;

    private _parent : cc.Node;

    private _curTabInfo : TabInfo;

    public get curTab() {
        if (this._curTabInfo == null) {
            return -1;
        }
        return this._curTabInfo.tab;
    }

    public constructor(parent : cc.Node, onTabChanged : (index : number, enabled : boolean) => void = null, target = null) {
        this._parent = parent;
        this._tabInfos = [];
        this._onTabChanged = onTabChanged;
        this._target = target;
    }

    /// <summary>
    /// 添加标签页
    /// </summary>
    /// <param name="tab">便签页唯一标示</param>
    /// <param name="classType">标签页对应View名称，可选</param>
    /// <param name="classType">标签页对应View实例对象，可选</param>
    /// <param name="classType">标签页对应单选框，可选</param>
    /// <param name="classType">标签页对应节点，可选</param>
    public Add(tab : number, classType : string = null, panel : MVCS.AbsView = null, toggle : ToggleCell = null, node : cc.Node = null) {
        let tabInfo = this._tabInfos.find("tab", tab);
        if (tabInfo != null) {
            cc.error(this._parent.name, " TabGroup.Add reduplicate:", tab, classType, tabInfo.classType);
            return;
        }
        tabInfo = new TabInfo(tab, classType, panel, toggle, node);
        this._tabInfos.push(tabInfo);
        if (toggle != null) {
            toggle.SetTab(tab);
            toggle.SetListenerWithSelf(this.onTabChanged, this);
        }
    }

    public select(tab : number) : void {
        let tabInfo = this._tabInfos.find("tab", tab);
        if (tabInfo == null) {
            cc.error("TabGroup.Select error tab:", tab);
            return ;
        }
        this.showPanel(tabInfo);
    }

    public open() : void {
        if (this._curTabInfo == null) {
            return;
        }
        this.showPanel(this._curTabInfo);
    }

    public close() : void {
        if (this._tabInfos == null) {
            return;
        }
        for (let i = 0; i < this._tabInfos.length; i++) {
            let tabInfo = this._tabInfos[i];
            let panel = tabInfo.panel;
            if (panel != null) {
                panel.close();
            }   
        }
    }

    public destroy() {
        if (this._tabInfos == null) {
            return;
        }
        for (let i = 0; i < this._tabInfos.length; i++) {
            let tabInfo = this._tabInfos[i];
            let panel = tabInfo.panel;
            if (panel != null) {
                panel.unload();
            }
        }
        this._tabInfos = null;
        this._curTabInfo = null;
    }

    public show() : void {
        if (this._curTabInfo == null) {
            cc.error(this._parent.name + " TabGroup.show must use Select first");
            return;
        }
        let panel = this._curTabInfo.panel;
        if (panel == null) {
            return;
        }
        panel.show();
    }

    public hide() : void {
        if (this._curTabInfo == null) {
            cc.error(this._parent.name + " TabGroup.hide must use Select first");
            return;
        }
        let panel = this._curTabInfo.panel;
        if (panel == null) {
            return;
        }
        panel.hide();
    }

    private showPanel(tabInfo : TabInfo) :void {
        //cc.error("showPanel", tabInfo.tab);
        if (this._curTabInfo != null) {
            this.hidePanel(this._curTabInfo);
            this._curTabInfo = null;
        }

        this._curTabInfo = tabInfo;
        let toggle = tabInfo.toggle;
        if (toggle != null && !toggle.isChecked) {
            toggle.InitChecked(true);
        }

        let node = tabInfo.node;
        if (node != null) {
            node.active  = true;
        }

        let panel = tabInfo.panel;
        if (panel != null) {
            if (panel.isOpened) {
                panel.show();                
            } else {
                panel.open();
            }
        } else {
            if (tabInfo.classType != null) {
                let mod = require(tabInfo.classType);
                let modClass = mod[tabInfo.classType];
                panel = new modClass() as MVCS.AbsView;
                panel.setParent(this._parent, false);
                panel.open();
                tabInfo.setPanel(panel);
            }            
        }

        if (this._onTabChanged != null) {
            this._onTabChanged.call(this._target, tabInfo.tab, true);
        }
    }

    private hidePanel(tabInfo : TabInfo) : void {
        //cc.error("hidePanel", tabInfo.tab);
        let toggle = tabInfo.toggle;
        if (toggle != null && toggle.isChecked) {
            toggle.InitChecked(false);
        }

        let node = tabInfo.node;
        if (node != null) {
            node.active  = false;
        }

        let panel = tabInfo.panel;
        if (panel != null) {
            panel.hide();
        }

        if (this._onTabChanged != null) {
            this._onTabChanged.call(this._target, tabInfo.tab, false);
        }
    }

    private onTabChanged(toggle : ToggleCell, active : boolean) {
        let curTabInfo = this._curTabInfo;
        if (curTabInfo != null && curTabInfo.toggle == toggle) {
            if (!active) {
                toggle.InitChecked(true);                
            }
            return;
        }

        let tabInfo = this._tabInfos.find("tab", toggle.tab);
        if (tabInfo == null) {
            cc.error("onTabChanged error tab:", toggle.tab)
            return;
        }
        if (active) {
            this.showPanel(tabInfo);
        }
    }
}
