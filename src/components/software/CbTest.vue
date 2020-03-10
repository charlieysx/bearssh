<script>
import { ipcRenderer } from 'electron';
import CbApp from '../common/CbApp2';
export default {
    name: 'CbImage',
    extends: CbApp,
    setting: {
        appName: 'CbTest',
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
        async beforeClose() {
            console.log('触发关闭2');
        },
        renderSubTitle(h) {
            return <div class="test-wrap" style="position: relative;">
                test
            </div>;
        },
        renderContent(h) {
            return <div class="test-wrap">
                test
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