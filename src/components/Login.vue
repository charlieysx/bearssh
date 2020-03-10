<script>
import { ipcRenderer } from 'electron';
export default {
    name: 'Login',
    data() {
        return {
            host: 'codebear.cn',
            username: '',
            password: ''
        };
    },
    created() {
        ipcRenderer.on('ssh', this.sshListener);
    },
    mounted() {
        this.connect();
    },
    beforeDestroy() {
        ipcRenderer.off('ssh', this.sshListener);
    },
    methods: {
        sshListener(sender, {type, data}) {
            // console.log(data);
            switch(type) {
            case 'connect':
                if (data === 'success') {
                    this.$message.success('连接成功');
                    this.$bus.hadLogin = true;
                } else {
                    this.$message.error('连接失败');
                }
                break;
            }
            this.$loading.hide();
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
                    <el-button onClick={this.connect}>登录</el-button>
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