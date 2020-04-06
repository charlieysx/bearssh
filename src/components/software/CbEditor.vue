<script>
import { ipcRenderer } from 'electron';
import CbApp from '@c/common/CbApp';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.main.js';
import 'monaco-editor/esm/vs/basic-languages/javascript/javascript.contribution';

export default {
    name: 'CbEditor',
    extends: CbApp,
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
        icon: require('@imgs/icon-editor.png'),
        config: {
            path: '',
            readOnly: false,
            width: 800,
            height: 600,
            minWidth: 200,
            minHeight: 200
        }
    },
    data() {
        return {
            content: '',
            item: null,
            pathList: [],
            editorId: '',
            languages: [],
            language: 'plaintext',
            searchLanguage: '',
            showSelectLanguages: false
        };
    },
    mounted() {
        this.monacoInstance = monaco.editor.create(document.getElementById(this.editorId), {
            language: this.language,
            automaticLayout: true,
            theme: 'vs-dark'
        });
    },
    destroyed() {
        this.monacoInstance.dispose();
    },
    created() {
        if (!this.uuid) {
            return;
        }
        this.languages = monaco.languages.getLanguages().map(item=> item.id);
        this.editorId = `monaco-${this.uuid}`;
        if (this.path === '') {
            // 新建
        } else {
            let ext = this.path.split('.').slice(-1)[0];
            if (ext === 'js') {
                ext = 'javascript';
            }
            if (this.languages.find(item=> item === ext)) {
                this.language = ext;
            } else {
                this.language = 'plaintext';
            }
            this.changePath();
            this.$ssh.readFile(this.path)
                .then(data=> {
                    this.content = data;
                    this.monacoInstance.setValue(data);
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
        selectLanguage(language) {
            if (this.language !== language) {
                this.language = language;
                monaco.editor.setModelLanguage(this.monacoInstance.getModel(), this.language);
            }
            this.showSelectLanguages = false;
            this.searchLanguage = '';
        },
        getSelectLanguageWrap() {
            if (!this.showSelectLanguages) {
                return '';
            }
            return <div class="input-select-wrap">
                <input
                    ref="searchLanguageInput"
                    class="input-wrap"
                    v-model={this.searchLanguage}
                    onKeyup={(e)=> {
                        if (e.keyCode === 27) { // 按下esc键
                            this.showSelectLanguages = false;
                            this.searchLanguage = '';
                        } else if (e.keyCode === 13) { // 按下回车键
                            const language = this.filterSearchLanguages.find(item=> item === this.searchLanguage);
                            if (language) {
                                this.selectLanguage(language);
                            }
                        }
                    }} />
                <ul class="static-list">
                    <li class="item" onClick={this.selectLanguage.bind(this, this.language)}>当前：{this.language}</li>
                </ul>
                <ul class="scroll-list">
                    {
                        this.filterSearchLanguages.map(language=> {
                            return <li
                                class={["item", this.searchLanguage === language ? 'active' : '']}
                                onClick={this.selectLanguage.bind(this, language)}
                                domPropsInnerHTML={language.split(this.searchLanguage).join(`<span style="color: red;">${this.searchLanguage}</span>`)}
                            ></li>;
                        })
                    }
                </ul>
            </div>;
        },
        renderContent(h) {
            return (
                <div class="editor-wrap" v-loading={this.loading}>
                    <div id={this.editorId} 
                        style={{
                            width: this.contentWidth + 'px',
                            height: this.contentHeight - 25 + 'px'
                        }}
                        onClick={()=> {
                            if (this.showSelectLanguages) {
                                this.showSelectLanguages = false;
                                this.searchLanguage = '';
                            }
                        }}>
                    </div>
                    {this.getSelectLanguageWrap()}
                    <div class="editor-bottom">
                        <div class="item clickable" onClick={()=> {
                            this.showSelectLanguages = true;
                            this.$nextTick(()=> {
                                this.$refs.searchLanguageInput.focus();
                            });
                        }}>{this.language}</div>
                    </div>
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
        },
        filterSearchLanguages() {
            return this.languages.filter(item=> item.includes(this.searchLanguage));
        }
    }
};
</script>
<style lang="less">
.editor-wrap {
    .p-r();
    .wh(calc(100% - 1.5px));
    margin: 1.5px;
    margin-top: 0px;
    > .editor-bottom {
        .wh(100%, 24px);
        background-color: #333334;
        border-top: 1px solid #262626;
        color: white;
        .flex(flex-end);
        > .item {
            font-size: 12px;
            line-height: 1;
            height: 24px;
            box-sizing: border-box;
            padding: 6px 5px;
            &.clickable {
                cursor: default;
                &:hover {
                    background-color: #444445;
                }
            }
        }
    }
    > .input-select-wrap {
        .p-a();
        width: 50%;
        max-height: 50%;
        z-index: 10;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        background-color: #333334;
        box-shadow: 0px 0px 15px 0px #000000;
        box-sizing: border-box;
        .flex-column();
        > .input-wrap {
            .p-r();
            width: calc(100% - 10px);
            font-size: 14px;
            background-color: #3c3c3c;
            border: 1px solid #222223;
            color: white;
            margin: 5px;
            padding: 5px;
            height: 24px;
            line-height: 14px;
            box-sizing: border-box;
            &:focus {
                outline: none;
            }
        }
        > .static-list {
            .p-r();
            width: 100%;
            border-top: 1px solid #999999;
            > .item {
                box-sizing: border-box;
                padding: 5px;
                font-size: 14px;
                line-height: 14px;
                color: white;
                cursor: default;
                &:hover {
                    background-color: #444445;
                }
            }
        }
        > .scroll-list {
            .p-r();
            width: 100%;
            flex: 1;
            .scroll();
            border-top: 1px solid #999999;
            > .item {
                box-sizing: border-box;
                padding: 5px;
                font-size: 14px;
                line-height: 14px;
                color: white;
                cursor: default;
                &:hover {
                    background-color: #444445;
                }
                &.active {
                    background-color: #444445;
                }
            }
        }
    }
}
</style>