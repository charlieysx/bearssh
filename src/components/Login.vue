<script>
import { ipcRenderer, dialog } from 'electron';
const Client = require('ssh2').Client;
const conn = new Client();
export default {
    name: 'Login',
    data() {
        return {
            host: '',
            port: '22',
            username: '',
            password: '',
            autoLogin: false
        };
    },
    created() {
        this.host = this.$storage.load('host', '');
        this.port = this.$storage.load('port', '22');
        this.username = this.$storage.load('username', '');
        this.password = this.$storage.load('password', '');
        this.autoLogin = this.$storage.load('autoLogin', false);
    },
    mounted() {
        if (this.autoLogin) {
            this.connect(true);
        }
    },
    methods: {
        connect(auto = false) {
            if (!this.host) {
                return !auto && this.$message.error('请输入服务器地址');
            }
            if (!this.port) {
                return !auto && this.$message.error('请输入端口号');
            }
            if (!this.username) {
                return !auto && this.$message.error('请输入用户名');
            }
            if (!this.password) {
                return !auto && this.$message.error('请输入密码');
            }
            this.$loading.show('登录中...', true);
            this.$ssh.connect({
                host: this.host,
                port: this.port,
                username: this.username,
                password: this.password
            }).then(res=> {
                this.$storage.save('host', this.host);
                this.$storage.save('username', this.username);
                this.$storage.save('password', this.password);
                this.$storage.save('port', this.port);
                this.$storage.save('autoLogin', this.autoLogin);
                this.$message.success('连接成功');
                this.$bus.hadLogin = true;
            }).catch(e=> {
                console.log('连接失败', e);
                this.$storage.remove('password');
                this.$message.error('连接失败');
            }).finally(()=> {
                this.$loading.hide();
            });
        }
    },
    render(h) {
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
                    <LabelCheckBox
                        class="item"
                        v-model={this.autoLogin}
                        config={{
                            label: "自动登录",
                            labelWidth: '80px'
                        }} />
                    <el-button onClick={this.connect.bind(this, false)}>登录</el-button>
                </div>
            </div>
        );
    },
};
</script>
<style lang="less">
.login-wrap {
    .page(white);
    .p-f();
    left: 0;
    right: 0;
    z-index: @login;
    box-sizing: border-box;
    > .content {
        padding: 20px;
        background-color: white;
        border-radius: 10px;
        width: 400px;
        .center();
        .flex-column();
        box-shadow: 0px 0px 12px -5px rgba(0, 0, 0, 0.3);
        > .item {
            width: 100%;
            margin-bottom: 10px;
        }
    }
}
</style>