<template>
    <div
        class="label-upload"
        :class="innerConfig.labelPos"
        :style="{
            width: innerConfig.labelPos === 'column' ? innerConfig.width : ''
        }">
        <div
            class="upload-label"
            v-if="innerConfig.labelPos === 'row' && innerConfig.label"
            :style="{
                width: innerConfig.labelWidth,
                textAlign: innerConfig.labelAlign
            }">
            {{innerConfig.label}}
        </div>
        <div
            class="upload-img-wrap border"
            :style="{
                width: innerConfig.width,
                height: innerConfig.width
            }">
            <div
                class="upload-show-img"
                ref="showImg"
                v-if="innerValue" >
                <img
                    style="max-width: 100%;max-height: 100%;"
                    :src="innerValue"
                    @click="preview" />
            </div>
            <div
                class="upload-close-icon"
                v-if="innerConfig.closeable"
                @click="closeImg">
            </div>
        </div>
        <div
            class="upload-import-wrap"
            :class="{disabled: innerConfig.disabled}">
            {{innerValue ? '修改' : '上传'}}图片
            <input
                type="file"
                class="upload-inputfile"
                :class="{disabled: innerConfig.disabled}"
                id="select"
                :disabled="innerConfig.disabled"
                :accept="inputAccept"
                @change="selectImg">
        </div>
        <div
            class="upload-label"
            v-if="innerConfig.labelPos === 'column' && innerConfig.label">
            {{innerConfig.label}}
        </div>
        <div class="upload-size" v-if="innerConfig.size">{{innerConfig.size}}</div>
        <div class="upload-input-wrap" v-if="innerConfig.ableInput">
            <input
                class="upload-real-input"
                :placeholder="innerConfig.inputPlaceHolder"
                v-model="innerConfig.inputValue"
                @input="inputChange"/>
        </div>
    </div>
</template>

<script>
export default {
    name: 'label-upload',
    meta: {
        cn: '带标签的文件选择器'
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
                closeable: false,
                label: '',
                labelPos: 'column',
                labelAlign: 'left',
                labelWidth: 'auto',
                width: '80px',
                file: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
                minSize: 0,
                maxSize: 0,
                size: '',
                ableInput: false,
                inputPlaceHolder: '',
                inputValue: ''
            }
        };
    },
    created () {
        this.innerValue = this.value;
        Object.assign(this.innerConfig, this.config);
    },
    computed: {
        inputAccept() {
            let file = this.innerConfig.file.reduce((pre, item)=> {
                pre += (pre ? ',' : '') + item;
                return pre;
            }, '');
            return file;
        }
    },
    watch: {
        value(v) {
            this.innerValue = this.value;
        },
        config(value) {
            Object.assign(this.innerConfig, value);
        }
    },
    methods: {
        preview(e) {
            if (this.innerValue) {
                let target = e.target;
                let img = target.src || target.style.backgroundImage;
                img = img.replace('url("', '').replace('")', '');
                this.$photo.show({
                    src: img,
                    elem: target
                });
            }
        },
        selectImg(event) {
            if (!event || !event.target || !event.target.files || event.target.files.length <= 0) {
                return;
            }
            const file = event.target.files[0];
            if (this.innerConfig.file.length > 0 && this.innerConfig.file.indexOf(file.type) < 0) {
                this.$message.error('不是有效的文件!');
                return;
            }
            if(file.size < this.innerConfig.minSize) {
                this.$message.error(`文件大小不能小于${this.innerConfig.minSize}`);
                return;
            }
            if(this.innerConfig.maxSize > 0 && file.size > this.innerConfig.maxSize) {
                this.$message.error(`文件大小不能大于${this.innerConfig.maxSize}`);
                return;
            }
            // this.getImgBase64(file).then(e=> {
            const imgfile = new FormData();
            imgfile.append('imgfile', file);
            this.$api.commonApi.uploadImg(imgfile).then(payload => {
                this.$emit('input', payload.data.url);
                this.innerValue = payload.data.url;
                this.$emit('change', {
                    value: this.innerValue,
                    tag: this.tag,
                    type: 'LabelUpload'
                });
            }).catch(err => {
                this.$message.error('上传超时，请重新上传该图片');
            }).finally(()=> {
                event.target.value = '';
            });
            // });
        },
        getImgBase64(source) {
            return new Promise((resolve, reject)=> {
                let reader = new FileReader();
                reader.readAsDataURL(source);
                reader.onload = (e)=> {
                    resolve(e);
                };
            });
        },
        closeImg() {
            this.$emit('close');
        },
        inputChange(e) {
            this.$emit('change', {
                value: e.target.value,
                tag: this.tag,
                key: 'inputValue',
                type: 'LabelUpload'
            });
        }
    }
};
</script>
<style lang="less">
.label-upload {
    .p-r();
    font-size: 14px;
    &.row {
        .flex(flex-start);
        > .upload-label {
            margin-right: 12px;
        }
        > .upload-import-wrap {
            margin-left: 8px;
            margin-right: 8px;
            margin-top: 5px;
        }
    }
    &.column {
        .flex-column();
        > .upload-label {
            width: 100%;
            text-align: center;
            font-size: 12px;
        }
    }
    box-sizing: border-box;
    > .upload-img-wrap {
        .flex();
        border-radius: 10px;
        font-size: 24px;
        .p-r();
        cursor: pointer;
        &.border {
            border: 1px dashed #a6a6a6;
        }
        &.border-none {
            border: 1px solid transparent;
        }
        > .upload-show-img {
            .p-r();
            width: 100%;
            height: 100%;
            border-radius: 10px;
            overflow: hidden;
            > img {
                // border-radius: 10px;
            }
            .flex();
            &:hover {
                &::after {
                    opacity: 1;
                }
            }
            &::after {
                .p-a();
                content: '点击查看大图';
                .wh(100%);
                background-color: rgba(0, 0, 0, 0.7);
                border-radius: 10px;
                pointer-events: none;
                color: white;
                font-size: 18px;
                padding: 5px;
                box-sizing: border-box;
                .flex();
                text-align: center;
                font-weight: bold;
                opacity: 0;
            }
        }
        > .upload-close-icon {
            .p-a();
            .wh(16px);
            border-radius: 100%;
            top: -8px;
            right: -8px;
            cursor: pointer;
            background-color: white;
            background-image: url('~@imgs/icon_close.svg');
            background-size: 100% 100%;
        }
        > .upload-inputfile {
            width: 100%;
            height: 100%;
            border-radius: 10px;
            opacity: 0;
            position: absolute;
            &.disabled {
                cursor: not-allowed;
            }
        }
    }
    .upload-size {
        margin: 2px 0;
        font-size: 12px;
    }
    .upload-input-wrap {
        width: 100%;
        border: 1px solid #a6a6a6;
        background-color: white;
        border-radius: 5px;
        > .upload-real-input {
            width: 100%;
            font-size: 12px;
            line-height: 12px;
            outline: none;
            border: none;
        }
    }
    > .upload-import-wrap {
        .p-r();
        margin-top: 10px;
        margin-bottom: 5px;
        border: 1px solid #DCDFE6;
        padding: 4px 8px;
        font-size: 12px;
        line-height: 12px;
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
        > .upload-inputfile {
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