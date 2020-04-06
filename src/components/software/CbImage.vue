<script>
import { ipcRenderer } from 'electron';
import CbApp from '@c/common/CbApp';
export default {
    name: 'CbImage',
    extends: CbApp,
    setting: {
        appName: 'CbImage',
        sign: '2',
        name: '图片预览',
        icon: require('@imgs/icon-image.png'),
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
            // if (['png', 'jpg', 'jpeg', 'gif', 'ico'].includes(ext)) {
            this.imgType = ext;
            this.loading = true;
            this.$ssh.readFile(this.path, '')
                .then(data=> {
                    let binary = '';
                    let bytes = new Uint8Array(data);
                    for (let len = bytes.byteLength, i = 0; i < len; ++i) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    this.base64 = `data:image/${ext};base64,${window.btoa(binary)}`;
                    this.loading = false;
                })
                .catch(e=> {
                    this.$message.error('图片加载失败');
                    console.log(e);
                });
            // }
        }
    },
    methods: {
        changePath() {
            this.pathList = this.path.split('/');
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