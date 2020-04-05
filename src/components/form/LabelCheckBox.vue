<template>
    <div
        class="label-checkbox"
        :style="{
            width: innerConfig.width
        }">
        <div
            class="checkbox-label"
            v-if="innerConfig.label"
            :style="{
                width: innerConfig.labelWidth,
                textAlign: innerConfig.labelAlign
            }">
            {{innerConfig.label}}
        </div>
        <el-checkbox
            class="checkbox-content"
            :size="innerConfig.size"
            :disabled="innerConfig.disabled"
            v-model="innerValue"
            @change="change">
        </el-checkbox>
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
            <i class="checkbox-tip el-icon-info" slot="reference"></i>
        </el-popover>
    </div>
</template>

<script>
export default {
    name: 'label-checkbox',
    meta: {
        cn: '带标签的复选框'
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
                type: 'LabelChekcBox'
            });
        }
    }
};
</script>
<style lang="less">
.label-checkbox {
    .p-r();
    .flex(flex-start);
    box-sizing: border-box;
    font-size: 14px;
    > .checkbox-label {
        margin-right: 12px;
    }
    .checkbox-tip {
        margin-left: 12px;
    }
}
</style>