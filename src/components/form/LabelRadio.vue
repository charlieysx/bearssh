<template>
    <div
        class="label-radio"
        :style="{
            width: innerConfig.width
        }">
        <div
            class="radio-label"
            v-if="innerConfig.label"
            :style="{
                width: innerConfig.labelWidth,
                textAlign: innerConfig.labelAlign
            }">
            {{innerConfig.label}}
        </div>
        <el-radio-group
            class="radio-content"
            :size="innerConfig.size"
            :disabled="innerConfig.disabled"
            v-model="innerValue"
            @change="change">
            <el-radio
                v-for="item in innerConfig.list"
                :key="item.label || item.value || item"
                :label="item.label || item.value || item">
                {{item.label || item.value || item}}
            </el-radio>
        </el-radio-group>
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
            <i class="radio-tip el-icon-info" slot="reference"></i>
        </el-popover>
    </div>
</template>

<script>
export default {
    name: 'label-radio',
    meta: {
        cn: '带标签的单选框'
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
                width: '',
                info: {
                    title: '',
                    list: ''
                }
            }
        };
    },
    created () {
        this.innerValue = this.value.label || this.value.value || this.value;
        this.initConfig(this.config);
    },
    computed: {
        list() {
            return this.innerConfig.list.map(item=> (item.label || item.value || item));
        }
    },
    watch: {
        value(v) {
            this.innerValue = this.value.label || this.value.value || this.value;
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
            const index = this.list.indexOf(value);
            if (index >= 0) {
                this.$emit('input', this.innerConfig.list[index]);
                this.$emit('change', {
                    value: this.innerConfig.list[index],
                    tag: this.tag,
                    type: 'LabelRadio'
                });
            }
        }
    }
};
</script>
<style lang="less">
.label-radio {
    .p-r();
    .flex(flex-start);
    box-sizing: border-box;
    font-size: 14px;
    > .radio-label {
        margin-right: 12px;
    }
    .radio-tip {
        margin-left: 12px;
    }
}
</style>