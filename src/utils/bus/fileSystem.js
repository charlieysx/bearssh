import Vue from 'vue';

const iconMap = {
    conf: ['conf'],
    css: ['css', 'less', 'scss'],
    font: ['ttf', 'otf'],
    html: ['html', 'htm'],
    img: ['png', 'jpg', 'jpeg', 'ico', 'svg', 'gif'],
    js: ['js'],
    json: ['json'],
    md: ['md'],
    music: ['mp3'],
    php: ['php'],
    sh: ['sh'],
    txt: ['txt'],
    video: ['mp4', 'avi'],
    zip: ['zip']
};

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
        getIcon(type, filename) {
            let icon = 'common';
            if (type === 'd') {
                icon = 'folder';
            } else if (type === 'l') {
                icon = 'link';
            } else if (type === '-') {
                const ext = filename.split('.').slice(-1)[0] || '';
                if (ext) {
                    for (let key in iconMap) {
                        if (iconMap[key].includes(ext) || iconMap[key].includes(ext.toUpperCase())) {
                            icon = key;
                            break;
                        }
                    }
                }
            }
            return require(`@imgs/icon-file-type/${icon}.png`);
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
                    icon: this.getIcon(item.longname[0], item.filename),
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