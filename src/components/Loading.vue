<template>
    <div 
        class="project-loading"
        v-show="showLoading"
        :style="{
            'background-color': full ? 'rgba(0, 0, 0, 0.8)' : 'transparent'
        }"
        @click="()=>{}">
        <div class="loading-box" :class="full ? '' : 'bg'">
            <img class="icon rotate" src="@imgs/loading.svg" />
            <p class="text" v-show="text || text === 0">{{text}}</p>
        </div>
    </div>
</template>

<script>
import Vue from 'vue';
export default {
    name: 'project-loading',
    data() {
        return {
            showLoading: false,
            text: '加载中...',
            full: ''
        };
    },
    created() {
        Vue.$loading = Vue.prototype.$loading = {
            show: (text = '加载中...', full = false)=> {
                this.show(text, full);
            },
            hide: ()=> {
                this.hide();
            }
        };
    },
    methods: {
        show(text, full) {
            this.text = text;
            this.full = full;
            this.showLoading = true;
        },
        hide() {
            this.showLoading = false;
        }
    }
};
</script>

<style lang="less">
.project-loading {
    .page(transparent);
    .p-a();
    z-index: 99999999999;
    > .loading-box {
        .center();
        .wh(140px);
        border-radius: 10px;
        .flex-column();
        color: white;
        &.bg {
            background-color: rgba(0, 0, 0, 0.6);
        }
        > .icon {
            .wh(24px);
            .rotate(1.5s);
        }
        > .text {
            font-size: 12px;
            margin-top: 0.3rem;
            width: 80%;
            font-weight: bold;
            text-align: center;
        }
    }
}
</style>
