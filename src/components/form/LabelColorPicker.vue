<template>
    <div
        class="label-color-picker"
        :style="{
            width: innerConfig.width
        }">
        <div
            class="color-picker-label"
            v-if="innerConfig.label"
            :style="{
                width: innerConfig.labelWidth,
                textAlign: innerConfig.labelAlign
            }">
            {{innerConfig.label}}
        </div>
        <el-color-picker
            :size="innerConfig.size"
            v-model="innerValue"
            :show-alpha="innerConfig.showAlpha"
            @change="change"
            >
        </el-color-picker>
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
            <i class="color-picker-tip el-icon-info" slot="reference"></i>
        </el-popover>
    </div>
</template>

<script>
export default {
    name: 'label-color-picker',
    meta: {
        cn: '带标签的颜色选择框'
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
                size: 'mini',
                labelAlign: 'left',
                labelWidth: 'auto',
                label: '',
                width: '',
                showAlpha: true,
                info: {
                    title: '',
                    list: ''
                }
            }
        };
    },
    created () {
        this.innerValue = this.value;
        this.initConfig(this.config);
    },
    watch: {
        value(v) {
            this.innerValue = this.value;
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
                type: 'LabelColorPicker'
            });
        }
    }
};
</script>
<style lang="less">
.label-color-picker {
    .p-r();
    .flex(flex-start);
    box-sizing: border-box;
    font-size: 14px;
    > .color-picker-label {
        margin-right: 12px;
    }
    .color-picker-tip {
        margin-left: 12px;
    }
}
</style>