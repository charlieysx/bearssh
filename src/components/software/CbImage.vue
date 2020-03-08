<script>
import { ipcRenderer } from 'electron';
export default {
    name: 'CbImage',
    props: {
        uuid: {
            require: true
        },
        base: {
            type: Object
        },
        config: {
            type: Object
        }
    },
    setting: {
        extends: 'CbApp',
        appName: 'CbImage',
        name: '图片预览',
        icon: require('@imgs/icon-folder.png'),
        base: {
            width: 500,
            height: 500
        },
        config: {
            path: ''
        }
    },
    data() {
        return {
            base64: '',
            pathList: []
        };
    },
    created() {
        if (this.config === undefined) {
            return;
        }
        if (this.config.path === '') {
            // 新建
        } else {
            this.changePath();
            const ext = this.config.path.split('.').slice(-1)[0];
            if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
                this.imgType = ext;
                this.loading = true;
                ipcRenderer.send('ssh', 'command:xxd', `xxd -b ${this.config.path}`);
                this.$bus.$on(`xxd -b ${this.config.path}`, this.onFileContent);
            } else if (ext === 'svg') {
                this.imgType = 'svg';
                this.getContent();
            }
        }
    },
    watch: {
        '$bus.fileList': {
            handler(newValue, oldValue) {
            },
            deep: true
        }
    },
    methods: {
        onClose(next) {
            next();
        },
        changePath() {
            this.pathList = this.config.path.split('/');
        },
        onFileContent(data) {
            this.loading = false;
            this.$bus.$off(`xxd -b ${this.config.path}`, this.onFileContent);
            this.base64 = data.content;
            this.item = data.item;
        }
    },
    computed: {
        currentPathName() {
            return this.pathList[this.pathList.length - 1];
        }
    },
    render(h) {
        return (
            <CbApp 
                title={this.currentPathName || '图片预览'}
                class="image-wrap"
                uuid={this.uuid}
                opt={this.base}
                onClose={this.onClose}
                scopedSlots={{
                    content: ()=> {
                        return <div class="content" v-loading={this.loading}>
                            {
                                this.base64 && this.imgType !== 'svg' && <img class="preImg" src={this.base64} />
                            }
                            {
                                this.base64 && this.imgType === 'svg' && <div class="preImg" id="svg" domPropsInnerHTML={this.base64}></div>
                            }
                        </div>;
                    }
                }}>
            </CbApp>
        );
    }
};
</script>
<style lang="less">
.image-wrap {
    .p-a();
    .title {
        width: 100%;
        height: 20px;
    }
    .content {
        .p-r();
        .wh(calc(100% - 3px));
        margin: 1.5px;
        // background-color: #323232;
        font-size: 12px;
        overflow: hidden;
        .flex();
        > .preImg {
            .wh(100%);
            object-fit: contain;
        }
    }
}
</style>