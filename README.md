Cocos Creator 2.0 版本 框架示例文件说明

使用语言： Typescript
开放工具： VSCode
代码风格：参见Typescript官网 https://www.tslang.cn/docs/handbook/declaration-files/introduction.html

框架总思想
	采用模块化开发功能，保证内聚
	各个模块之间禁止相互调用，保证松耦合；
	使用Notifier消息管理器进行模块间的通信，消息ID的定义放在ListenID、CallID两个文件中，NotifyID文件为框架内部消息
		需要有返回值的通信注册setCall， call
		不关心返回值的通信使用addListener，send
	模块内采用MVCS架构
		Model存储数据，不处理任何逻辑，发送消息通知其他层、其他模块数据变化
		Net负责网络收发，持有model引用，可以直接调用model函数更新数据
		Logic管理逻辑，持有model，net引用，可以直接调用model函数更新数据,也可以调用net发送消息
		View负责显示，通过UIManager打开，不推荐持有本模块的Logic来获取数据，推荐通过消息来拉取数据，监听数据变化来刷新
	
	通过约定资源的放置位置，简化配置
	减少对引擎的依赖，view不继承cc.Component，只保留UI的node跟节点引用

快速入门
	程序入口在Launcher场景的Launcher脚本上，该脚本需要update驱动Time，Loader

	阅读main，scene，affirm，badge 几个个范例模块

	ui通过ui-creator工具从PSD直接导出，拖入resources/ui生成预制件,预制件名称规范为：模块名称UI@模块名称
	然后在场景中选中预制件跟节点，点击导出代码
	通过Cocos Creator的菜单-》扩展-》module-creator来生成module模板，需要将新加入的module在ModuleLauncher中注册

	AbsView构造函数参数说明
	/*
		* asset 资源加载路径或者已经在场景中的资源节点
		* uiLayer ui所在图层，决定遮盖关系
		* uiQueue ui在打开队列，同一队列的UI，后打开的后隐藏之前的，关闭后会恢复之前的，通过UIManager.closeQueues来关闭之前的ui
		* transition 打开关闭动画
		*/
	public constructor(asset : string | Node, uiLayer : eUILayer, uiQueue : eUIQueue, transition : ITransition)

	打开UI，打开args支持很多参数，具体见定义，也可以继承扩展，不需要参数时可以传null
		方式1，通过FuncLogic打开
			let args = new MVCS.OpenArgs();
			args.SetId(FuncDefine.Hero);
			Notifier.send(ListenID.Func_Open, args);
		方式2,同过view类名打开,不需要Func表配合
			let args = new MVCS.OpenArgs();	//可选
			UIManager.OpenByType("HeroView", args);
	传入的参数会保存在view的_openArgs中

	获取Logic，但是不推荐使用，最多持有本模块的Logic
		let logic = MVCS.LogicContainer.getInstance<LoginLogic>("Login");


	本框架的Pool，Loader, 场景加载功能都是作为例子演示，可以自行替换


工程目录 	---参考官方例子，目录全部小写
art			--美术资源跟目录
	actor			--角色资源
	altas			--UI图集资源
		bg				--UI里大的背景图
	tiledmap		--瓦片地图资源
	font			--字体资源
	fx				--特效资源
	world			--场景图片资源
	……
	
resources	--需要代码动态加载的资源,预制件
	actor	--人物预制件
	audio	--音效
	config	--配置表导出的json
	i18n	--本地化翻译文件
	icon	--图标(有需求可以细分多个文件夹)
	item	--物品预制件
	music	--背景音乐
	fx		--特效预制件
	ui 		--UI预制件
	……	
	
scene		--存放场景文件

frame		--通用框架，为了便于升级框架，请勿直接修改本文件夹内的任何文件，有bug或其他扩展请提交框架库修改后同步
	collections		--常用容器类文件夹
	extension		--常用扩展类文件夹
	mvcs			--MVCS框架文件	Model,View,Controller,Net各自有基类
		AbsLogic		--负责处理逻辑，模块间的通信
		AbsModel		--负责存储数据
		AbsNet			--负责网络消息的收发
		AbsView			--负责显示数据，层次，打开关闭动画表现控制
		Notifier		--全局使用的静态消息管理器
	
	UIManager		--管理多个UI之间的打开，关闭
	Time			--定时器，需要外部update驱动
	Watcher			--定时器handler
	Pool			--Node池封装，支持预加载，回收管理

sdk			--SDK相关定义，为了便于升级，请勿直接修改本文件夹内的任何文件
	WeChatSDK
	XHSDK

script		--代码文件
	adpapter	--其他代码适配用的warp文件夹
	common		--通用结构定义
	component	--单独使用，无其他依赖的脚本
	config		--配置表导出生成的表结构对象	
	launch		--启动管理	
		Launcher	--场景唯一挂载的启动脚本，负责调用其他初始化
		AppLauncher		--负责App初始化
		ModuleLauncher	--负责模块初始化
		NetLauncher		--负责网络初始化
		UILauncher		--负责UI初始化	

	loader		--加载管理，其他项目可以使用自己的加载管理
	manager		--管理器
	message		--模块间通信的消息定义	
	module		--具体功能模块(主要是UI)，不能相互调用，通过Notifier消息通信
		affirm			--二次确认
		badge			--小红点
		login			--登录
		guide			--新手引导	
		scene			--场景加载
		stage			--关卡管理
	pool		--池管理

	protobuff	--网络消息定义
		protobuf		--需要作为插件全局导入

	test		--测试代码

	CallID		--跨模块调用ID定义
	ListenID	--跨模块监听ID定义
	MsgID		--网络消息ID定义
	NetUtil		--网络发包工具
	StorageID	--本地存储ID定义
	cc			--cocos creator扩展定义

-------------
外部扩展
packages
	i18n				--官方的本地化插件
	excel-killer		--配置表导出工具
	module-creator		--模块生成工具
	ui-creator			--PSD2UI工具