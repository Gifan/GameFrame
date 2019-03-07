
'use strict';

//const Fs = require('fs');
const Fs = require('fire-fs');

var createVM = function (elem) {
    return new Vue({
        el: elem,
        data: {
            useExtend: true,
            useNewest:true,
            root: "art/altas/",
            bg: "bg",
            common: "common",
            moudule: "",
            export: "script/module/",
            jsonFilePath: ""
        },
        watch: {
            resources() {
                this.refresh();
            },
        },
        methods: {
            onClickCreate() {
                let paths = {}                      
                paths.root = this.root;
                paths.bg = this.bg;
                paths.common = this.common;
                paths.moudule = this.moudule;

                if (!this.useNewest) {
                    let path = Editor.Dialog.openFile({
                        title: "选择导入UI配置",
                        defaultPath:"C:/PsdExport",
                        filters: [
                        { name: 'Json File Type', extensions: ['json'] }
                        ]
                    });
                    if (path == -1) {
                        return;
                    }   

                    paths.jsonFilePath = path[0];              
                } else {
                    paths.jsonFilePath = "C:/PsdExport/_newest.json"; 
                }

          
                Editor.Scene.callSceneScript('ui-creator', 'create', paths, function (err, result) {
                    Editor.log(result);
                });
            },

            onClickExport() {
                let paths = {}                      
                paths.export = this.export;
                paths.useExtend = this.useExtend;

                Editor.Scene.callSceneScript('ui-creator', 'export', paths, function (err, result) {
                    Editor.log(result);
                });
            },
        }
    });
};

Editor.Panel.extend({
    template: Fs.readFileSync(Editor.url('packages://ui-creator/panel/panel.html'), 'utf-8'),
    style: Fs.readFileSync(Editor.url('packages://ui-creator/panel/style.css'), 'utf-8'),

    $: {
        'warp': '#warp'
    },

    ready() {
        this.vm = createVM(this.$warp);
        this.vm.refresh();
    }
});