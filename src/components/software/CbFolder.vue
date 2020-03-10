<script>
import { ipcRenderer } from 'electron';
import CbApp from '@c/common/CbApp';
export default {
    name: 'CbFolder',
    extends: CbApp,
    setting: {
        appName: 'CbFolder',
        name: '文件夹',
        icon: require('@imgs/icon-folder.png'),
        config: {
            path: '/',
            width: 600,
            height: 500
        }
    },
    data() {
        return {
            pathList: [],
            rightList: [],
        };
    },
    created() {
        if (!this.uuid) {
            return;
        }
        this.changePath();
        ipcRenderer.send('ssh', 'command:ls', `ls -la ${this.dirPath}`);
    },
    watch: {
        '$bus.fileList': {
            handler(newValue, oldValue) {
                const list = this.$bus.getItemFileList(this.$bus.fileList, this.dirPath + '/');
                if (this.cacheIndex !== undefined) {
                    this.rightList.splice(this.cacheIndex);
                }
                this.rightList.push(list);
                this.$nextTick(()=> {
                    const dom = this.$refs.rightDir;
                    this.scrollToLeft(dom, Math.max(dom.scrollWidth - dom.offsetWidth, 0));
                });
            },
            deep: true
        }
    },
    methods: {
        scrollToLeft (target, left) {
            let currentNum = target.scrollLeft;
            let t = 0;
            clearInterval(this.timer);
            let dir = 1;
            if (left > currentNum) {
                dir = -1;
            }
            this.timer = setInterval(() => {
                t++;
                currentNum -= (2 * t * dir);
                target.scrollLeft = currentNum;
                if ((dir === 1 && currentNum <= left) || (dir === -1 && currentNum >= left)) {
                    target.scrollLeft = left;
                    clearInterval(this.timer);
                }
            }, 10);
        },
        changePath() {
            this.pathList = this.path.split('/');
        },
        clickFile(item, index) {
            if (this.inputItem) {
                if (this.inputItem.filename !== this.inputItem.inputValue) {
                    console.log('修改名称', this.inputItem.filename, '--->', this.inputItem.inputValue);
                }
                this.inputItem.showInput = false;
                this.inputItem = null;
                this.inputItemList = [];
                return;
            }
            this.pathList.splice(index + 1);
            this.pathList.push(item.filename);
            this.cacheIndex = index;
            if (item.type === 'd') {
                ipcRenderer.send('ssh', 'command:ls', `ls -la ${this.dirPath}`);
            } else  if (item.type === '-') {
                this.rightList.splice(this.cacheIndex);
                const ext = item.path.split('.').slice(-1)[0];
                if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
                    this.$bus.addApp('CbImage', {path: item.path});
                } else {
                    this.$bus.addApp('CbCode', {path: item.path});
                }
            }
        },
        clickFileName(item, index) {
            return (e)=> {
                if (item.type === '-' && this.dirPath !== item.path) {
                    e.stopPropagation();
                    this.pathList.splice(index + 1);
                    this.pathList.push(item.filename);
                    this.cacheIndex = index;
                    this.rightList.splice(this.cacheIndex);
                    return;
                }
                if ((this.dirPath + '/').indexOf(item.path + '/') === 0) {
                    e.stopPropagation();
                    // 编辑文件/文件夹名称
                    // console.log(this.rightList[index - 1]);
                    item.showInput = true;
                    this.inputItem = item;
                    this.inputItemList = this.rightList[index - 1];
                }
            };
        },
        renderContent(h) {
            return (
                <div class="folder-wrap">
                    <div class="left-dir">
                        {
                            this.$bus.fileList.map(item=> {
                                return (
                                    <div class={['item', (this.dirPath + '/').indexOf(item.path + '/') === 0 ? 'active' : '']}
                                        onClick={this.clickFile.bind(this, item, 0)}>
                                        {item.filename}
                                    </div>
                                );
                            })
                        }
                    </div>
                    <div class="right-dir" ref="rightDir">
                        {
                            this.rightList.map((list, index)=> {
                                return (
                                    <div class="list-col">
                                        {
                                            list.map(item=> {
                                                return (
                                                    <div class={['item', (this.dirPath + '/').indexOf(item.path + '/') === 0 ? 'active' : '']}
                                                        onClick={this.clickFile.bind(this, item, index + 1)}>
                                                        {
                                                            item.showInput ? <input v-model={item.inputValue} onClick={e=> e.stopPropagation()} /> : 
                                                                <span onClick={this.clickFileName(item, index + 1)}>
                                                                    {item.filename}
                                                                </span>
                                                        }
                                                    </div>
                                                );
                                            })
                                        }
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
            );
        }
    },
    computed: {
        currentPathName() {
            return this.pathList[this.pathList.length - 1];
        },
        dirPath() {
            return this.pathList.join('/');
        },
        title() {
            return this.currentPathName || '文件夹';
        }
    }
};
</script>
<style lang="less">
.folder-wrap {
    .p-r();
    .wh(100%);
    overflow: hidden;
    background-color: #222222;
    .flex();
    > .left-dir {
        .p-r();
        .wh(180px, 100%);
        .scroll();
        display: inline-block;
        background-color: #303030;
        border-right: 1px solid #000000;
        > .item {
            .wh(100%, 20px);
            .text-line();
            padding: 0 5px;
            box-sizing: border-box;
            color: white;
            cursor: default;
            &.active {
                background-color: #59575a;
            }
        }
    }
    > .right-dir {
        .p-r();
        .wh(calc(100% - 181px), 100%);
        overflow-x: scroll;
        overflow-y: hidden;
        display: -webkit-box;
        > .list-col {
            .p-r();
            .wh(180px, 100%);
            .scroll();
            border-right: 1px solid #000000;
            > .item {
                .wh(100%, 20px);
                .text-line();
                padding: 0 5px;
                box-sizing: border-box;
                color: white;
                cursor: default;
                &.active {
                    background-color: #59575a;
                }
            }
        }
    }
}
</style>