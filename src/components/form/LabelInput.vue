<template>
    <div
        class="label-input"
        ref="inputWrap"
        :style="{
            width: innerConfig.width
        }">
        <div
            class="input-label"
            v-if="innerConfig.label"
            :style="{
                width: innerConfig.labelWidth,
                textAlign: innerConfig.labelAlign
            }">
            {{innerConfig.label}}
        </div>
        <el-input
            class="input-content input-parent"
            ref="input"
            :type="innerConfig.type"
            :size="innerConfig.size"
            v-model="innerValue"
            :placeholder="innerConfig.placeholder"
            :disabled="innerConfig.disabled"
            :maxlength="innerConfig.maxlength"
            v-bind="$attrs"
            v-on="$listeners">
            <template slot="append" v-if="innerConfig.append">{{innerConfig.append}}</template>
        </el-input>
        <slot/>
        <div
            class="input-sub-tip"
            v-if="innerConfig.subTip.tip"
            :style="{
                color: innerConfig.subTip.color,
                left: innerConfig.labelWidth
            }">
            {{innerConfig.subTip.tip}}
        </div>
        <div
            class="input-import-wrap"
            v-if="innerConfig.select.show"
            :class="{disabled: innerConfig.disabled}">
            导入
            <input
                type="file"
                class="input-inputfile"
                :class="{disabled: innerConfig.disabled}"
                id="select"
                :disabled="innerConfig.disabled"
                :accept="innerConfig.select.accept"
                @change="selectFile">
        </div>
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
            <i class="input-tip el-icon-info" slot="reference"></i>
        </el-popover>
    </div>
</template>

<script>
const defaultConfig =  {
    disabled: false,
    size: 'mini',
    labelAlign: 'left',
    labelWidth: 'auto',
    label: '',
    placeholder: '',
    width: '',
    append: '',
    maxlength: '',
    type: 'text',
    info: {
        title: '',
        list: ''
    },
    subTip: {
        tip: '',
        color: '#999999'
    },
    select: {
        show: false,
        accept: '*'
    }
};
export default {
    name: 'label-input',
    meta: {
        cn: '带标签的输入框'
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
                type: 'text',
                labelAlign: 'left',
                labelWidth: 'auto',
                label: '',
                placeholder: '',
                width: '',
                append: '',
                maxlength: ''
            }
        };
    },
    created () {
        this.innerValue = this.value;
        this.initConfig(this.config);
    },
    mounted () {
        // 待开发
        // const inputEle = this.$refs.inputWrap.getElementsByClassName('input-parent')[0];
        // inputEle.setAttribute('data-tip', '0/10');
    },
    watch: {
        value(v) {
            this.innerValue = this.value;
        },
        config(v) {
            this.initConfig(v);
        },
        innerValue(value) {
            this.$emit('input', value);
            this.$emit('change', {
                value: value,
                tag: this.tag,
                type: 'LabelInput'
            });
        }
    },
    methods: {
        initConfig(value) {
            Object.assign(this.innerConfig, defaultConfig);
            for (let key in this.innerConfig) {
                if (typeof this.innerConfig[key] === 'object' && value[key]) {
                    this.innerConfig[key] = value[key];
                }
            }
            Object.assign(this.innerConfig, value);
        },
        selectFile(event) {
            if (!event || !event.target || !event.target.files || event.target.files.length <= 0) {
                return;
            }
            const file = event.target.files[0];
            this.$emit('dealFile', {
                value: file,
                tag: this.tag,
                type: 'LabelInput',
                cb: this.setValue
            });
        },
        setValue(value) {
            this.innerValue = value;
        }
    }
};
</script>
<style lang="less">
.label-input {
    .p-r();
    .flex(flex-start);
    flex-wrap: wrap;
    box-sizing: border-box;
    font-size: 14px;
    > .input-label {
        margin-right: 12px;
    }
    > .el-input--suffix .el-input__inner {
        padding-right: 30px !important;
    }
    > .input-content {
        flex: 1;
        &::after {
            content: attr(data-tip);
            .p-a();
            right: 5px;
            top: 50%;
            color: #aaaaaa;
            transform: translateY(-50%);
        }
    }
    > .input-sub-tip {
        .p-a();
        bottom: 0;
        transform: translate3d(0, 100%, 0);
        font-size: 12px;
        margin-left: 12px;
    }
    .input-tip {
        margin-left: 12px;
    }
    > .input-import-wrap {
        .p-r();
        margin-left: 12px;
        border: 1px solid #DCDFE6;
        padding: 7px 15px;
        font-size: 12px;
        border-radius: 3px;
        color: #606266;
        cursor: pointer;
        &.disabled {
            background-color: #F5F7FA;
            border-color: #E4E7ED;
            color: #C0C4CC;
            cursor: not-allowed;
            &:hover {
                background-color: #F5F7FA;
                border-color: #E4E7ED;
                color: #C0C4CC;
                cursor: not-allowed;
            }
        }
        &:hover {
            color: #409EFF;
            border-color: #c6e2ff;
            background-color: #ecf5ff;
        }
        > .input-inputfile {
            .p-a();
            .wh(100%);
            top: 0;
            left: 0;
            opacity: 0;
            &.disabled {
                cursor: not-allowed;
            }
        }
    }
}
</style>