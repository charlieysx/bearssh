<script>
import Vue from 'vue';
export default {
    name: 'RightMenu',
    data() {
        return {
            show: false,
            list: [],
            top: 0,
            left: 0,
            height: 0
        };
    },
    created() {
        Vue.$rightMenu = Vue.prototype.$rightMenu = {
            show: (mx, my, list, cb)=> {
                this.clickCallback = cb;
                this.showMenu(mx, my, list);
            },
            close: ()=> {
                this.closeMenu();
            }
        };
        this.clickCallback = null;
    },
    methods: {
        closeMenu() {
            this.clickCallback = null;
            this.list = [];
            this.show = false;
        },
        showMenu(mx, my, list, cb) {
            this.list = list;
            let listWidth = 240;
            if (mx + listWidth > window.innerWidth) {
                mx -= listWidth;
            }
            this.height = 0;
            for (let i = 0;i < this.list.length;++i) {
                const item = this.list[i];
                if (item.type === 'line') {
                    this.height += 1;
                } else {
                    this.height += 29;
                }
                if (this.height > window.innerHeight * 0.6) {
                    this.height = window.innerHeight * 0.6;
                    break;
                }
            }
            if (my + this.height > window.innerHeight) {
                my -= this.height;
            }
            this.left = mx;
            this.top = my;
            this.show = true;
        },
        selectMenu(item) {
            this.clickCallback && this.clickCallback(item);
            this.closeMenu();
        }
    },
    render(h) {
        return (
            this.show && <div 
                class="__right-menu"
                style={{
                    left: this.left + 'px',
                    top: this.top + 'px',
                    height: this.height + 'px'
                }}
                onMousedown={(e)=> e.stopPropagation()}>
                {
                    this.list.map(item=> {
                        if (item.type === 'line') {
                            return <li class="line"></li>;
                        }
                        return <li
                            class='__menu-item'
                            onClick={this.selectMenu.bind(this, item)}>
                            {item.text}
                        </li>;
                    })
                }
            </div>
        );
    },
};
</script>

<style lang="less">
.__right-menu {
    position: fixed;
    width: 240px;
    .scroll();
    background-color: #333334;
    box-shadow: 0px 0px 10px 2px #111111;
    color: white;
    z-index: 999999;
    border-radius: 2px;
    >.__menu-item {
        width: 100%;
        padding: 8px 15px;
        cursor: pointer;
        font-size: 13px;
        line-height: 13px;
        &:hover {
            background-color: #444445;
        }
    }
    > .line {
        height: 1px;
        background-color: #666666;
    }
}
</style>