import { HD_MODULE } from "./sdk/hd_module/hd_module";
import { GameVoManager } from "./manager/GameVoManager";
import NetAdapter from "./adpapter/NetAdapter";
import { PutKVData } from "./sdk/hd_module/net/net";
import { ListenID } from "./ListenID";
import { Manager } from "./manager/Manager";
import { Time } from "./frame/Time";
import { Notifier } from "./frame/Notifier";
import { NotifyID } from "./frame/NotifyID";
HD_MODULE.init();
NetAdapter.Init();
let ishided: boolean = false;
if (window["wx"] && wx.getUpdateManager) {
    const updateManager = wx.getUpdateManager();
    updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
    })

    updateManager.onUpdateReady(function () {
        wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function (res) {
                if (res.confirm) {
                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                    updateManager.applyUpdate()
                }
            }
        })
    })

    updateManager.onUpdateFailed(function () {
        // 新版本下载失败
    })
} else if (window["tt"] && tt.getUpdateManager) {
    const updateManager = tt.getUpdateManager()
    updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
    })

    updateManager.onUpdateReady(function () {
        tt.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: function (res) {
                if (res.confirm) {
                    // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                    updateManager.applyUpdate()
                }
            }
        })
    })

    updateManager.onUpdateFailed(function () {
        // 新版本下载失败
        console.error("onUpdateFailed")
    })
}

HD_MODULE.PLATFORM.notifyOnShowEvent((res) => {
    HD_MODULE.getPlatform().getSetting();
    if (res.query.openId) {
        HD_MODULE.getNet().sharePost({ inviter_open_id: res.query.openId }, () => {
            console.log("===<--sharePost-->==邀请玩家进入=====");
        });
    }
    if (res && res.referrerInfo && res.referrerInfo.extraData) {
        GameVoManager.getInstance.myUserVo.channel_code = res.referrerInfo.extraData.channel_code;
    }
    Time.updateServerTime().then(res => {
        HD_MODULE.PLATFORM.checkTokenIsExpire();
    });
    Notifier.send(NotifyID.Game_OnShow);
    if (ishided)
        Notifier.send(NotifyID.App_Pause, false);
});
HD_MODULE.PLATFORM.notifyOnHideEvent((err) => {
    let putKVData: PutKVData = { type: 1, custom_data: GameVoManager.getInstance.myUserVo.serialize() }
    NetAdapter.putKVData(putKVData);
    Notifier.send(NotifyID.Game_onHide);
    ishided = true;
    Manager.audio.stopAllGunSources();
})
