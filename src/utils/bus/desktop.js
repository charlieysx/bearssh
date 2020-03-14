import Vue from 'vue';

export default {
    data () {
        return {
            desktop: {
                dockList: [],
                appList: [],
                currentApp: null
            },
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
            this.desktop.dockList.push({
                ...setting
            });
        });
    },
    methods: {
        activeApps(appConfig) {
            this.desktop.appList.sort((a, b)=> {
                if (a.sign === appConfig.sign) {
                    return -1;
                }
                if (b.sign === appConfig.sign) {
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
        includesApp(appConfig) {
            return this.desktop.appList.findIndex(app=> app.sign === appConfig.sign) > -1;
        },
        getAppConfig(appName, sign) {
            return this.desktop.dockList.find(item=> item.sign === sign && item.appName === appName);
        },
        addApp(appConfig, config = {}) {
            let app = this.desktop.dockList.find(item=> item.sign === appConfig.sign);
            if (!app) {
                throw `${appConfig.appName} 程序不存在`;
            }
            const newConfig = {
                uuid: new Date().getTime(),
                ...app,
                config: {
                    ...app.config,
                    ...config
                }
            };
            delete newConfig.instance;
            for (let i = this.desktop.appList.length - 1;i >= 0;--i) {
                const app = this.desktop.appList[i];
                if (app.sign === appConfig.sign) {
                    newConfig.config.left = app.instance.innerLeft + 20;
                    newConfig.config.top = app.instance.innerTop + 20;
                    break;
                }
            }

            this.desktop.appList.push(newConfig);
            this.desktop.currentApp = newConfig;
        },
        removeApp(uuid) {
            const index = this.desktop.appList.findIndex(app=> app.uuid === uuid);
            if (index > -1) {
                this.desktop.appList.splice(index, 1);
                this.desktop.currentApp = this.desktop.appList[this.desktop.appList.length - 1];
            }
        },
        saveAppInstance(instance) {
            const app = this.desktop.appList.find(app=> app.uuid === instance.uuid);
            if (app) {
                app.instance = instance;
            }
        }
    }
};