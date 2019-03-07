'use strict';

let Fs = require('fire-fs');
let Path = require('fire-path');

function mkdirs(dirpath) {
  if (!Fs.existsSync(Path.dirname(dirpath))) {
    mkdirs(Path.dirname(dirpath));
  }
  if (!Fs.existsSync(dirpath)) {
      Fs.mkdirSync(dirpath);
  }
}

function deletefolder(path) {
  let files = [];
  if( Fs.existsSync(path) ) {
      files = Fs.readdirSync(path);
      files.forEach(function(file, index){
        let curPath = path + "/" + file;
          if(Fs.statSync(curPath).isDirectory()) { // recurse
            deletefolder(curPath);
          } else { // delete file
            Fs.unlinkSync(curPath);
          }
      });
      Fs.rmdirSync(path);
  }
};

function onBeforeBuildFinish (options, callback) {
  Editor.log(`onBeforeBuildFinish: ${options}`);
  
  callback();
}

let musicFolders = {}
function onAfterBuildFinish() {
  Editor.log("onAfterBuildFinish", Object.keys(musicFolders).length);

  for (const key in musicFolders) {
    let path = key.replace(/wechatgame\\/g, '');
    //Editor.log(`onAfterBuildFinish "${key}": ${path}`);
    mkdirs(Path.dirname(path));
    try {
      Fs.renameSync(key, path);
    } catch (e) {
      Fs.renameSync(key, path);
    }
  }
}

function onBuildFinish (options, callback) {
  Editor.log(`onBuildFinish: ${options}`);
  let buildResults = options.buildResults;

  let dirpath = Editor.Project.path + "/build/res/";
  if (Fs.existsSync(dirpath)) {
    let lastDirPath = Editor.Project.path + "/build/lastRes/";
    if (Fs.existsSync(lastDirPath)) {
      deletefolder(lastDirPath); 
    }

    Fs.renameSync(dirpath, lastDirPath);
  }

  musicFolders = {};

  // get music path
  Editor.assetdb.queryAssets('db://assets/resources/music/**/*', 'audio-clip', (err, assetInfos) => {
      for (let i = 0; i < assetInfos.length; ++i) {
          let uuid = assetInfos[i].uuid;
          if (buildResults.containsAsset(uuid)) {
              let path = buildResults.getNativeAssetPath(uuid);
              let folder = Path.dirname(path);
              //Editor.log(`onBuildFinish Music of "${assetInfos[i].url}": ${path}`);
              musicFolders[folder] = true;
          }
      }
  });

  //3秒后迁移文件夹
  setTimeout(onAfterBuildFinish, 3000);

  callback();
}

module.exports = {
  load () {
      //Editor.Builder.on('before-change-files', onBeforeBuildFinish);
      Editor.Builder.on('build-finished', onBuildFinish);
  },

  unload () {
      //Editor.Builder.removeListener('before-change-files', onBeforeBuildFinish);
      Editor.Builder.removeListener('build-finished', onBuildFinish);
  }
};
