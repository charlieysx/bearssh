<script>
import { ipcRenderer } from 'electron';
import CbApp from '@c/common/CbApp';
export default {
    name: 'CbTest',
    extends: CbApp,
    setting: {
        appName: 'CbTest',
        sign: '4',
        name: '测试',
        icon: require('@imgs/icon-folder.png'),
        config: {
            path: '',
            width: 500,
            height: 500
        }
    },
    data() {
        return {
        };
    },
    created() {
    },
    watch: {
    },
    methods: {
        renderSubTitle(h) {
            return <div class="test-wrap" style="position: relative;">
                自定义头部子标题
            </div>;
        },
        renderContent(h) {
            return <div class="test-wrap">
                内容
            </div>;
        }
    },
    computed: {
    }
};
</script>
<style lang="less">
.test-wrap {
    .p-a();
    color: white;
}
</style>