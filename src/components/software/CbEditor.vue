<script>
import { ipcRenderer } from 'electron';
import CbApp from '@c/common/CbApp';
import Ace from '@c/ace/Ace';

export default {
    name: 'CbEditor',
    extends: CbApp,
    components: {
        Ace
    },
    props: {
        editable: {
            type: Boolean,
            default: true
        }
    },
    setting: {
        appName: 'CbEditor',
        sign: '3',
        name: '编辑器',
        icon: require('@imgs/icon-folder.png'),
        config: {
            path: '',
            readOnly: false,
            width: 800,
            height: 600
        }
    },
    data() {
        return {
            mode: 'text',
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
            // 新建
        } else {
            const ext = this.path.split('.').slice(-1)[0];
            if (ext === 'js') {
                this.mode = 'javascript';
            } else if (ext === 'vue') {
                this.mode = 'vue';
            }
            this.changePath();
            this.loading = true;
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
    watch: {
        innerWidth() {
            if (this.editor) {
                this.editor.resize();
            }
        },
        innerHeight() {
            if (this.editor) {
                this.editor.resize();
            }
        }
    },
    methods: {
        changePath() {
            this.pathList = this.path.split('/');
        },
        renderContent(h) {
            return (
                <div class="editor-wrap" v-loading={this.loading}>
                    <Ace
                        editorName={`editor-${this.uuid}`}
                        className="cb-editor"
                        mode={this.mode}
                        theme="monokai"
                        readOnly={this.readOnly}
                        wrapEnabled={true}
                        enableBasicAutocompletion={true}
                        enableLiveAutocompletion={true}
                        enableSnippets={true}
                        width={this.innerWidth}
                        height={this.innerHeight}
                        editorProps={{$blockScrolling: Infinity}}
                        v-model={this.content} />
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
.editor-wrap {
    .p-r();
    .wh(calc(100% - 3px));
    margin: 1.5px;
    > .cb-editor {
        .wh(100%);
    }
}
</style>