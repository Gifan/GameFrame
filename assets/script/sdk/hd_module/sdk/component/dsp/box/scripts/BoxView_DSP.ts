import { HD_MODULE } from "../../../../../hd_module";
import { appConfig, EPlatform } from "../../../../../config/AppConfig";
import { EventManager } from "../../../../../mgr/EventManager";

const {ccclass, property} = cc._decorator;

@ccclass
export default class BoxDSP extends cc.Component {
    /** 是否已获取数据 */
    static isGetData: boolean = false;

    @property(cc.Prefab)
    boxItem: cc.Prefab = null;

    /** 平台 */
    @property({type: EPlatform})
    platform: number = EPlatform.WeChat;

    @property(cc.Node)
    scrollContent: cc.Node = null;

    itemList: {} = {};

    onLoad(){
        
    }

    onEnable(){
        /** 有平台时才刷 */
        if(HD_MODULE.getPlatform().getToken() && this.platform == appConfig.platform_id){
            if(!BoxDSP.isGetData){
                let suc = () => {
                    BoxDSP.isGetData = true;
                    this.onFlush();
                }
                BoxDSPData.init(suc);
            }else{
                this.onFlush();
            }
        }else{
            this.node.setContentSize(0, 0);
        }
    }

    onFlush(type: string = 'all'){
        switch(type){
            case 'all': {
                this.updateItemList();
               break;
            }
        }
    }

    updateItemList(){
        let dataList = BoxDSPData.miniproList["home"];
        if(dataList){
            for(let i = 0; i < dataList.length; ++i){
                let item = this.itemList[i];
                if(!item){
                    item = cc.instantiate(this.boxItem);
                    if(item){
                        item.parent = this.scrollContent;
                        this.itemList[i] = item;
                    }
                }
                item.getComponent('BoxItem_DSP').init({appid: dataList[i].app_id, imgUrl: dataList[i].icon});
            }
        }
    }
}


class BoxDSPData{
    /** DSP信息 */
    public static miniproList: {} = null;

    public static init(success: () => any){
        HD_MODULE.getNet().getDSPInfo({version: appConfig.app_version}, (res) => {
            BoxDSPData.miniproList = res.data.apps;
            success();
            // EventManager.emit('dsp-getdata');
        })
    }
}