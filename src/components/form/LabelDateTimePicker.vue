<template>
    <div
        class="label-dateTimePicker"
        :style="{
            width: innerConfig.width
        }">
        <div
            class="dateTimePicker-label"
            v-if="innerConfig.label"
            :style="{
                width: innerConfig.labelWidth,
                textAlign: innerConfig.labelAlign
            }">
            {{innerConfig.label}}
        </div>
        <el-date-picker
            class="dateTimePicker-content"
            :size="innerConfig.size"
            v-model="innerValue"
            :type="innerConfig.type"
            :start-placeholder="innerConfig.startPlaceholder"
            :end-placeholder="innerConfig.endPlaceholder"
            :placeholder="innerConfig.placeholder"
            @change="change"
            value-format="yyyy-MM-dd HH:mm:ss"
            :disabled="innerConfig.disabled">
        </el-date-picker>
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
            <i class="dateTimePicker-tip el-icon-info" slot="reference"></i>
        </el-popover>
    </div>
</template>

<script>
export default {
    name: 'label-dateTimePicker',
    meta: {
        cn: '带标签的日期时间选择框'
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
                type: 'datetimerange',
                disabled: false,
                size: 'mini',
                labelAlign: 'left',
                labelWidth: 'auto',
                label: '',
                startPlaceholder: '开始日期',
                endPlaceholder: '结束日期',
                format: ()=> {},
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
            if (value === null) {
                value = [];
            }
            this.$emit('input', value);
            this.$emit('change', {
                value: value,
                tag: this.tag,
                type: 'LabelDateTimePicker'
            });
        }
    }
};
</script>
<style lang="less">
.label-dateTimePicker {
    .p-r();
    .flex(flex-start);
    box-sizing: border-box;
    font-size: 14px;
    > .dateTimePicker-label {
        margin-right: 12px;
    }
    > .dateTimePicker-content {
        flex: 1;
    }
    .dateTimePicker-tip {
        margin-left: 12px;
    }
}
</style>