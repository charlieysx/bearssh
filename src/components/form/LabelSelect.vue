<template>
    <div
        class="label-select"
        :style="{
            width: innerConfig.width
        }">
        <div
            class="select-label"
            v-if="innerConfig.label"
            :style="{
                width: innerConfig.labelWidth,
                textAlign: innerConfig.labelAlign
            }">
            {{innerConfig.label}}
        </div>
        <el-select
            class="select-content"
            :size="innerConfig.size"
            v-model="innerValue"
            clearable
            :placeholder="innerConfig.placeholder"
            @change="change"
            :disabled="innerConfig.disabled">
            <el-option
                v-for="item in innerConfig.list"
                :key="item.label || item.value || item"
                :label="item.label || item.value || item"
                :value="item">
            </el-option>
        </el-select>
        <i v-if="innerConfig.info.list.length > 0" class="select-tip el-icon-info"></i>
    </div>
</template>

<script>
export default {
    name: 'label-select',
    meta: {
        cn: '带标签的下拉选择框'
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
                list: [],
                placeholder: '',
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
                type: 'LabelSelect'
            });
        }
    }
};
</script>
<style lang="less">
.label-select {
    .p-r();
    .flex(flex-start);
    box-sizing: border-box;
    font-size: 14px;
    > .select-label {
        margin-right: 12px;
    }
    > .select-content {
        flex: 1;
    }
    .select-tip {
        margin-left: 12px;
    }
}
</style>