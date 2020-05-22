<script>
const { ipcRenderer } = require('electron');
export default {
    name: 'index',
    meta: {
        cn: 'index'
    },
    data () {
        return {
            host: '',
            username: '',
            password: '',
            showLogin: true
        };
    },
    created () {
    },
    methods: {
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