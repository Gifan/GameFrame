
import { Notifier } from "../frame/Notifier";
import { NotifyID } from "../frame/NotifyID";
import { Time } from "../frame/Time";

export class CameraManager {
    public constructor() {
        Notifier.addListener(NotifyID.Game_Update, this.onUpdate, this);
    }

    private onSceneSwitchFinish() {        
        //cc.log("onSceneSwitchFinish", msg.id);
        this.initCamera(true);
    }

    public initCamera(force = false) {
        if (!force && this._cameraNode != null) {
            return;
        }
        this._cameraNode = cc.find("Canvas/Main Camera");
        if (this._cameraNode != null) {
            this._camera = this._cameraNode.getComponent(cc.Camera);
        }
    }

    private _camera : cc.Camera;
    public get camera() {
        return this._camera;
    }

    private _cameraNode : cc.Node;
    public get node() {
        return this._cameraNode;
    }

    private _target : cc.Node;
    // private _offset : cc.Vec2;
    public setTarget(target : cc.Node) {
        this.initCamera(false);
        this._target = target;
        // if (target != null) {
        //     this._offset = target.position.sub(this._cameraNode.position);
        // }
    }

    private _zoomStart = false;
    private _zoomOffset : cc.Vec2 = cc.v2(0, 0);
    private _zoomRatio : number = 1;
    private _zoomSpeed : number = 1;
    /** 
     * 设置相机视野缩放
     * @param ratio 缩放
     * @param speed 改变速度
     */
    public setZoom(ratio : number, speed : number) {
        this._zoomStart = true;
        this._zoomRatio = ratio;
        this._zoomSpeed = speed;
        this.initCamera(false);
        //cc.log("setZoom", ratio, speed, "Time", Time.time, this._camera.zoomRatio);
    }

    private _shakeStart = false;
    private _shakeStrength : number = 1;
    private _shakeDura : number = 1;
    private _shakeTimeout : number = 1;
    private _shakeSpeed : number = 100;
    private _rawPosition : cc.Vec2 = cc.Vec2.ZERO;
    /** 
     * 设置相机震动
     * @param strength 强度
     * @param speed 速度
     * @param dura 时间
     */
    public setShake(strength : number, speed : number, dura : number) {
        this._shakeStart = true;
        this._shakeStrength = strength;
        this._shakeDura = dura;
        this._shakeTimeout = Time.time + dura;
        this._shakeSpeed = speed;
        this.initCamera(false);
        if (this._cameraNode) {
            this._rawPosition = this._cameraNode.position;
        }
        //cc.log("setshake", ratio, speed, "Time", Time.time, this._camera.shakeRatio);
    }

    private onUpdate() {
        this.follow();
        this.zoom();
        //震动必须在跟随之后进行
        this.shake();
    }

    private follow() {
        if (this._target == null) {
            //cc.log("CameraManager.update _target null");
            return;
        }
        if (this._cameraNode == null) {
            cc.error("CameraManager.follow _cameraNode null");
            return;
        }

        let offset = this._zoomOffset;
        let postion = this._target.position.add(offset);
        this._cameraNode.setPosition(postion);
    }


    private zoom() {
        if (!this._zoomStart) {
            return;
        }
        if (this._camera == null) {
            cc.error("CameraManager.zoom _camera null");
            return;
        }

        let curRatio = this._camera.zoomRatio;
        let targetRatio = this._zoomRatio;
        this._camera.zoomRatio = Math.lerp(curRatio, targetRatio, this._zoomSpeed * Time.deltaTime);

        //cc.log("zoom", curRatio, targetRatio, "Time", Time.time, this._camera.zoomRatio);

        if (Math.abs(this._camera.zoomRatio - targetRatio) < 0.005) {
            this._zoomStart = false;
            this._camera.zoomRatio = targetRatio;
        }
        this._zoomOffset.x = (1 - this._camera.zoomRatio) * 1334 / 5;
    }

    private shake() {
        if (!this._shakeStart) {
            return;
        }
        if (this._cameraNode == null) {
            cc.error("CameraManager.shake _cameraNode null");
            return;
        }

        if (this._shakeTimeout < Time.time) {
            this._shakeStart = false;
            if (this._target == null) {
                this._cameraNode.setPosition(this._rawPosition);
            }
            return;
        }

        let strength = Math.lerp(0, this._shakeStrength, (this._shakeTimeout - Time.time) / this._shakeDura);
        let offset = cc.v2(
            Math.sin(Time.time * this._shakeSpeed) * strength,
            Math.cos(Time.time * this._shakeSpeed) * strength,
        );

        //cc.log((this._shakeTimeout - Time.time) / this._shakeDura, Math.sin(Time.time), Math.cos(Time.time), "strength", strength, toJson(offset));

        let position;
        if (this._target == null) {
            position = this._rawPosition;
        } else {
            position = this._cameraNode.position;
        }
        position = position.add(offset);
        this._cameraNode.setPosition(position);
    }

    //屏幕截图
    public screenShot(cullingMask = null) {
        this.initCamera(false);
        if (this._camera == null) {
            cc.error("CameraManager.screenShot _camera null");
            return;
        }
        // let camera = UIManager.camera; //this._camera;
        // let lastMask = camera.cullingMask;
        // if (cullingMask != null) {
        //     // 设置你想要的截图内容的 cullingMask
        //     //this._camera.cullingMask = 0xffffffff;
        //     this._camera.cullingMask = cullingMask;            
        // }


        // // // 新建一个 RenderTexture，并且设置 camera 的 targetTexture 为新建的 RenderTexture，这样 camera 的内容将会渲染到新建的 RenderTexture 中。
        // let texture = new cc.RenderTexture();
        // // 如果截图内容中不包含 Mask 组件，可以不用传递第三个参数
        // texture.initWithSize(1334, 750);
        // //texture.initWithSize(cc.visibleRect.width, cc.visibleRect.height);
        // camera.targetTexture = texture;

        // // 渲染一次摄像机，即更新一次内容到 RenderTexture 中
        // camera.render(camera.node);

        //camera.targetTexture = null;

        // // 这样我们就能从 RenderTexture 中获取到数据了
        // let data = texture.readPixels();

        // var size = cc.director.getWinSize();
        // var fileName = "result_share.jpg";
        // var fullPath = jsb.fileUtils.getWritablePath() + fileName;
        // if(jsb.fileUtils.isFileExist(fullPath)){
        //     jsb.fileUtils.removeFile(fullPath);
        // }
        // //如果要图片高质量 可以使用cc.Texture2D.PIXEL_FORMAT_RGBA8888。
        // var texture = new cc.RenderTexture();
        // texture.initWithSize(Math.floor(size.width), Math.floor(size.height));
        // texture.setPosition(cc.p(size.width/2, size.height/2));
        // texture.begin();
        // cc.director.getRunningScene().visit();
        // texture.end();

        // if (cullingMask != null) {
        //     // 还原设置
        //     camera.cullingMask = lastMask;            
        // }

        // let spriteFrame = new cc.SpriteFrame();
        // spriteFrame.setTexture(texture)

        // return spriteFrame;
    }
}