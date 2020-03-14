import Vue from 'vue';
import desktop from './desktop';
import fileSystem from './fileSystem';
// ipcRenderer.on('ssh', (sender, {type, data})=> {
//     // console.log(data);
//     switch(type) {
//     case 'command:ls':
//         Vue.$bus.parseFile(data);
//         break;
//     case 'command:cat':
//         Vue.$bus.parseFileContent(data);
//         break;
//     case 'command:xxd':
//         Vue.$bus.parseImg(data);
//         break;
//     case 'command:echo':
//         console.log(data);
//         break;
//     case 'log':
//         // const list = data.split('\n').map(item=> {
//         //     return item.split(' ').slice(1, 7).map(item=> parseInt(+item, 2));
//         // }).reduce((pre, cur)=> {
//         //     pre.push(...cur);
//         //     return pre;
//         // }, []);
//         let binary = '';
//         let bytes = new Uint8Array(data);
//         for (let len = bytes.byteLength, i = 0; i < len; ++i) {
//             binary += String.fromCharCode(bytes[i]);
//         }
//         console.log(binary);
//     }
//     Vue.$loading.hide();
// });

const bus = new Vue({
    mixins: [
        desktop,
        fileSystem
    ],
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
            }
        };
    },
    methods: {
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