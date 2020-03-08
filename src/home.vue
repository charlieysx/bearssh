<script>
const { ipcRenderer } = require('electron');
export default {
    name: 'index',
    meta: {
        cn: 'index'
    },
    data () {
        return {
            host: 'codebear.cn',
            username: 'root',
            password: 'Ysx5201314',
            showLogin: true,
            fileList: [],
            fileContent: '',
            showList: false,
            showContent: false,
            pathList: [],
            img: '',
            imgType: 'svg',
        };
    },
    computed: {
        dirPath() {
            return '/' + this.pathList.join('/');
        }
    },
    created () {
        ipcRenderer.on('ssh', (sender, {type, data})=> {
            // console.log(data);
            switch(type) {
            case 'connect':
                if (data === 'success') {
                    this.showLogin = false;
                    this.$message.success('连接成功');
                    this.getDir();
                } else {
                    this.$message.error('连接失败');
                }
                break;
            case 'command:ls':
                this.parseFile(data);
                break;
            case 'command:cat':
                this.parseFileContent(data);
                break;
            case 'command:xxd':
                this.parseImg(data);
                break;
            case 'command:echo':
                console.log(data);
                break;
            }
            this.$loading.hide();
        });
    },
    methods: {
        parseFile(data) {
            this.fileList = data.split('\n')
                .slice(3)
                .map(item=> {
                    const type = item[0];
                    const filename = item.split(' ').slice(-1)[0];
                    return {
                        type,
                        filename
                    };
                });
            this.fileList.unshift({
                type: 'back',
                filename: '返回上一级目录'
            });
            this.fileList.unshift({
                type: 'create',
                filename: '创建文件'
            });
            this.showContent = false;
            this.showList = true;
        },
        parseFileContent(data) {
            const ext = this.dirPath.split('.').slice(-1)[0];
            if (ext === 'svg') {
                this.imgType = 'svg';
                this.img = data;
                this.showList = false;
                this.showContent = true;
                this.$nextTick(()=> {
                    const svg = document.getElementsByTagName('svg');
                    svg[0].setAttribute('width', 100);
                    svg[0].setAttribute('height', 100);
                });
                return;
            }

            this.img = '';
            this.fileContent = data;
            this.cacheContent = data.replace(/"/g, '\\"').replace(/\$/g, '\\$');
            this.showList = false;
            this.showContent = true;
        },
        parseImg(data) {
            const list = data.split('\n').map(item=> {
                return item.split(' ').slice(1, 7).map(item=> parseInt(+item, 2));
            }).reduce((pre, cur)=> {
                pre.push(...cur);
                return pre;
            }, []);
            let binary = '';
            let bytes = new Uint8Array(list);
            for (let len = bytes.byteLength, i = 0; i < len; ++i) {
                binary += String.fromCharCode(bytes[i]);
            }
            this.fileContent = '';
            this.img = `data:image/${this.imgType};base64,${window.btoa(binary)}`;
            this.showList = false;
            this.showContent = true;
            this.$loading.hide();
        },
        getDir() {
            ipcRenderer.send('ssh', 'command:ls', `ls -la ${this.dirPath}`);
        },
        getContent() {
            ipcRenderer.send('ssh', 'command:cat', `cat ${this.dirPath}`);
        },
        getImg() {
            this.$loading.show();
            ipcRenderer.send('ssh', 'command:xxd', `xxd -b ${this.dirPath}`);
        },
        connect() {
            if (!this.host) {
                return this.$message.error('请输入服务器地址');
            }
            if (!this.username) {
                return this.$message.error('请输入用户名');
            }
            if (!this.password) {
                return this.$message.error('请输入密码');
            }
            this.$loading.show();
            ipcRenderer.send('ssh', 'connect', {
                host: this.host,
                username: this.username,
                password: this.password
            });
        },
        getLoginWrap() {
            if (!this.showLogin) {
                return '';
            }
            return (
                <div class="login-wrap">
                    <div class="content">
                        <LabelInput
                            class="item"
                            v-model={this.host}
                            config={{
                                label: "服务器地址",
                                labelWidth: '80px'
                            }} />
                        <LabelInput
                            class="item"
                            v-model={this.username}
                            config={{
                                label: "用户名",
                                labelWidth: '80px'
                            }} />
                        <LabelInput
                            class="item"
                            v-model={this.password}
                            config={{
                                label: "密码",
                                labelWidth: '80px',
                                type: 'password'
                            }} />
                        <el-button onClick={this.connect}>确定</el-button>
                    </div>
                </div>
            );
        },
        toDir(item) {
            if (item.type === 'd') {
                this.pathList.push(item.filename);
                this.getDir();
            } else if (item.type === '-') {
                this.pathList.push(item.filename);
                const ext = item.filename.split('.').slice(-1)[0];
                if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) {
                    this.imgType = ext;
                    this.getImg();
                } else {
                    this.getContent();
                }
            } else if (item.type === 'back') {
                if (this.pathList.length > 0) {
                    this.pathList.pop();
                    this.getDir();
                }
            } else if (item.type === 'create') {
                ipcRenderer.send('ssh', 'command:echo', `echo "${this.cacheContent}" > ${this.dirPath}/test.conf`);
            }
        },
        test(item) {
            console.log('double click');
        }
    },
    render(h) {
        const type = {
            'd': '/',
            '-': '',
            'l': '',
            'back': ''
        };
        return (
            <div class="page-home">
                {this.getLoginWrap()}
                {
                    this.showList &&
                    <div class="dir-list">
                        {this.fileList.map(item=> {
                            return <div class="line" onDblclick={this.test.bind(this, item)} onClick={this.toDir.bind(this, item)}>{item.filename}{type[item.type]}</div>;
                        })}
                    </div>
                }
                {
                    this.showContent &&
                    <div class="content-wrap">
                        <div class="back" onClick={this.toDir.bind(this, {type: 'back'})}>返回   {this.dirPath}</div>
                        {
                            this.fileContent && 
                            <pre class="content">
                                {this.fileContent}
                            </pre>
                        }
                        {
                            this.img && this.imgType !== 'svg' &&
                            <img class="preImg" src={this.img} />
                        }
                        {
                            this.img && this.imgType === 'svg' &&
                            <div class="preImg" id="svg" domPropsInnerHTML={this.img}></div>
                        }
                    </div>
                }
            </div>
        );
    },
};
</script>

<style lang="less">
.page-home {
    .page();
    .p-r();
    height: calc(100% - @titleHeight);
    margin-top: @titleHeight;
    font-size: 16px;
    > .login-wrap {
        .page(rgba(0, 0, 0, 0.6));
        .p-a();
        top: -@titleHeight;
        left: 0;
        box-sizing: border-box;
        > .content {
            padding: 20px;
            background-color: white;
            border-radius: 10px;
            .center();
            .flex-column();
            > .item {
                margin-bottom: 4px;
            }
        }
    }
    > .dir-list {
        .p-a();
        top: 0;
        left: 0;
        height: 100%;
        .scroll();
        > .line {
            margin: 5px;
            width: 100vw;
            cursor: pointer;
        }
    }
    > .content-wrap {
        .p-a();
        top: 0;
        left: 0;
        .flex-column('flex-start', 'flex-start');
        width: 100vw;
        height: 100%;
        > .back {
            margin: 5px;
            height: 30px;
            cursor: pointer;
        }
        > .content {
            flex: 1;
            width: 100vw;
            font-size: 12px;
            .scroll();
        }
        > .preImg {
            .p-a();
            .max-wh(400);
            .min-wh(100);
            .center();
            background-color: rgba(0, 0, 0, 0.6);
        }
    }
}
</style>