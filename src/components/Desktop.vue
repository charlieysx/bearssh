<script>
export default {
    name: 'desktop',
    data () {
        return {
        };
    },
    created () {
    },
    methods: {
    },
    render(h) {
        return (
            <div class="desktop-wrap">
                {
                    this.$bus.desktop.appList.map(app=> {
                        return <app.appName 
                            key={app.uuid}
                            uuid={app.uuid}
                            props={{...app.config}}>
                        </app.appName>;
                    })
                }
            </div>
        );
    },
};
</script>

<style lang="less">
.desktop-wrap {
    .page();
    .p-r();
    .wh(100vw, 728px);
    box-sizing: border-box;
    overflow: hidden;
}
</style>