<script>
import { codemirror } from 'vue-codemirror-lite';
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/vue/vue');
require('codemirror/addon/hint/show-hint.js');
require('codemirror/addon/hint/show-hint.css');
require('codemirror/addon/hint/javascript-hint.js');
import { ipcRenderer } from 'electron';
import CbApp from '@c/common/CbApp';
export default {
    name: 'CbCode',
    extends: CbApp,
    props: {
        editable: {
            type: Boolean,
            default: true
        }
    },
    components: {
        Codemirror: codemirror
    },
    setting: {
        appName: 'CbCode',
        sign: '3',
        name: '编辑器',
        icon: require('@imgs/icon-folder.png'),
        config: {
            path: '',
            editable: true,
            width: 600,
            height: 500
        }
    },
    data() {
        return {
            mode: '',
            content: '',
            item: null,
            pathList: []
        };
    },
    created() {
        if (!this.uuid) {
            return;
        }
        if (this.path === '') {
            this.editable = true;
            // 新建
        } else {
            const ext = this.path.split('.').slice(-1)[0];
            if (ext === 'js') {
                this.mode = 'javascript';
            } else if (ext === 'vue') {
                this.mode = 'vue';
            }
            this.changePath();
            this.$ssh.readFile(this.path)
                .then(data=> {
                    this.content = data;
                    this.loading = false;
                })
                .catch(e=> {
                    this.$message.error('文件加载失败');
                    console.log(e);
                });
        }
    },
    methods: {
        changePath() {
            this.pathList = this.path.split('/');
        },
        renderContent(h) {
            return (
                <div class="code-wrap">
                    <Codemirror
                        v-model={this.content}>
                    </Codemirror>
                </div>
            );
        }
    },
    computed: {
        currentPathName() {
            return this.pathList[this.pathList.length - 1];
        },
        title() {
            return this.currentPathName || '编辑器';
        }
    }
};
</script>
<style lang="less">
.code-wrap {
    .p-r();
    .wh(calc(100% - 3px));
    margin: 1.5px;
    background-color: white;
    .scroll();
    font-size: 12px;
}
.vue-codemirror-wrap {
    .wh(100%);
}
.CodeMirror {
    .wh(100%);
}
</style>