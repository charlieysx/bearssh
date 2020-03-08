<script>
export default {
    name: 'tool',
    data() {
        return {
            curTime: ''
        };
    },
    created() {
        setInterval(()=> {
            const date = new Date();
            const m = this.$func.formatTime(date, 'MM月DD日');
            const w = this.$func.formatTime(date, 'd');
            const t = this.$func.formatTime(date, 'HH:mm:ss');
            this.curTime = `${m} 周${['日', '一', '二', '三', '四', '五', '六'][w]} ${t}`;
        }, 100);
    },
    render(h) {
        return (
            <div id="tool-wrap">
                <div class="left"></div>
                <div class="right">
                    <p class="time item">{this.curTime}</p>
                </div>
            </div>
        );
    },
};
</script>

<style lang="less">
#tool-wrap {
    z-index: @tool;
    .wh(100vw, 22px);
    background-color: rgba(0, 0, 0, 0.4);
    box-sizing: border-box;
    color: white;
    font-size: 14px;
    font-weight: bold;
    .flex();
    padding: 0 20px;
    > .left {
        height: 100%;
    }
    > .right {
        height: 100%;
        flex: 1;
        .flex(flex-end, center);
        > .item {
            cursor: default;
        }
        > .time {
            text-align: right;
            width: 170px;
            user-select: none;
        }
    }
}
</style>