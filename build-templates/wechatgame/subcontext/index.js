/**************************************************************************************************/
function charString(char, count) {
    var str = "";
    while (count--) {
        str += char;
    }
    return str;
}

/** 
 * 对日期进行格式化， 和C#大致一致 默认yyyy-MM-dd HH:mm:ss
 * 可不带参数 一个日期参数 或一个格式化参数
 */
Date.prototype.format = function (format) {
    var map = {
        "y": this.getFullYear() + "",
        "M": this.getMonth() + 1 + "",
        "d": this.getDate() + "",
        "H": this.getHours(),
        "m": this.getMinutes() + "",
        "s": this.getSeconds() + "",
        "q": Math.floor((this.getMonth() + 3) / 3) + "",
        "f": this.getMilliseconds() + "" //毫秒 
    };
    //小时 12
    if (map["H"] > 12) {
        map["h"] = map["H"] - 12 + "";
    } else {
        map["h"] = map["H"] + "";
    }
    map["H"] += "";
    var reg = "yMdHhmsqf";
    var all = "",
        str = "";
    for (var i = 0, n = 0; i < reg.length; i++) {
        n = format.indexOf(reg[i]);
        if (n < 0) {
            continue;
        }
        all = "";
        for (; n < format.length; n++) {
            if (format[n] != reg[i]) {
                break;
            }
            all += reg[i];
        }
        if (all.length > 0) {
            if (all.length == map[reg[i]].length) {
                str = map[reg[i]];
            } else if (all.length > map[reg[i]].length) {
                if (reg[i] == "f") {
                    str = map[reg[i]] + charString("0", all.length - map[reg[i]].length);
                } else {
                    str = charString("0", all.length - map[reg[i]].length) + map[reg[i]];
                }
            } else {
                switch (reg[i]) {
                    case "y":
                        str = map[reg[i]].substr(map[reg[i]].length - all.length);
                        break;
                    case "f":
                        str = map[reg[i]].substr(0, all.length);
                        break;
                    default:
                        str = map[reg[i]];
                        break;
                }
            }
            format = format.replace(all, str);
        }
    }
    return format;
};

function isNullOrEmpty(str) {
    if (str == null) {
        console.log("isNullOrEmpty null");
        return true;
    }
    if (str == "") {
        console.log("isNullOrEmpty empty");
        return true;
    }
    let type = typeof (str);
    if (type != "string" && type != "number") {
        console.error("isNullOrEmpty error type", str)
    }
    return false;
};

/**************************************************************************************************/
let kSortSign = [1, -1];
/**
 * 列表数据排序(降序)
 * @param a
 * @param b
 */
function KVDataSort(a, b) {
    //console.info("KVDataSort", a.nickName, b.nickName, a.rawValues == null, b.rawValues == null);
    if (a.rawValues == null && b.rawValues == null) {
        return 0;
    } else if (a.rawValues == null) {
        return 1;
    } else if (b.rawValues == null) {
        return -1;
    }
    let aVals = a.rawValues;
    let bVals = b.rawValues;
    //越靠前的数据，权值越大
    for (let index = 0; index < aVals.length; index++) {
        let aVal = aVals[index];
        let bVal = bVals[index];
        let sign = kSortSign[index] || 1;
        //console.log("val", aVal, bVal, "sign", sign, aVal == bVal, (bVal - aVal) * sign);
        if (aVal == bVal) {
            continue;
        } else {
            return (bVal - aVal) * sign;
        }
    }
    return 0;
};

/**
 * 微信SDK封装
 */
