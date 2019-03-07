/// <reference path="../creator.d.ts"/>
/// <reference path="lib.dom.d.ts"/>

declare module cc {
	export function waitForMs(ms : number) : Promise;

	export module Sprite {		
		/** !#en Sprite Size can track trimmed size, raw size or none.
		!#zh 精灵尺寸调整模式 */
		export enum ResizeMode {
			//完全根据UI上设置的大小			
			Custom,
			//完全使用图片大小
			Raw,
			//限制最大高度
			LimitHeight,
			//限制最大宽度
			LimitWidth,
			//限制最大宽高
            LimitSize,	
		}	
    }
    
    export interface Sprite {
        setResize(type: cc.Sprite.ResizeMode, size?: cc.Vec2 ) : void;

		setSprite(sprite: string | cc.SpriteFrame) : void;

		setUrl(sprite: string) : void;

		releaseSprite() : void;

		_resize() : void;
	}
	
	export interface Node {
		setGroup(group : string) : void;
	}
}