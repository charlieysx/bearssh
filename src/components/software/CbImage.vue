<script>
import { ipcRenderer } from 'electron';
import CbApp from '@c/common/CbApp';
export default {
    name: 'CbImage',
    extends: CbApp,
    setting: {
        appName: 'CbImage',
        name: '图片预览',
        icon: require('@imgs/icon-folder.png'),
        config: {
            path: '',
            width: 500,
            height: 500
        }
    },
    data() {
        return {
            base64: '',
            pathList: []
        };
    },
    created() {
        if (!this.uuid) {
            return;
        }
        if (this.path === '') {
            // 新建
        } else {
            this.changePath();
            const ext = this.path.split('.').slice(-1)[0];
            if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
                this.imgType = ext;
                this.loading = true;
                ipcRenderer.send('ssh', 'command:xxd', `xxd -b ${this.path}`);
                this.$bus.$on(`xxd -b ${this.path}`, this.onFileContent);
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
        changePath() {
            this.pathList = this.path.split('/');
        },
        onFileContent(data) {
            this.loading = false;
            this.$bus.$off(`xxd -b ${this.path}`, this.onFileContent);
            this.base64 = data.content;
            this.item = data.item;
        },
        renderContent(h) {
            return (
                <div class="image-wrap" v-loading={this.loading}>
                    {this.base64 && <img class="preImg" src={this.base64} />}
                </div>
            );
        }
    },
    computed: {
        currentPathName() {
            return this.pathList[this.pathList.length - 1];
        },
        title() {
            return this.currentPathName || '图片预览';
        }
    }
};
</script>
<style lang="less">
.image-wrap {
    .p-r();
    .wh(calc(100% - 3px));
    margin: 1.5px;
    font-size: 12px;
    overflow: hidden;
    .flex();
    > .preImg {
        .wh(100%);
        object-fit: contain;
    }
}
</style>