class _WeChatSDK {
    constructor(sortSign) {
        //排序符号，最后一位为时间戳
        if (sortSign == null) {
            sortSign = [1, -1];
            console.error("WeChatSDK sortSign null, use Default [1, -1]");
        }
        kSortSign = sortSign;
        this._weekStartTime = 0;
    }
    /**
     * 获取微信基本数据
     * 
     * @param sussCallback 成功回调
     * @param failCallback 失败回调
     */
    getUserInfo(sussCallback, failCallback) {
        wx.getUserInfo({
            openIdList: ['selfOpenId'],
            success: (res) => {
                let userData = res.data[0];
                sussCallback(userData);
            },
            fail: (res) => {
                console.error("getUserInfo fail", JSON.stringify(res));
                if (failCallback != null) {
                    failCallback();
                }
            }
        });
    };
    /**
     * 获取微信数据
     * @param key 存储Key建
     * @param sussCallback 成功回调
     * @param failCallback 失败回调
     */
    getUserCloudStorage(key, sussCallback, failCallback) {
        wx.getUserCloudStorage({
            keyList: [key],
            success: (data) => {
                sussCallback(data);
            },
            fail: (res) => {
                console.error("getUserCloudStorage fail", key, JSON.stringify(res));
                if (failCallback != null) {
                    failCallback();
                }
            }
        });
    };
    /**
     * 设置微信数据
     * @param key 存储Key建
     * @param datas 数据，number[] 
     * @param sussCallback 成功回调
     * @param failCallback 失败回调
     */
    setUserCloudStorage(key, datas, sussCallback, failCallback) {
        //插入排序时间戳
        let now = new Date();
        datas.push(Math.round(now.getTime() * 0.001));
        let list = [{
            key: key,
            value: JSON.stringify(datas)
        }];
        //console.info("setUserCloudStorage", key, JSON.stringify(list));
        wx.setUserCloudStorage({
            keyList: [key],
            KVDataList: list,
            success: function (data) {
                //console.info("setUserCloudStorage suss", key, JSON.stringify(data));
                if (sussCallback != null) {
                    sussCallback();
                }
            },
            fail: function (res) {
                console.error("setUserCloudStorage fail", key, JSON.stringify(res));
                if (failCallback != null) {
                    failCallback();
                }
            }
        });
    };
    /**
     * 设置微信数据
     * @param key 存储Key建
     * @param datas 更新数据，number[] 
     * @param sussCallback 成功回调
     * @param failCallback 失败回调
     */
    updateUserCloudStorage(key, datas, sussCallback, failCallback) {
        this._weekStartTime = 0;
        //console.log("updateUserCloudStorage start", key);
        this.getUserCloudStorage(key, (data) => {
            //console.log("updateUserCloudStorage get:", key, JSON.stringify(data));
            if (data.KVDataList.length > 0) {
                let records = JSON.parse(data.KVDataList[0].value);
                //优于之前的数据才更新
                if (!this.isBetter(datas, records)) {
                    return;
                }
            }
            this.setUserCloudStorage(key, datas, sussCallback, failCallback);
        }, function () {
            console.error("updateUserCloudStorage get fail:", key);
            if (failCallback != null) {
                failCallback();
            }
        });
    };
    isBetter(datas, records, weekly) {
        if (weekly === void 0) {
            weekly = true;
        }
        let weekStartTime = this.getWeekStartTime();
        if (weekly && records[records.length - 1] < weekStartTime) {
            //抛弃上周的数据
            console.log("isBetter last week", records[records.length - 1], weekStartTime);
            return true;
        }
        let suss = true;
        for (let index = 0; index < datas.length; index++) {
            let aVal = records[index] || 0;
            let bVal = datas[index];
            let sign = kSortSign[index] || 1;
            if (sign > 0) {
                if (aVal > bVal) {
                    suss = false;
                    break;
                }
            } else {
                if (aVal < bVal) {
                    suss = false;
                    break;
                }
            }
        }
        console.info("update rank", suss, JSON.stringify(datas), "record", JSON.stringify(records));
        return suss;
    };
    getWeekStartTime() {
        if (this._weekStartTime == 0) {
            let now = new Date();
            let week = now.getDay();  
            //使用周一作为每周开始
            let minusDay = week != 0 ? week - 1 : 6; 
            let weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - minusDay);
            this._weekStartTime = Math.round(weekStart.getTime() * 0.001);
            //console.log("_weekStartTime", weekStart, now, now.getDate(), now.getDay());
        }
        return this._weekStartTime;
    };
    parseDatas(datas, weekly) {
        if (weekly === void 0) {
            weekly = true;
        }
        let weekStartTime = this.getWeekStartTime();
        //cc.error("weekStartTime", weekStartTime, weekly);
        let array = [];
        for (let index = 0; index < datas.length; index++) {
            let data = datas[index];
            if (data.KVDataList.length == 0) {
                continue;
            }
            if (data.nickName == null) {
                data.nickName = data.nickname;
                delete data.nickname;
            }
            let vals = JSON.parse(data.KVDataList[0].value);
            //cc.error("parseDatas ", data.nickName, vals[vals.length - 1], weekStartTime, vals[vals.length - 1] < weekStartTime);
            if (weekly && vals[vals.length - 1] < weekStartTime) {
                //抛弃上周的数据
                //cc.error("skip weekly ", data.openid, data.nickName, vals[vals.length - 1], weekStartTime);
                continue;
            }
            data.rawValues = vals;
            delete data.KVDataList;
            array.push(data);
        }
        return array;
    };
    /**
     * 获取好友数据,并且排序(降序)
     * @param key 存储Key建
     * @param sussCallback 成功回调
     * @param failCallback 失败回调
     */
    getFriendCloudStorage(key, sussCallback, failCallback) {
        this._weekStartTime = 0;
        wx.getFriendCloudStorage({
            keyList: [key],
            success: (res) => {
                //cc.error("getFriendCloudStorage get suss:", key, JSON.stringify(res));
                let data = this.parseDatas(res.data);
                data.sort(KVDataSort);
                console.info("friend sort:", JSON.stringify(data));
                sussCallback(data);
            },
            fail: function (res) {
                cc.error("getFriendCloudStorage get fail:", key);
                if (failCallback != null) {
                    failCallback();
                }
            }
        });
    };
    /**
     * 获取群数据,并且排序(降序)
     * @param key 存储Key建
     * @param shareTicket 群标志
     * @param sussCallback 成功回调
     * @param failCallback 失败回调
     */
    getGroupCloudStorage(key, shareTicket, sussCallback, failCallback) {
        wx.getGroupCloudStorage({
            shareTicket: shareTicket,
            keyList: [key],
            success: (res) => {
                let data = this.parseDatas(res.data);
                data.sort(KVDataSort);
                console.info("group sort:", JSON.stringify(data));
                sussCallback(data);
            },
            fail: function (res) {
                console.error("getGroupCloudStorage get fail:", key);
                if (failCallback != null) {
                    failCallback();
                }
            }
        });
    };
}

