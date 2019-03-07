import { Manager } from "./manager/Manager";

cc.waitForMs = function(ms : number) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, ms);
    })
}

cc.Sprite.ResizeMode = {
    Custom : 0,
    Raw : 1,
    LimitHeight : 2,
    LimitWidth : 3,
    LimitSize : 4,	
}

cc.Sprite.prototype._resize = function() {
    let scale = 1;
    let node : cc.Node = this.node;
    let resizeLimit : cc.Vec2 = this.resizeLimit;
    let width, height;
    if (this.spriteFrame != null) {
        let rect : cc.Rect = this.spriteFrame.getRect();
        width = rect.width;
        height = rect.height;
    } else {
        width = node.width;
        height = node.height;
    }    
    switch (this.resizeMode) {
        case cc.Sprite.ResizeMode.Custom:
            node.setContentSize(resizeLimit.x, resizeLimit.y);
        break;
        case cc.Sprite.ResizeMode.Raw:
        
        break;
        case cc.Sprite.ResizeMode.LimitHeight:
            scale = resizeLimit.y / height;
            node.setContentSize(width * scale, resizeLimit.y);
        break;
        case cc.Sprite.ResizeMode.LimitWidth:
            scale = resizeLimit.x / width;
            node.setContentSize(resizeLimit.x, height * scale);
        break;
        case cc.Sprite.ResizeMode.LimitSize:
            if (width * resizeLimit.y < height * resizeLimit.x) {
                scale = resizeLimit.y / height;
                node.setContentSize(width * scale, resizeLimit.y);
            } else {
                scale = resizeLimit.x / width;
                node.setContentSize(resizeLimit.x, height * scale);
            }
        break;
    }
    //cc.log(node.name, " _resize", this.resizeMode, resizeLimit, scale, node.width, node.height);
}

cc.Sprite.prototype.setResize = function(type, size) {
    this.resizeMode = type;
    if (size != null) {
        this.resizeLimit = size;
    } else {
        if (this.resizeLimit == undefined) {
            let node = this.node;
            this.resizeLimit = cc.v2(node.width, node.height);
            //cc.log(node.name, " setResize", type, this.resizeLimit);
        }
    }
    this._resize();
}

cc.Sprite.prototype.releaseSprite = function() {

    //cc.log("releaseSprite:", this.spriteName, this.spriteFrame);
    this.spriteFrame = null;
    if (this.spriteName == undefined) {
        //只能判断==undefined，不能判断!=
    } else {
        if (this.spriteName != null) {
            Manager.loader.UnLoadSprite(this.spriteName);
            this.spriteName = null;    
        }
    }

    if (this.spriteUrl == undefined) {
        //只能判断==undefined，不能判断!=
    } else {
        if (this.spriteUrl != null) {
            this.spriteUrl = null;    
        }
    }
}

cc.Sprite.prototype.setSprite = function(sprite) {
    if (this.resizeMode == undefined) {
        this.setResize(cc.Sprite.ResizeMode.LimitSize);
    }

    if (sprite == null || sprite == undefined) {
        cc.error(this.name + " setSprite args null")
        return;
    }

    //cc.log("setSprite:", sprite);
    if (typeof sprite == "string") {
        if (this.spriteName == sprite) {
            //避免重复加载
            //cc.log("skip setSprite:", this.spriteName);
            return;
        }
        this.releaseSprite();
        this.spriteName = sprite;
        Manager.loader.LoadSpriteAsync(sprite, function (name: string, asset: cc.SpriteFrame) {
            if (this.spriteName == null) {
                cc.warn(self.name + " setSprite skip spriteName null")
                return;
            }
            if (this.spriteName != name) {
                //在不同目录的同名文件会有问题，不过一般都要避免同名文件
                cc.warn(this.name + " setSprite skip spriteName:" + this.spriteName + " " + name)
                return;
            }
            //cc.log("loadSprite:", this.spriteName, asset);
            this.spriteFrame = asset;
            this._resize();
        }, this)
    } else {
        if (this.spriteFrame == sprite) {
            //避免重复加载
            return;
        }
        this.releaseSprite();
        this.spriteFrame = sprite;
        this.spriteName = null;
        this._resize();
    }
}

cc.Sprite.prototype.setUrl = function(url) {
    if (this.resizeMode == undefined) {
        this.setResize(cc.Sprite.ResizeMode.LimitSize);
    }

    if (url == null || url == undefined) {
        cc.error(this.name + " setUrl args null")
        return;
    }

    console.log("setUrl:", url);
    if (this.spriteUrl == url) {
        //避免重复加载
        //cc.log("skip setSprite:", this.spriteName);
        return;
    }
    this.releaseSprite();
    this.spriteUrl = url;
    if (url == "") {
        console.log("setUrl empty", this);
        return;
    }
    //获取微信头像显示
    cc.loader.load({url:url, type:"png"}, (err, texture : cc.Texture2D) => {
        if(err){
            console.error("获取微信头像错误", err);
        }
        if (this.spriteUrl != url) {
            //在不同目录的同名文件会有问题，不过一般都要避免同名文件
            console.warn(this.name + " spriteUrl skip:" + this.spriteUrl + " " + url)
            return;
        }
        this.spriteFrame = new cc.SpriteFrame(texture);
        this._resize();
    });
}

cc.Node.prototype.setGroup = function(group) {
    this.group = group;
    for (let index = 0; index < this.childrenCount; index++) {
        const child = this.children[index];
        child.setGroup(group);
    }
}