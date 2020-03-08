<template>
    <div
        class="label-slider"
        :style="{
            width: innerConfig.width
        }">
        <div
            class="slider-label"
            v-if="innerConfig.label"
            :style="{
                width: innerConfig.labelWidth,
                textAlign: innerConfig.labelAlign
            }">
            {{innerConfig.label}}
        </div>
        <el-slider
            class="slider-content"
            v-model="innerValue"
            :min="innerConfig.min"
            :max="innerConfig.max"
            :step="innerConfig.step"
            @change="change">
        </el-slider>
        <el-popover
            v-if="innerConfig.info.list.length > 0"
            placement="top"
            :title="innerConfig.info.title"
            trigger="hover">
            <div class="input-tip-ul">
                <p
                    class="input-tip-li"
                    v-for="(item, index) in innerConfig.info.list"
                    :key="index">
                    {{item}}
                </p>
            </div>
            <i class="slider-tip el-icon-info" slot="reference"></i>
        </el-popover>
    </div>
</template>

<script>
export default {
    name: 'label-slider',
    meta: {
        cn: '带标签的滑块'
    },
    props: {
        tag: {
            default: ''
        },
        value: {
            default: ''
        },
        config: {
            type: Object,
            default: ()=> {
                return {};
            }
        }
    },
    data() {
        return {
            innerValue: '',
            innerConfig: {
                disabled: false,
                labelAlign: 'left',
                labelWidth: 'auto',
                label: '',
                width: '',
                min: 0,
                max: 100,
                step: 1,
                info: {
                    title: '',
                    list: ''
                }
            }
        };
    },
    created () {
        this.innerValue = +this.value;
        this.initConfig(this.config);
    },
    watch: {
        value(v) {
            this.innerValue = +this.value;
        },
        config(value) {
            this.initConfig(value);
        }
    },
    methods: {
        initConfig(value) {
            for (let key in this.innerConfig) {
                if (typeof this.innerConfig[key] === 'object' && value[key]) {
                    if (this.$func.isArray(this.innerConfig[key])) {
                        this.innerConfig[key] = value[key];
                    } else {
                        Object.assign(this.innerConfig[key], value[key]);
                        Object.assign(value[key], this.innerConfig[key]);
                    }
                }
            }
            Object.assign(this.innerConfig, value);
        },
        change(value) {
            this.$emit('input', value);
            this.$emit('change', {
                value: value,
                tag: this.tag,
                type: 'LabelSlider'
            });
        }
    }
};
</script>
<style lang="less">
.label-slider {
    .p-r();
    .flex(flex-start);
    box-sizing: border-box;
    font-size: 14px;
    > .slider-label {
        margin-right: 12px;
    }
    > .slider-content {
        flex: 1;
        margin-left: 12px
    }
    .slider-tip {
        margin-left: 12px;
    }
    .el-slider__runway {
        margin: 0;
    }
}
</style>