//传入排序参数
const WeChatSDK = new _WeChatSDK([1, -1]);

/**************************************************************************************************/
/*
interface WeChatMsg {
	cmd : string;
	id ?: number;
	value ?: number;
	datas ?: number[];
}
*/

const kPageSize = 5;
const kRankItemWidth = 440;
const kRankItemHeight = 70;
const kRankItemGap = 6;
const kRankPageHeight = (kRankItemHeight + kRankItemGap) * kPageSize;
const kRankAvatarWidth = 40;
const kRankAvatarHeight = 40;
const kFontSize = 25;
const kRankHeight = kRankPageHeight + 70;

const kBgHeadWidth = 40;
const kBgHeadHeight = 40;
const kIconRankWidth = 64;
const kIconRankHeight = 64;
const kTopAvatarWidth = 60;
const kTopAvatarHeight = 60;

//评分等级
const kGrades = ["D", "C", "B", "A", "S", "S+"];
//准确率换算评级
const kAccuracy2Grades = [60, 70, 80, 90, 95, 100];

class RankListRenderer {
    constructor() {
        this.clearFlag = false
        this.offsetY = 0;
        this.maxOffsetY = 0;
        this.gameDatas = []; //https://developers.weixin.qq.com/minigame/dev/document/open-api/data/UserGameData.html
        this.curDataType = null;
        this.curKey = null;
        this.curTicket = null;
        this.curPageIndex = 0; //当前页码
        this.drawIconCount = 0;
        this.rankCanvasList = [];

        this.selfUserInfo = null //avatarUrl //https://developers.weixin.qq.com/minigame/dev/document/open-api/data/wx.getUserInfo.html

        this.init();
    }

