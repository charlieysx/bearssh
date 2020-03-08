<script>
export default {
    name: 'dock',
    mounted() {
        this.dockBox = this.$refs.dockBox;
        this.reset();
    },
    methods: {
        mousemove(e) {
            const offsetX = e.pageX - this.dockBox.offsetLeft;
            const offsetY = e.pageY - this.dockBox.offsetParent.offsetTop;
            const dockItems = document.getElementsByClassName('dock-icon');
            for (let i = 0; i < dockItems.length; ++i) {
                const item = dockItems[i];
                const itemParent = dockItems[i].parentNode;
                let x = offsetX - (itemParent.offsetLeft + itemParent.offsetWidth / 2);
                let y = itemParent.offsetTop + itemParent.offsetHeight / 2 - offsetY;
                let imgScale = 1.5 - Math.sqrt(x * x + y * y) / 300;
                if (imgScale < 1) {
                    imgScale = 1;
                }
                const width = 40 * imgScale;
                item.style.marginTop = -Math.max(0, width - 40) + 'px';
                item.style.width = width + 'px';
                item.style.height = width + 'px';
            }
        },
        mouseleave(e) {
            this.reset();
        },
        reset() {
            const dockItems = document.getElementsByClassName('dock-icon');
            for (let i = 0; i < dockItems.length; ++i) {
                dockItems[i].style.marginTop = '0px';
                dockItems[i].style.width = 40 + 'px';
                dockItems[i].style.height = 40 + 'px';
            }
        },
        rightClickDock(item) {
            return (e)=> {
                this.$bus.addApp(item);
            };
        },
        clickDock(item) {
            if (this.$bus.includesApp(item.appName)) {
                this.$bus.activeApps(item.appName);
            } else {
                this.$bus.addApp(item);
            }
        }
    },
    render(h) {
        return (
            <div id="dock-wrap">
                <div id="dock-box"
                    onMousemove={this.mousemove}
                    onMouseleave={this.mouseleave}
                    ref="dockBox">
                    {this.$bus.desktop.dockList.map(item=> {
                        return (
                            <div class="dock-item" 
                                key={item.appName}
                                onContextmenu={this.rightClickDock(item)}
                                onClick={this.clickDock.bind(this, item)}>
                                <div class="dock-icon" style={{ backgroundImage: `url(${item.icon})` }}>
                                    <p class="dock-tip">{item.name}</p>
                                </div>
                                {this.$bus.includesApp(item.appName) && <div class="dot"></div>}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    },
};
</script>

<style lang="less">
#dock-wrap {
    .p-a();
    bottom: 0;
    left: 0;
    .wh(100vw, 56px);
    box-sizing: border-box;
    z-index: @dock;
    .flex();
    > #dock-box {
        position: relative;
        min-width: 56px;
        height: 56px;
        background-color: rgba(15, 15, 0, 0.45);
        border-top-left-radius: 5px;
        border-top-right-radius: 5px;
        border-top: 1px solid rgba(132, 132, 132, 0.25);
        border-left: 1px solid rgba(132, 132, 132, 0.25);
        border-right: 1px solid rgba(132, 132, 132, 0.25);
        color: white;
        .flex();
        padding-right: 8px;
        > .dock-item {
            position: relative;
            margin-left: 8px;
            > .dock-icon {
                position: relative;
                width: 40px;
                height: 40px;
                background-size: 100% 100%;
                > .dock-tip {
                    .p-a();
                    display: none;
                    width: max-content;
                    top: -10px;
                    left: 50%;
                    margin: 0 auto;
                    transform: translate3d(-50%, -100%, 0);
                    background-color: #323132;
                    border-radius: 3px;
                    font-size: 12px;
                    padding: 4px 8px;
                    font-weight: bold;
                    &::before {
                        content: ' ';
                        .p-a();
                        bottom: 0;
                        left: 50%;
                        transform: translate3d(-50%, 100%, 0);
                        border-width: 6px;
                        border-style: solid;
                        border-color: #323132 transparent transparent transparent;
                    }
                }
            }
            &:hover {
                .dock-tip {
                    display: block;
                }
            }
            > .dot {
                .center-row('r');
                .wh(4);
                bottom: -4px;
                border-radius: 4px;
                background-color: rgba(255, 255, 255, 0.7);
            }
        }
    }
}
</style>