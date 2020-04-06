<script>
import { ipcRenderer } from 'electron';
import CbApp from '@c/common/CbApp';

export default {
    name: 'CbFolder',
    extends: CbApp,
    setting: {
        appName: 'CbFolder',
        sign: '1',
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
            rightClickFilePath: ''
        };
    },
    created() {
        if (!this.uuid) {
            return;
        }
        this.changePath();
        this.readdir();
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
        readdir() {
            this.$ssh.readdir(this.dirPath)
                .then(res=> {
                    const list = this.$bus.saveFileList(this.dirPath, res);
                    if (this.dirPath === '/') {
                        return;
                    }
                    if (this.cacheIndex !== undefined) {
                        this.rightList.splice(this.cacheIndex);
                    }
                    this.rightList.push(list);
                    this.$nextTick(()=> {
                        const dom = this.$refs.rightDir;
                        this.scrollToLeft(dom, Math.max(dom.scrollWidth - dom.offsetWidth, 0));
                    });
                })
                .catch(e=> {
                    this.$message.error('该文件不是目录');
                });
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
            this.rightList.splice(this.cacheIndex);
            if (item.type === 'd' || item.type === 'l') {
                this.readdir();
            }
        },
        dblClickFile(item, index) {
            if (item.type === '-') {
                const ext = item.path.split('.').slice(-1)[0];
                let config = '';
                if (['png', 'jpg', 'jpeg', 'gif', 'ico'].includes(ext)) {
                    config = this.$bus.getAppConfig('CbImage', '2');
                    config && this.$bus.addApp(config, {path: item.path});
                } else if(['mp3', 'mp4', 'avi', 'zip', 'ttf', 'otf'].includes(ext)) {
                    this.$message.error('暂不支持打开该文件');
                } else {
                    config = this.$bus.getAppConfig('CbEditor', '3');
                    config && this.$bus.addApp(config, {path: item.path});
                }
            }
        },
        clickFileName(item, index) {
            return (e)=> {
                // todo 做文件名修改
                // if (item.type === '-' && this.dirPath !== item.path) {
                //     e.stopPropagation();
                //     this.pathList.splice(index + 1);
                //     this.pathList.push(item.filename);
                //     this.cacheIndex = index;
                //     this.rightList.splice(this.cacheIndex);
                //     return;
                // }
                // if ((this.dirPath + '/').indexOf(item.path + '/') === 0) {
                //     e.stopPropagation();
                //     // 编辑文件/文件夹名称
                //     // console.log(this.rightList[index - 1]);
                //     item.showInput = true;
                //     this.inputItem = item;
                //     this.inputItemList = this.rightList[index - 1];
                // }
            };
        },
        onContextMenuClick(e, file, index) {
            e.stopPropagation();
            e.preventDefault();
            this.rightClickFilePath = [...this.pathList.slice(0, index + 1), file.filename].join('/');
            this.$rightMenu.show(e.pageX, e.pageY, [
                {
                    type: 'download',
                    text: '下载'
                }
            ], (item)=> {
                if (item.type === 'download') {
                    this.$ssh.download(file)
                        .then(res=> {
                            this.$message.success('下载完成');
                        })
                        .catch(e=> {
                            console.log(e);
                            this.$message.error('下载失败');
                        });
                }
            });
        },
        __onMouseDown(e) {
            this.hideMenu();
        },
        hideMenu() {
            if (this.rightClickFilePath === '') {
                return '';
            }
            this.rightClickFilePath = '';
            this.$rightMenu.close();
        },
        throttle(func, delay) {            
            let prev = Date.now();            
            return function() {                
                const context = this;                
                const args = arguments;                
                const now = Date.now();                
                if (now - prev >= delay) {                    
                    func.apply(context, args);                    
                    prev = Date.now();                
                }            
            };        
        },
        renderItem(item, index) {
            return (
                <div class={[
                    'item',
                    (this.dirPath + '/').indexOf(item.path + '/') === 0 ? 'active' : '',
                    `file-type-${item.type}`,
                    item.isHidden ? 'file-type-hidden' : '',
                    this.rightClickFilePath === item.path ? 'show-border' : ''
                ]}
                onContextmenu={(e)=> this.onContextMenuClick(e, item, index)}
                onDblclick={this.dblClickFile.bind(this, item, index)}
                onClick={this.throttle(this.clickFile.bind(this, item, index), 300)}>
                    <img class="icon" src={item.icon} />
                    <div class="name">
                        {
                            item.showInput ? 
                                <input v-model={item.inputValue} onClick={e=> e.stopPropagation()} /> : 
                                <span onClick={this.clickFileName(item, index)}>
                                    {item.filename}
                                </span>
                        }
                    </div>
                </div>
            );
        },
        renderContent(h) {
            return (
                <div class="folder-wrap" onClick={this.hideMenu.bind(this)}>
                    <div class="left-dir">
                        {this.$bus.file.list.map(item=> {
                            return this.renderItem(item, 0);
                        })}
                    </div>
                    <div class="right-dir" ref="rightDir">
                        {this.rightList.map((list, index)=> {
                            return (
                                <div class="list-col">
                                    {list.map(item=> {
                                        return this.renderItem(item, index + 1);
                                    })}
                                </div>
                            );
                        })}
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
        }
    }
    >.right-dir> .list-col,> .left-dir {
        > .item {
            .wh(100%, 20px);
            .text-line();
            padding: 0 5px;
            box-sizing: border-box;
            color: white;
            cursor: default;
            .flex(flex-start);
            font-size: 16px;
            line-height: 16px;
            &.active {
                background-color: #59575a;
            }
            >.icon {
                .wh(15px);
                margin-right: 5px;
            }
            > .name {
                flex: 1;
                .text-line();
            }
        }
        > .show-border {
            border: 1px solid #ffffff;
        }
        > .file-type {
            &-l {
                color: #73f9fd;
            }
            &-hidden {
                color: #5e5d5c;
            }
        }
    }
}
</style>