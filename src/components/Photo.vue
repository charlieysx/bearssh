<template>
    <transition name="fade-photo">
        <div class="photo-wrap" v-show="show">
            <img
                class="img"
                :src="src"
                :style="{
                    width: `${width}px`,
                    height: `${height}px`,
                    top: `${top}px`,
                    left: `${left}px`
                }"
                @click="close" />
        </div>
    </transition>
</template>

<script>
import Vue from 'vue';
export default {
    name: 'photo-wrap',
    meta: {
        cn: '查看大图'
    },
    data() {
        return {
            show: false,
            src: '',
            width: 0,
            height: 0,
            left: 0,
            top: 0
        };
    },
    created () {
        this.init = {
            width: 0,
            height: 0,
            left: 0,
            top: 0
        };
        Vue.$photo = Vue.prototype.$photo = {
            show: (opt) => {
                const option = Object.assign({
                    src: '',
                    bg: 'rgba(0, 0, 0, 0.6)',
                    elem: null,
                    padding: 40
                }, opt);
                if (!option.src || !option.elem) {
                    console.error('参数错误');
                    return;
                }
                this.showPhoto(option);
            }
        };
    },
    methods: {
        showPhoto(option) {
            this.src = option.src;
            const rect = this.calc(option.elem);
            this.width = this.init.width = rect.width;
            this.height = this.init.height = rect.height;
            this.left = this.init.left = rect.left;
            this.top = this.init.top = rect.top;
            const mw = window.innerWidth - option.padding * 2;
            const mh = window.innerHeight - option.padding * 2;
            const scale = Math.min(mw / rect.width, mh / rect.height);
            const width = rect.width * scale;
            const height = rect.height * scale;
            const left = (mw - width) / 2 + option.padding;
            const top = (mh - height) / 2 + option.padding;
            this.show = true;
            this.$func.wait(100).then(()=> {
                this.width = width;
                this.height = height;
                this.left = left;
                this.top = top;
            });
        },
        close() {
            this.width = this.init.width;
            this.height = this.init.height;
            this.left = this.init.left;
            this.top = this.init.top;
            this.$func.wait(500).then(()=> {
                this.show = false;
                this.$func.wait(500).then(()=> {
                    this.width = this.init.width = 0;
                    this.height = this.init.height = 0;
                    this.left = this.init.left = 0;
                    this.top = this.init.top = 0;
                });
            });
        },
        calc(elem) {
            const rect = elem.getBoundingClientRect();
            return {
                width: rect.width,
                height: rect.height,
                top: rect.top,
                left: rect.left
            };
        }
    },
};
</script>

<style lang="less">
.photo-wrap {
    .page(rgba(0, 0, 0, 0.6));
    z-index: @page-photo;
    > .img {
        .p-a();
        transition: all .5s;
    }
}

.fade-photo {
    &-enter,
    &-leave-to {
        opacity: 0;
        transition: all 0.5s;
    }
    &-enter-active,
    &-leave-active {
        transition: all 0.5s;
    }
}
</style>
