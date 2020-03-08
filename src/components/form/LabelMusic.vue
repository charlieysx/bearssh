<template>
    <div
        class="label-music"
        :style="{
            width: innerConfig.width
        }">
        <div
            class="music-label"
            v-if="innerConfig.label"
            :style="{
                width: innerConfig.labelWidth,
                textAlign: innerConfig.labelAlign
            }">
            {{innerConfig.label}}
        </div>
        <div class="music-progress">
            <el-progress
                :percentage="progress"
                :show-text="false">
            </el-progress>
        </div>
        <div class="music-progress-time">{{ currentTimeStr }}</div>
        <div class="music-btn-wrap">
            <el-button class="music-item" size="mini" plain @click="toggle">{{playing ? '暂停' : '播放'}}</el-button>
            <a class="music-item" download target="_blank" :href="innerValue">
                <el-button type="primary" size="mini" plain>下载</el-button>
            </a>
            <el-button class="music-item" type="success" size="mini" plain>
                上传
                <input class="music-upload-input" type="file" @change="inputChange" accept="audio/mp3">
            </el-button>
        </div>
    </div>
</template>

<script>
export default {
    name: 'label-music',
    meta: {
        cn: '带标签的音乐配置条'
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
                labelAlign: 'left',
                labelWidth: 'auto',
                label: '',
                width: ''
            },
            input: null,
            audio: null,
            currentTimeStr: '00:00',
            playing: false,
            progress: 100,
            interval: null
        };
    },
    created () {
        this.innerValue = this.value;
        this.initConfig(this.config);
    },
    mounted() {
        this.initAudio();
    },
    watch: {
        value(v) {
            this.innerValue = this.value;
            this.initAudio();
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
                type: 'LabelMusic'
            });
        },
        initAudio() {
            this.audio = new Audio();
            this.audio.addEventListener('canplaythrough', () => {
                this.setTime();
            });
            this.audio.addEventListener('ended', () => {
                this.end();
            });
            this.audio.src = this.innerValue;
            this.audio.load();
        },
        toggle() {
            if (this.playing) {
                this.pause();
            } else {
                this.play();
            }
        },
        play() {
            // 重置进度条和时间
            if (this.progress >= 100) {
                this.progress = 0;
                this.currentTimeStr = '00:00';
            }
            // 定时更新
            this.interval = setInterval(() => {
                this.progress = 100 * this.audio.currentTime / this.audio.duration;
                this.currentTimeStr = this.getMusicTime(this.audio.currentTime);
            }, 300);
            // 播放
            this.playing = true;
            this.audio.play();
            // 派发事件
        },
        pause() {
            this.playing = false;
            this.audio.pause();
            clearInterval(this.interval);
            this.interval = null;
        },
        end() {
            this.playing = false;
            this.audio.pause();
            this.audio.currentTime = 0;
            clearInterval(this.interval);
            this.interval = null;
            // 还原
            this.currentTimeStr = this.getMusicTime(this.audio.duration);
            this.progress = 100;
        },
        setTime() {
            if (this.audio.readyState === 4) {
                this.currentTimeStr = this.getMusicTime(this.audio.duration);
            } else {
                this.audio.addEventListener('canplaythrough', () => {
                    this.currentTimeStr = this.getMusicTime(this.audio.duration);
                });
            }
        },
        getMusicTime(time) {
            let musicTime = Math.ceil(time);
            let minute = Math.floor(time / 60);
            let second = musicTime - minute * 60;
            if (minute < 10) minute = `0${minute}`;
            if (second < 10) second = `0${second}`;
            musicTime = `${minute}:${second}`;
            return musicTime;
        },
        inputChange(event) {
            if (!event || !event.target || !event.target.files || event.target.files.length <= 0) {
                return;
            }
            let file = event.target.files[0];
            const imgfile = new FormData();
            imgfile.append('imgfile', file);
            this.$api.commonApi.uploadImg(imgfile).then(payload => {
                this.$emit('input', payload.data.url);
                this.audio.src = payload.data.url;
            });
            // console.log(file);
        }
    }
};
</script>
<style lang="less">
.label-music {
    .p-r();
    .flex(flex-start);
    box-sizing: border-box;
    font-size: 14px;
    > .music-label {
        margin-right: 12px;
    }
    > .music-progress {
        flex: 1;
        .flex(flex-start);
        line-height: 36px;
        .el-progress {
            flex-grow: 1;
        }
        .el-progress-bar__outer {
            overflow: visible;
        }
        .el-progress-bar__inner {
            &::before {
                content: "";
                display: block;
                .wh(14px);
                .p-a();
                background-color: #409EFF;
                right: 0;
                border-radius: 50%;
                top: 50%;
                transform: translate(50%, -50%);
            }
        }
    }
    > .music-progress-time {
        color: #409EFF;
        margin-left: 12px;
    }
    > .music-btn-wrap {
        .flex();
        > .music-item {
            .p-r();
            margin-left: 10px;
            .music-upload-input {
                .wh(100%);
                .p-a();
                left: 0;
                top: 0;
                opacity: 0;
            }
        }
    }
}
</style>