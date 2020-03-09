<script>
import { ipcRenderer } from 'electron';
import CbApp from '../common/CbApp';
export default {
    name: 'CbImage',
    extends: CbApp,
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
        appName: 'CbTest',
        name: '图片预览',
        icon: require('@imgs/icon-folder.png'),
        base: {
            width: 500,
            height: 500
        },
        config: {
            path: ''
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
        onClose(next) {
            next();
        }
    },
    computed: {
    },
    render(h) {
        return (
            <div></div>
        );
    }
};
</script>
<style lang="less">
.image-wrap {
    .p-a();
    .title {
        width: 100%;
        height: 20px;
    }
    .content {
        .p-r();
        .wh(calc(100% - 3px));
        margin: 1.5px;
        // background-color: #323232;
        font-size: 12px;
        overflow: hidden;
        .flex();
        > .preImg {
            .wh(100%);
            object-fit: contain;
        }
    }
}
</style>