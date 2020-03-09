import Vue from 'vue';
const { ipcRenderer } = require('electron');
ipcRenderer.on('ssh', (sender, {type, data})=> {
    // console.log(data);
    switch(type) {
    case 'command:ls':
        Vue.$bus.parseFile(data);
        break;
    case 'command:cat':
        Vue.$bus.parseFileContent(data);
        break;
    case 'command:xxd':
        Vue.$bus.parseImg(data);
        break;
    case 'command:echo':
        console.log(data);
        break;
    }
    Vue.$loading.hide();
});

const bus = new Vue({
    data() {
        return {
            hadLogin: false,
            system: {
                bgStyle: {
                    backgroundImage: `url(${require('@imgs/bg.jpg')})`
                },
                width: 1200,
                height: 750,
                contentWidth: 1200,
                contentHeight: 672
            },
            desktop: {
                dockList: [],
                appList: [],
                currentApp: null
            },
            fileList: []
        };
    },
    created() {
        ['CbFolder', 'CbCode', 'CbImage', 'CbTest'].forEach(name=> {
            const ctor = Vue.component(name);
            if (!ctor) {
                throw `app[${name}]不存在`;
            }
            const setting = (new ctor()).$options.setting;
            if (!setting) {
                throw `app[${name}]没有配置项`;
            }
            // 组件继承
            if (setting.extends) {
                const baseCtor = Vue.component(setting.extends);
                const baseSetting = (new baseCtor()).$options.setting;
                setting.base = Object.assign({}, baseSetting, setting.base);
            }
            this.desktop.dockList.push({
                ...setting
            });
        });
    },
    methods: {
        activeApps(appName) {
            this.desktop.appList.sort((a, b)=> {
                if (a.appName === appName) {
                    return -1;
                }
                if (b.appName === appName) {
                    return 1;
                }
                return 0;
            });
            this.currentApp = this.desktop.appList[this.desktop.appList.length - 1];
        },
        activeApp(uuid) {
            const index = this.desktop.appList.findIndex(app=> app.uuid === uuid);
            if (index > -1) {
                const app = this.desktop.appList[index];
                this.desktop.appList.splice(index, 1);
                this.desktop.appList.push(app);
                this.desktop.currentApp = this.desktop.appList[this.desktop.appList.length - 1];
            }
        },
        isActiveApp(uuid) {
            return this.desktop.currentApp && this.desktop.currentApp.uuid === uuid;
        },
        includesApp(appName) {
            return this.desktop.appList.findIndex(app=> app.appName === appName) > -1;
        },
        addApp(app, config = {}) {
            if (typeof app === 'string') {
                app = this.desktop.dockList.find(item=> item.appName === app);
                if (!app) {
                    throw `${app} 程序不存在`;
                }
            }
            const newConfig = {
                uuid: new Date().getTime(),
                ...app,
                config: {
                    ...app.config,
                    ...config
                }
            };
            this.desktop.appList.push(newConfig);
            this.desktop.currentApp = this.desktop.appList[this.desktop.appList.length - 1];
        },
        removeApp(uuid) {
            const index = this.desktop.appList.findIndex(app=> app.uuid === uuid);
            if (index > -1) {
                this.desktop.appList.splice(index, 1);
                this.desktop.currentApp = this.desktop.appList[this.desktop.appList.length - 1];
            }
        },
        getFileList(list, pathList) {
            if (pathList.length <= 1) {
                return list;
            }
            for (let i = 0;i < list.length;++i) {
                let item = list[i];
                if (item.filename === pathList[0]) {
                    return this.getFileList(item.list, pathList.slice(1));
                }
            }
            return list;
        },
        getItemFileList(list, path) {
            const item = list.find(item=> path.indexOf(item.path + '/') === 0);
            if (item) {
                if (item.path + '/' === path) {
                    return item.list;
                } else {
                    return this.getItemFileList(item.list, path);
                }
            }
            return [];
        },
        parseFile(data) {
            try {
                let path = data.command.replace('ls -la ', '');
                if (path !== '/') {
                    path += '/';
                }
                const fileList = data.res.split('\n')
                    .slice(3)
                    .map(item=> {
                        const type = item[0];
                        const filename = item.split(' ').slice(-1)[0];
                        return {
                            showInput: false,
                            inputValue: filename,
                            type,
                            filename,
                            path: `${path}${filename}`,
                            list: []
                        };
                    })
                    .filter(item=> item.type !== 'l');
                const list = this.getFileList(this.fileList, path.split('/').slice(1));
                list.push(...fileList.filter(item=> list.findIndex(file=> file.filename === item.filename) === -1));
            } catch(e) {
                console.log(e);
            }
        },
        parseFileContent(data) {
            this.$emit(data.command, {
                content: data.res,
                item: null
            });
        },
        parseImg(data) {
            const ext = data.command.split('.').slice(-1)[0];
            const list = data.res.split('\n').map(item=> {
                return item.split(' ').slice(1, 7).map(item=> parseInt(+item, 2));
            }).reduce((pre, cur)=> {
                pre.push(...cur);
                return pre;
            }, []);
            let binary = '';
            let bytes = new Uint8Array(list);
            for (let len = bytes.byteLength, i = 0; i < len; ++i) {
                binary += String.fromCharCode(bytes[i]);
            }
            this.$emit(data.command, {
                content: `data:image/${ext};base64,${window.btoa(binary)}`,
                item: null
            });
        }
    }
});

Vue.$bus = Vue.prototype.$bus = bus;