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

    async getFiles(root) {
        if (root.type !== 'd') {
            return;
        }
        root.list = await this.readdir(root.path);
        for (let i = 0;i < root.list.length;++i) {
            const file = root.list[i];
            const type = file.longname[0];
            if (type !== 'd' && type !== '-') {
                continue;
            }
            root.list[i] = {
                filename: file.filename,
                path: `${root.path}/${file.filename}`,
                type,
                list: []
            };
            await this.getFiles(root.list[i]);
        }
    }

    async download(file) {
        console.log(file);
        if (!file) {
            return;
        }
        // 下载文件
        if (file.type === '-') {
            return this.send(TYPE.DOWNLOADFILE, {file});
        } else if (file.type === 'd') {
            // 下载文件夹，需要递归查询所有文件
            const root = {
                filename: file.filename,
                path: file.path,
                type: file.type,
                list: []
            };
            await this.getFiles(root);
            console.log(root);
            return this.send(TYPE.DOWNLOADDIR, {root});
        } else {
            throw '不支持下载类型该文件';
        }
    }
}

Vue.$ssh = Vue.prototype.$ssh = new SSH();