    init() {
        this.sharedCanvas = wx.getSharedCanvas();
        this.sharedCtx = this.sharedCanvas.getContext('2d');

        WeChatSDK.getUserInfo(data => {
            //console.log("getUserInfo success", data);
            this.selfUserInfo = data;
        });

        //等待启动后预加载图片
        setTimeout(() => {
            this.preload();
        }, 1);
    }

    preload() {
        // const bg_head = wx.createImage();
        // bg_head.src = `subcontext/res/box_head.png`;
        // bg_head.onload = () => {
        //     this.bg_head = bg_head;
        //     //console.log("preload bg_head");
        // };

        // this.bgs = [];
        // for (let index = 0; index < 2; index++) {
        //     this.bgs.push(null);
        //     const bg = wx.createImage();
        //     bg.src = `subcontext/res/bg_${index}.png`;
        //     bg.onload = () => {
        //         this.bgs[index] = bg;
        //         //console.log("preload bg", index, bg);
        //     };
        // }

        this.iconRanks = [];
        for (let index = 0; index < 3; index++) {
            this.iconRanks.push(null);
            const iconRank = wx.createImage();
            iconRank.src = `subcontext/res/rank_${index + 1}.png`;
            iconRank.onload = () => {
                this.iconRanks[index] = iconRank;
                //console.log("preload icon", index, iconRank);
            };
        }

        this.avatars = {}
        this.avatarWaitCnt = 0;
        this.avatarNeedRefresh = false;
    }

    drawAvatar(avatarUrl, callback) {
        if (isNullOrEmpty(avatarUrl)) {
            console.error("drawAvatar avatarUrl null");
            return;
        }
        let avatar = this.avatars[avatarUrl];
        if (avatar != null) {
            //console.log("drawAvatar loaded", avatarUrl);
            callback(avatar);
            return;
        }

        this.avatarWaitCnt = this.avatarWaitCnt + 1;
        avatar = wx.createImage();
        avatar.src = avatarUrl;
        avatar.onload = () => {
            this.avatarWaitCnt = this.avatarWaitCnt - 1;
            if (this.avatarWaitCnt == 0) {
                this.avatarNeedRefresh = true;
            }
            //console.log("drawAvatar onload", avatarUrl);
            this.avatars[avatarUrl] = avatar;
            callback(avatar);
        };
    }

    listen() {
        //msg -> {action, data}
        wx.onMessage(msg => {
            //console.log("wx.onMessage", JSON.stringify(msg), new Date().format("yyyy-MM-dd"));
            switch (msg.cmd) {
                case "showTop":
                    this.showTopThree(msg);
                    break;
                case "showRank":
                    this.clearFlag = true;
                    this.showRank(msg);
                    break;
                case "pageRank":
                    if (this.gameDatas == null) {
                        console.log("wx.onMessage pageRank gameDatas null", JSON.stringify(msg))
                        return;
                    }
                    this.clearFlag = false;
                    const page = msg.value;
                    this.curPageIndex += page;
                    if (this.curPageIndex < 0) {
                        this.curPageIndex = 0;
                        console.log("已是第一页")
                        return;
                    } else if (this.curPageIndex > this.maxPage) {
                        this.curPageIndex = this.maxPage;
                        console.log("已是最后一页")
                        return;
                    }
                    this.offsetY = kRankPageHeight * this.curPageIndex;
                    this.refreshRank();
                    break;
                case "scrollRank":
                    if (this.gameDatas == null) {
                        console.log("wx.onMessage scrollRank gameDatas null", JSON.stringify(msg))
                        return;
                    }
                    this.clearFlag = false;
                    const deltaY = msg.value;
                    const newOffsetY = this.offsetY + deltaY;
                    if (newOffsetY < 0) {
                        console.log("前面没有更多了");
                        return;
                    }
                    if (newOffsetY + kRankPageHeight > this.maxOffsetY) {
                        console.log("后面没有更多了");
                        return;
                    }
                    this.curPageIndex = Math.floor(this.offsetY / kRankPageHeight);
                    this.offsetY = newOffsetY;
                    this.refreshRank();
                    break;
                case "updateRecord":
                    let key = this.getKey(msg);
                    WeChatSDK.updateUserCloudStorage(key, msg.datas);
                    break;
                default:
                    console.error("wx.onMessage error cmd", JSON.stringify(msg))
                    break;
            }
        });
    }

