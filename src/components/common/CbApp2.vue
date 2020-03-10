<script>
export default {
    name: 'CbApp',
    props: {
        uuid: {
            require: true
        },
        title: {
            type: String,
            default: ''
        },
        minWidth: {
            type: Number,
            default: 180
        },
        minHeight: {
            type: Number,
            default: 180
        },
        maxWidth: {
            type: Number,
            default: -1
        },
        maxHeight: {
            type: Number,
            default: -1
        },
        width: {
            type: Number,
            default: 180
        },
        height: {
            type: Number,
            default: 180
        },
        left: {
            type: Number,
            default: -1
        },
        top: {
            type: Number,
            default: -1
        }
    },
    data() {
        return {
            innerTop: 0,
            innerLeft: 0,
            innerWidth: 180,
            innerHeight: 180,
            animBorder: false
        };
    },
    created() {
        if (!this.uuid) {
            return;
        }
        this.innerLeft = this.left === -1 ? (this.$bus.system.contentWidth - this.width) / 2 : this.left;
        this.innerTop = this.top === -1 ? (this.$bus.system.contentHeight - this.height) / 2 : this.top;
        this.innerWidth = this.width;
        this.innerHeight = this.height;

        this.mouseXY = null;
        this.widgetXY = null;
        this.resizeWH = null;
        this.dragType = '';
        this.resizeDir = '';

        this.resizeType = 'min';
    },
    computed: {
        isActive() {
            return this.$bus.isActiveApp(this.uuid);
        }
    },
    methods: {
        __mousedown(e) {
            if (!this.isActive) {
                document.addEventListener('mouseup', this.mouseup, true);
                return;
            }
            e.stopPropagation();
            const classList = e.target.classList;
            if (classList.contains('disable-drag')) {
                // 不可拖拽
                return;
            }
            if (this.mouseXY) {
                // 不可重复点击
                return;
            }
            const dragType = e.target.dataset.dragtype;
            if (!['drag', 'resize'].includes(dragType)) {
                return;
            }
            this.dragType = dragType;
            if (this.dragType === 'resize') {
                this.resizeDir = e.target.dataset.dir.split('-');
            }
            this.mouseXY = {x: e.pageX, y: e.pageY};
            this.widgetXY = {x: this.innerLeft, y: this.innerTop};
            this.resizeWH = {width: this.innerWidth, height: this.innerHeight};
            document.addEventListener('mousemove', this.__mousemove, true);
            document.addEventListener('mouseup', this.__mouseup, true);
        },
        __mousemove(e) {
            if (!this.isActive) {
                return;
            }
            e.stopPropagation();
            e.preventDefault();
            if (!this.mouseXY) {
                return;
            }
            let dx = e.pageX - this.mouseXY.x;
            let dy = e.pageY - this.mouseXY.y;
            if (this.dragType === 'drag') {
                let left = this.widgetXY.x + dx;
                let top = this.widgetXY.y + dy;
                this.innerLeft = left;
                this.innerTop = Math.max(0, top);
            } else if (this.dragType === 'resize') {
                this.__doResize(e);
            }
        },
        __mouseup(e) {
            document.removeEventListener('mousemove', this.__mousemove, true);
            document.removeEventListener('mouseup', this.__mouseup, true);
            this.mouseXY = null;
            this.widgetXY = null;
            this.resizeWH = null;
            this.dragType = '';
            if (!this.isActive) {
                this.$bus.activeApp(this.uuid);
            }
        },
        __doResize(e) {
            let dx = e.pageX - this.mouseXY.x;
            let dy = e.pageY - this.mouseXY.y;
            let left = 0;
            let top = 0;
            for (let i = 0; i < this.resizeDir.length; ++i) {
                let dir = this.resizeDir[i];
                switch(dir) {
                case 'top':
                    let t = this.widgetXY.y + dy;
                    top = Math.max(t, 0);
                    top = Math.min(this.widgetXY.y + this.resizeWH.height - this.minHeight, top);
                    if (this.maxHeight !== -1) {
                        top = Math.max(this.widgetXY.y + this.resizeWH.height - this.maxHeight, top);
                    }
                    this.innerHeight += (this.innerTop - top);
                    this.innerHeight = Math.max(this.innerHeight, this.minHeight);
                    if (this.maxHeight !== -1) {
                        this.innerHeight = Math.min(this.innerHeight, this.maxHeight);
                    }
                    this.innerTop = top;
                    break;
                case 'bottom':
                    top = dy;
                    this.innerHeight = this.resizeWH.height + top;
                    this.innerHeight = Math.max(this.innerHeight, this.minHeight);
                    break;
                case 'left':
                    let tLeft = this.widgetXY.x + dx;
                    left = Math.max(tLeft, 0);
                    this.innerWidth += (this.innerLeft - left);
                    this.innerWidth = Math.max(this.innerWidth, this.minWidth);
                    left = Math.min(this.widgetXY.x + this.resizeWH.width - this.minWidth, left);
                    this.innerLeft = left;
                    break;
                case 'right':
                    left = dx;
                    this.innerWidth = this.resizeWH.width + left;
                    this.innerWidth = Math.max(this.innerWidth, this.minWidth);
                    break;
                }
            }
        },
        __op(type) {
            switch(type) {
            case 'close':
                this.beforeClose()
                    .then(()=> {
                        this.$bus.removeApp(this.uuid);
                    });
                break;
            case 'hide':
                break;
            case 'resize':
                if (this.resizeType === 'min') {
                    this.resizeType = 'max';
                    this.innerWidth = this.maxWidth === -1 ? this.$bus.system.contentWidth : this.maxWidth;
                    this.innerHeight = this.maxHeight === -1 ? this.$bus.system.contentHeight : this.maxHeight;
                } else {
                    this.resizeType = 'min';
                    this.innerWidth = this.width;
                    this.innerHeight = this.height;
                }
                this.innerLeft = (this.$bus.system.contentWidth - this.innerWidth) / 2;
                this.innerTop = (this.$bus.system.contentHeight - this.innerHeight) / 2;
                this.animBorder = true;
                setTimeout(()=> {
                    this.animBorder = false;
                }, 200);
                break;
            }
        },
        async beforeClose() {},
        renderHeader(h) {
            const iconCloseClass = this.isActive ? 'disable-drag' : '__icon-disable';
            const iconHideClass = this.isActive ? 'disable-drag' : '__icon-disable';
            const iconResizeClass = this.isActive ? 'disable-drag' : '__icon-disable';

            const titleStyle = {};
            if (!this.isActive) {
                titleStyle.color = '#636363';
            }
            return (
                <div class="__header">
                    <div class="__op-wrap" data-dragtype="drag" onDblclick={this.__op.bind(this, 'resize')}>
                        <div class="__op">
                            <div class={['__icon __icon-close', iconCloseClass]} onClick={this.__op.bind(this, 'close')}></div>
                            <div class={['__icon __icon-hide', iconHideClass]} onClick={this.__op.bind(this, 'hide')}></div>
                            <div class={['__icon __icon-resize', iconResizeClass]} onClick={this.__op.bind(this, 'resize')}></div>
                        </div>
                        <div class="__title" style={titleStyle}>{this.title}</div>
                    </div>
                    <div class="__config-title">
                        {this.renderSubTitle(h)}
                    </div>
                </div>
            );
        },
        renderSubTitle(h) { return ''; },
        renderContent(h) { return ''; }
    },
    render(h) {
        return (
            <div class="__cb-app"
                onMousedown={this.__mousedown}
                style={{
                    top: this.innerTop + 'px',
                    left: this.innerLeft + 'px',
                    width: this.innerWidth + 'px',
                    height: this.innerHeight + 'px',
                    transition: this.animBorder ? 'all .2s linear' : ''
                }}>
                {this.renderHeader(h)}
                <div class="__content">
                    {this.renderContent(h)}
                </div>
                <div class="__resize-item-line __t" data-dragtype="resize" data-dir="top"></div>
                <div class="__resize-item-line __b" data-dragtype="resize" data-dir="bottom"></div>
                <div class="__resize-item-line __l" data-dragtype="resize" data-dir="left"></div>
                <div class="__resize-item-line __r" data-dragtype="resize" data-dir="right"></div>
                <div class="__resize-item __lt" data-dragtype="resize" data-dir="left-top"></div>
                <div class="__resize-item __rt" data-dragtype="resize" data-dir="right-top"></div>
                <div class="__resize-item __lb" data-dragtype="resize" data-dir="left-bottom"></div>
                <div class="__resize-item __rb" data-dragtype="resize" data-dir="right-bottom"></div>
            </div>
        );
    },
};
</script>
<style lang="less">
.__cb-app {
    .p-a();
    min-width: 180px;
    background-color: #222223;
    border-radius: 5px;
    overflow: hidden;
    border: 1px solid #616161;
    z-index: 100;
    .flex-column();
    > .__header {
        .p-r();
        width: 100%;
        min-height: 20px;
        background: linear-gradient(#414041, #333334);
        border-bottom: 1px solid #262626;
        > .__op-wrap {
            .p-r();
            .wh(100%, 22px);
            .flex();
            > .__op {
                .p-a();
                left: 10px;
                .flex();
                &:hover {
                    > .__icon {
                        &::before {
                            display: block;
                        }
                    }
                }
                > .__icon {
                    .p-r();
                    margin-right: 5px;
                    .wh(12);
                    border-radius: 100%;
                    background-color: white;
                    &::before {
                        content: '';
                        background-size: 100% 100%;
                        .wh(6);
                        .center();
                        display: none;
                    }
                }
                > .__icon-close {
                    .p-r();
                    background-color: #ed6b5f;
                    &::before {
                        background-image: url('~@imgs/icon-close.png');
                    }
                }
                > .__icon-hide {
                    background-color: #f7c251;
                    &::before {
                        background-image: url('~@imgs/icon-hide.png');
                    }
                }
                > .__icon-resize {
                    background-color: #62c655;
                    &::before {
                        background-image: url('~@imgs/icon-resize.png');
                    }
                }
                > .__icon-disable {
                    background-color: #515151;
                    pointer-events: none;
                    &::before {
                        background-image: url();
                    }
                }
            }
            > .__title {
                font-size: 12px;
                color: white;
                font-weight: bold;
                cursor: default;
                user-select: none;
            }
        }
        > .__config-title {
            width: 100%;
        }
    }
    > .__content {
        .p-r();
        width: 100%;
        flex: 1;
        overflow: hidden;
        background-color: #333434;
    }
    > .__resize-item {
        .p-a();
        .wh(10);
        z-index: 999;
        background-color: transparent;
        &.__lt {
            top: 0px;
            left: 0px;
            cursor: nw-resize;
        }
        &.__rt {
            top: 0px;
            right: 0px;
            cursor: ne-resize;
        }
        &.__lb {
            bottom: 0px;
            left: 0px;
            cursor: sw-resize;
        }
        &.__rb {
            bottom: 0px;
            right: 0px;
            cursor: se-resize;
        }
    }
    > .__resize-item-line {
        .p-a();
        background-color: transparent;
        &.__t {
            top: 0px;
            left: 0px;
            width: 100%;
            height: 5px;
            cursor: n-resize;
        }
        &.__b {
            bottom: 0px;
            left: 0px;
            width: 100%;
            height: 5px;
            cursor: s-resize;
        }
        &.__l {
            top: 0px;
            left: 0px;
            width: 5px;
            height: 100%;
            cursor: w-resize;
        }
        &.__r {
            top: 0px;
            right: 0px;
            width: 5px;
            height: 100%;
            cursor: e-resize;
        }
    }
}
</style>