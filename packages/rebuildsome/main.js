'use strict';
let packageName = "rebuildsome";
let path = require('path');
let fs = require('fs');
function onBuildFinish(option, callback){
  if(fs.existsSync(option.dest+'\\utils\\ald-game.js')){
    Editor.log("存在阿拉丁数据文件");
    var file = fs.readFileSync(option.dest+'\\game.js','utf-8');
    Editor.log("打开game.js文件");  
    var newdata = "require('utils/ald-game.js');\r\n"+file;
    fs.writeFileSync(option.dest+'\\game.js',newdata);
    Editor.log('修改game.js成功');
  }else{
    Editor.log("不存在阿拉丁数据，不做任何操作");
  }
  callback();
}

module.exports = {
  load () {
    // execute when package loaded
    Editor.Builder.on('build-finished', onBuildFinish);
  },

  unload () {
    // execute when package unloaded
    Editor.Builder.removeListener('build-finished', onBuildFinish);
  },

  // register your ipc messages here
  messages: {
    'open' () {
      // open entry panel registered in package.json
    },
    'say-hello' () {
      Editor.log('Hello World!');
    },
  },


};