    getKey(msg) {
        return "rank_" + msg.id;
    }

    refreshTop() {
        const sharedWidth = this.sharedCanvas.width;
        const sharedHeight = this.sharedCanvas.height;
        let canvas = wx.createCanvas();
        canvas.width = sharedWidth;
        canvas.height = sharedHeight;
        const ctx = canvas.getContext('2d');

        //左上角坐标
        let startX = 14;
        let stratY = 17;
        for (let index = 0; index < 3; index++) {
            const data = this.gameDatas[index];
            if (data == null || data.rawValues == null) {
                break;
            }

            let x = startX;
            let y = stratY + index * 120;
            // let bg_head = this.bg_head;
            // if (bg_head) {
            //     ctx.drawImage(bg_head, x, y, kBgHeadWidth, kBgHeadHeight);
            // }

            let offset = (kBgHeadWidth - kTopAvatarWidth) / 2;
            if (isNullOrEmpty(data.avatarUrl)) {
                let iconRank = this.iconRanks[index];
                if (iconRank) {
                    ctx.drawImage(iconRank, x - 10, y - 17, kIconRankWidth, kIconRankHeight);
                }

                //名字
                const nick = data.nickName.length <= 3 ? data.nickName : data.nickName.substr(0, 3) + "...";
                ctx.fillStyle = "#FFFFFF";
                ctx.textAlign = "center";
                ctx.baseLine = "middle";
                ctx.font = "30px Helvetica";
                ctx.fillText(nick, x + kTopAvatarWidth / 2, y + kTopAvatarWidth / 2 + 20);
            } else {
                this.drawAvatar(data.avatarUrl, (avatar) => {
                    ctx.drawImage(avatar, x + offset, y + offset, kTopAvatarWidth, kTopAvatarHeight);
                    //角标需要盖在头像上，需要后绘制
                    let iconRank = this.iconRanks[index];
                    if (iconRank) {
                        ctx.drawImage(iconRank, x - 10, y - 17, kIconRankWidth, kIconRankHeight);
                    }

                    if (this.avatarNeedRefresh) {
                        this.avatarNeedRefresh = false;
                        //等待图片全部加载完成，刷新一次
                        this.refreshTop();
                    }
                });
            }
        }

        this.sharedCtx.drawImage(canvas, 0, 0, sharedWidth, sharedHeight, 0, 0, sharedWidth, sharedHeight);
    }

    showTopThree(msg) {
        //清空显示
        const sharedWidth = this.sharedCanvas.width;
        const sharedHeight = this.sharedCanvas.height;
        this.sharedCtx.clearRect(0, 0, sharedWidth, sharedHeight);

        let key = this.getKey(msg);
        this.curKey = key;
        this.gameDatas = null;
        WeChatSDK.getFriendCloudStorage(key, (datas) => {
            if (this.curKey != key) {
                console.log("showTopThree skip key", this.curKey, key);
                return;
            }
            console.log("showTopThree success", datas);
            this.gameDatas = datas;
            const dataLen = this.gameDatas.length;
            this.offsetY = 0;
            this.maxOffsetY = dataLen * kRankItemHeight;
            this.maxPage = Math.ceil(dataLen / kPageSize) - 1;
            //console.log("showTopThree Max_Page", this.maxPage);

            this.refreshTop();
        });
    }

