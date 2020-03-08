<script>
import { codemirror } from 'vue-codemirror-lite';
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/vue/vue');
require('codemirror/addon/hint/show-hint.js');
require('codemirror/addon/hint/show-hint.css');
require('codemirror/addon/hint/javascript-hint.js');
import { ipcRenderer } from 'electron';
export default {
    name: 'CbCode',
    components: {
        Codemirror: codemirror
    },
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
        appName: 'CbCode',
        name: '编辑器',
        icon: require('@imgs/icon-folder.png'),
        base: {
            width: 600,
            height: 500
        },
        config: {
            path: '',
            editable: false
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
        if (this.config === undefined) {
            return;
        }
        if (this.config.path === '') {
            this.config.editable = true;
            // 新建
        } else {
            const ext = this.config.path.split('.').slice(-1)[0];
            if (ext === 'js') {
                this.mode = 'javascript';
            } else if (ext === 'vue') {
                this.mode = 'vue';
            }
            this.changePath();
            ipcRenderer.send('ssh', 'command:cat', `cat ${this.config.path}`);
            this.$bus.$on(`cat ${this.config.path}`, this.onFileContent);
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
            this.$bus.$off(`cat ${this.config.path}`, this.onFileContent);
            this.content = data.content;
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
                title={this.currentPathName || '编辑器'}
                class="code-wrap"
                uuid={this.uuid}
                opt={this.base}
                onClose={this.onClose}
                scopedSlots={{
                    content: ()=> {
                        return <div class="content">
                            <Codemirror
                                v-model={this.content}>
                            </Codemirror>
                        </div>;
                    }
                }}>
            </CbApp>
        );
    }
};
</script>
<style lang="less">
.code-wrap {
    .p-a();
    .title {
        width: 100%;
        height: 20px;
    }
    .content {
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
}
</style>