import Vue from 'vue';

export default {
    data () {
        return {
            file: {
                list: []
            }
        };
    },
    methods: {
        getListPointer(list, pathList) {
            if (pathList.length <= 1) {
                return list;
            }
            const len = list.length;
            for (let i = 0;i < len;++i) {
                const item = list[i];
                if (item.filename === pathList[0]) {
                    return this.getListPointer(item.list, pathList.slice(1));
                }
            }
            return list;
        },
        saveFileList(path, list) {
            if (path !== '/') {
                path += '/';
            }
            const fileList = list.map(item=> {
                return {
                    showInput: false,
                    inputValue: item.filename,
                    type: item.longname[0],
                    isHidden: item.filename[0] === '.',
                    path: `${path}${item.filename}`,
                    list: [],
                    ...item
                };
            }).sort((a, b)=> {
                const na = a.filename;
                const nb = b.filename;
                // 隐藏文件放最前面
                if ((na[0] === '.' && nb[0] === '.') || (na[0] !== '.' && nb[0] !== '.')) {
                    return na.localeCompare(nb);
                } else if (na[0] === '.') {
                    return -1;
                } else if (nb[0] === '.') {
                    return 1;
                }
            });
            list = this.getListPointer(this.file.list, path.split('/').slice(1));
            list.push(...fileList.filter(item=> list.findIndex(file=> file.filename === item.filename) === -1));
            return list;
        }
    }
};