    showRank(msg) {
        const sharedWidth = this.sharedCanvas.width;
        const sharedHeight = this.sharedCanvas.height;
        this.sharedCtx.clearRect(0, 0, sharedWidth, sharedHeight);

        let key = this.getKey(msg);
        this.curKey = key;
        this.gameDatas = null;
        WeChatSDK.getFriendCloudStorage(key, (datas) => {
            if (this.curKey != key) {
                console.log("showRank skip key", this.curKey, key);
                return;
            }
            console.log("showRank success", datas);
            this.gameDatas = datas;
            const dataLen = this.gameDatas.length;
            this.offsetY = 0;
            this.maxOffsetY = dataLen * kRankItemHeight;
            this.curPageIndex = 0;
            this.maxPage = Math.ceil(dataLen / kPageSize) - 1;
            //console.log("showRank Max_Page", this.maxPage);

            this.refreshRank();
        });
    }

    // 根据滑动偏移绘制排行榜画布
    refreshRank() {
        const sharedWidth = this.sharedCanvas.width;
        const sharedHeight = this.sharedCanvas.height;
        this.sharedCtx.clearRect(0, 0, sharedWidth, sharedHeight);
        if (this.clearFlag) {
            this.clearFlag = false
            this.rankCanvasList = [];
        }

        const pageY = this.offsetY % kRankPageHeight;
        const pageIndex = this.curPageIndex;
        const isOverOnePage = pageY + sharedHeight > kRankPageHeight;
        //console.log("isOverOnePage", isOverOnePage, pageY, sharedHeight, kRankPageHeight);
        let rankCanvas = this.getCanvasByPageIndex(pageIndex);
        // if (!isOverOnePage) {
            this.sharedCtx.drawImage(rankCanvas, 0, pageY, sharedWidth, sharedHeight, 0, 0, sharedWidth, sharedHeight);
        // } else {
        //     //绘制当前页后半部分
        //     const partialHeight = kRankPageHeight - pageY;
        //     this.sharedCtx.drawImage(rankCanvas, 0, pageY, sharedWidth, partialHeight, 0, 0, sharedWidth, partialHeight);

        //     //绘制下一页前半部分
        //     rankCanvas = this.getCanvasByPageIndex(pageIndex + 1);
        //     this.sharedCtx.drawImage(rankCanvas, 0, 0, sharedWidth, sharedHeight - partialHeight, 0, partialHeight, sharedWidth, sharedHeight - partialHeight);
        // }

        // //刷新自己
        // let find = false;
        // let selfData = null;
        // let selfRank = null;
        // for (let index = 0; index < this.gameDatas.length; index++) {
        //     const data = this.gameDatas[index];
        //     if (data.avatarUrl == this.selfUserInfo.avatarUrl) {
        //         find = true;
        //         selfData = data;
        //         selfRank = index + 1;
        //         break;
        //     }
        // }
        // if (!find) {
        //     selfData = this.selfUserInfo;
        // }
        // this.drawRankItemEx(this.sharedCtx, selfRank, selfData, (kRankItemHeight + kRankItemGap) * kPageSize, 2);
        this.drawPageNum();
    }

    drawPageNum(){
        let curIndex = this.curPageIndex + 1 || 1;
        let maxPage = this.maxPage + 1 || 1;
        this.sharedCtx.fillStyle = "#FFFFFF";
        this.sharedCtx.textAlign = "center";
        this.sharedCtx.baseLine = "middle";
        this.sharedCtx.font = `${kFontSize}px Helvetica`;
        this.sharedCtx.fillText(`${curIndex}${"/"}${maxPage}`, 220, 425);
    }

    // 获取指定页码的排行榜
    getCanvasByPageIndex(pageIndex) {
        let canvas = this.rankCanvasList[pageIndex];
        if (!canvas) {
            canvas = wx.createCanvas();
            canvas.width = this.sharedCanvas.width;
            canvas.height = kRankHeight;
            // canvas.height = kRankPageHeight;
            this.rankCanvasList[pageIndex] = canvas;
            const ctx = canvas.getContext('2d');
            this.drawPagedRanks(ctx, pageIndex);
        }
        return canvas;
    }

    drawPagedRanks(ctx, pageIndex) {
        const pageOffset = pageIndex * kPageSize;
        for (let i = 0; i < kPageSize; i++) {
            const data = this.gameDatas[pageOffset + i];
            if (data == null || data.rawValues == null) {
                continue;
            }
            let rank = pageOffset + i + 1;
            let style = (rank - 1) % kPageSize % 2;
            this.drawRankItemEx(ctx, rank, data, (kRankItemHeight + kRankItemGap) * i, style)
        }
    }

