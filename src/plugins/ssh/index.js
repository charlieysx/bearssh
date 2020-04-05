import Vue from 'vue';
import IPC from '../../IPC';
import TYPE from './type';
const { ipcRenderer, ipcMain } = require('electron');

class SSH {
    constructor() {
        this.promiseMap = new Map();
        this.onIpcListener();
    }

    onIpcListener() {
        ipcRenderer.on(IPC.SSH, async (e, res)=> {
            const id = res.id;
            if (id === -1) {
                const type = res.data.type;
                // todo 断开或关闭连接，需要重连或其他操作
                console.log(type);
                return;
            }
            if (!this.promiseMap.has(id)) {
                return;
            }
            const item = this.promiseMap.get(id);
            this.promiseMap.delete(id);
            if (res.success) {
                item.resolve(res.data);
            } else {
                item.reject(res.data);
            }
        });
    }

    promise(fn) {
        return new Promise((resolve, reject)=> {
            const id = new Date().getTime() + '_' + Math.floor(Math.random() * 1000);
            this.promiseMap.set(id, {resolve, reject});
            fn(id);
        });
    }

    send(type, data) {
        return this.promise((id)=> {
            ipcRenderer.send(IPC.SSH, type, {
                data,
                id
            });
        });
    }

    async connect(data) {
        return this.send(TYPE.CONNECT, data);
    }

    async readdir(path = '/') {
        return this.send(TYPE.READDIR, path);
    }

    async readFile(path = '', encoding = 'utf-8') {
        return this.send(TYPE.READFILE, {path, encoding});
    }
}

Vue.$ssh = Vue.prototype.$ssh = new SSH();