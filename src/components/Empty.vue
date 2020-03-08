<template>
    <div class="empty">
        <img class="icon" :src="icon" v-if="icon">
        <div class="tip" v-html="tip">
        </div>
    </div>
</template>

<script>
export default {
    name: 'empty',
    meta: {
        cn: '无数据'
    },
    props: {
        tip: {
            default: '无数据'
        },
        icon: {
            default: require('@imgs/icon_nodata.svg')
        }
    }
};
</script>
<style lang="less">
.empty {
    .p-r();
    .wh(100%);
    min-height: 300px;
    .flex-column();
    > .tip {
        color: #999999;
    }
    > .icon {
        .max-wh(200px);
        margin: 12px 0;
    }
}
</style>