    drawRankItemEx(ctx, rank, data, itemY, style) {
        //console.log("drawRankItemEx", rank, style);
        //背景		
        // let bg = this.bgs[style];
        // if (bg) {
        //     ctx.drawImage(bg, 0, itemY, kRankItemWidth, kRankItemHeight);
        // }

        const textOffsetY = kRankItemHeight / 2 + 10;
        if (rank != null) {
            //名次 这里可以设置前几名的名次背景		
            if (rank <= this.iconRanks.length) {
                let icon = this.iconRanks[rank-1];
                if (icon != null) {
                    ctx.drawImage(icon, 30, itemY, kIconRankWidth, kIconRankHeight);
                }
            } else {
                ctx.fillStyle = "#FFFFFF";
                ctx.textAlign = "center";
                ctx.baseLine = "middle";
                ctx.font = `${kFontSize}px Helvetica`;
                ctx.fillText(`${rank}`, 30, itemY + textOffsetY);
            }
        } else {
            ctx.fillStyle = "#FFFFFF";
            ctx.textAlign = "center";
            ctx.baseLine = "middle";
            ctx.font = `${kFontSize}px Helvetica`;
            ctx.fillText(`?`, 30, itemY + textOffsetY);
        }

        //头像        
        this.drawAvatar(data.avatarUrl, (avatar) => {
            ctx.drawImage(avatar, 100, itemY + (kRankItemHeight - kRankAvatarHeight) / 2, kRankAvatarWidth, kRankAvatarHeight);

            if (this.avatarNeedRefresh) {
                this.avatarNeedRefresh = false;
                //等待图片全部加载完成，刷新一次
                this.refreshRank();
            }
        });

        //名字
        const nick = data.nickName || data.nickname || "unknown";
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.baseLine = "middle";
        ctx.font = `${kFontSize}px Helvetica`;
        ctx.fillText(nick, 210, itemY + textOffsetY);

        let scoreStr = "?";
        let accuracyStr = "?";
        let gradeStr = "?";
        let dateStr = "";
        if (data.rawValues != null) {
            scoreStr = data.rawValues[0].toString();
            let accuracy = (data.rawValues[1] * 0.01);
            accuracyStr = accuracy.toFixed(2) + "%";
            let grade = 0;
            for (let index = 0; index < kAccuracy2Grades.length; index++) {
                const element = kAccuracy2Grades[index];
                grade = index;
                if (accuracy < element) {
                    break;
                }
            }
            gradeStr = kGrades[grade];

            // let date = new Date(data.rawValues[2] * 1000);
            // dateStr = date.format("MM/dd HH:mm");
        }

        // //准确率
        // ctx.fillStyle = "#FFFFFF";
        // ctx.textAlign = "center";
        // ctx.baseLine = "middle";
        // ctx.font = `${kFontSize}px Helvetica`;
        // ctx.fillText(`${accuracyStr}`, 705, itemY + textOffsetY);

        // //评级
        // ctx.fillStyle = "#FFFFFF";
        // ctx.textAlign = "center";
        // ctx.baseLine = "middle";
        // ctx.font = `${kFontSize}px Helvetica`;
        // ctx.fillText(`${gradeStr}`, 845, itemY + textOffsetY);

        //分数
        ctx.fillStyle = "#FFFFFF";
        ctx.textAlign = "center";
        ctx.baseLine = "middle";
        ctx.font = `${kFontSize}px Helvetica`;
        ctx.fillText(`${scoreStr}`, 370, itemY + textOffsetY);

        //日期
        // ctx.fillStyle = "#FFFFFF";
        // ctx.textAlign = "left";
        // ctx.baseLine = "middle";
        // ctx.font = `18px Helvetica`;
        // ctx.fillText(`${dateStr}`, 0, itemY + textOffsetY);
    }
}

const rankList = new RankListRenderer();
rankList.listen();