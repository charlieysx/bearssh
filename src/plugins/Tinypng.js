import Axios from 'axios';
import Vue from 'vue';
const {storage} = require('@utils/storage');
const Base64 = require('js-base64').Base64;
import {Thread, ThreadPool} from '@utils/thread.js';
const fs = require('fs');

class Tinypng extends Thread {
    constructor(file, info) {
        super();
        this._file = file;
        this._info = info;
        this._content = fs.readFileSync(file.path);
        this._tryCount = 3;
        this._cb = ()=> {};
    }

    listen(cb) {
        this._cb = cb;
        return this;
    }

    send(type, msg) {
        this._cb(type, this._info, msg);
    }

    init() {
        this.send('init');
        return this;
    }

    async run() {
        return new Promise((resolve, reject)=> {
            const [item] = apiKey.filter(item=> item.left > 0);
            if (!item) {
                reject({
                    type: 1,
                    msg: 'no left count'
                });
                return;
            }
            axios.post('/shrink', this._content, {
                headers: {
                    Authorization: `Basic ${item.b64Key}`
                },
                onUploadProgress: (event)=> {
                    let complete = event.loaded * 100 / event.total | 0;
                    this.send('uploading', complete);
                }
            }).then((res)=> {
                setLeft(item, res);
                this.send('compressSuccess', res.data);
                this.download(res.data, resolve, reject);
            }).catch(err=> {
                setLeft(item, err.response);
                this.send('error');
                if (item.left === 0) {
                    reject({
                        type: 1,
                        msg: 'no left count'
                    });
                } else {
                    reject({
                        type: 2,
                        msg: 'error'
                    });
                }
            });
        });
    }

    download(data, resolve, reject) {
        const {input, output} = data;
        axios.get(output.url, {
            responseType: 'blob',
            onDownloadProgress: (event)=> {
                let complete = event.loaded * 100 / event.total | 0;
                this.send('downloading', complete);
            }
        }).then((res)=> {
            let reader = new FileReader();
            reader.readAsDataURL(res.data);
            reader.onload = (e) => {
                let base64Data = e.target.result.replace(/^data:image\/\w+;base64,/, "");
                let dataBuffer = Buffer.from(base64Data, 'base64');
                fs.writeFileSync(this._file.path, dataBuffer);
                this.send('downloadSuccess', data);
                resolve();
            };
            reader.onerror = (e)=> {
                throw 'error';
            };
        }).catch(err=> {
            this.send('error');
            reject();
        });
    }
}

const axios = Axios.create({
    baseURL: 'https://api.tinify.com'
});

// const apiKey = [{
//     key: 'eAnqB9MIjZtNevWtdJf4dCn1SowULa4Z',
//     b64Key: Base64.encode('eAnqB9MIjZtNevWtdJf4dCn1SowULa4Z'),
//     left: 0
// }];
const apiKey = [];
let keysLeftListener = ()=> {};
const pool = new ThreadPool(10);

const loadConfig = async ()=> {
    Vue.$loading.show('加载apikey配置中...', true);
    const config = storage.load('config', {});
    const tinypngConfig = config.tinypng;
    if (tinypngConfig && tinypngConfig.keys && tinypngConfig.keys.length > 0) {
        apiKey.splice(0, apiKey.length);
        apiKey.push(...tinypngConfig.keys.reduce((pre, item)=> {
            if (pre.indexOf(item) === -1) {
                pre.push({
                    key: item,
                    b64Key: Base64.encode(item),
                    left: 500
                });
            }
            return pre;
        }, []));
    }
    try {
        await Promise.all(apiKey.map(item=> tryToGetLeft(item)));
    } catch(e) {
        console.log(e);
    }
    const haveValidKey = apiKey.some(item=> item.left > 0);
    Vue.$loading.hide();
    return {
        haveValidKey,
        apiKey
    };
};

const setLeft = (item, res)=> {
    let used = 0;
    try {
        used = +res.headers['compression-count'] || 0;
    } catch(e) {
        used = 0;
    }
    const left = 500 - used;
    if (left === 500 || left < item.left) {
        item.left = left;
    }
    keysLeftListener(keysLeft());
};

const tryToGetLeft = (item)=> {
    return new Promise(resolve=> {
        axios.post('/shrink', null, {
            headers: {
                Authorization: `Basic ${item.b64Key}`
            }
        }).catch(err=> {
            setLeft(item, err.response);
            resolve();
        });
    });
};

const create = (file, info)=> {
    return new Tinypng(file, info);
};

const compress = (item)=> {
    pool.push(item);
};

const keysLeft = ()=> {
    if (apiKey.length === 0) {
        return 0;
    }
    return apiKey.reduce((pre, cur)=> {
        return pre + cur.left;
    }, 0);
};

const listenKeysLeft = (cb)=> {
    keysLeftListener = cb;
};

export default {
    loadConfig,
    create,
    compress,
    keysLeft,
    listenKeysLeft
};