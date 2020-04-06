<script>
import Photo from '@c/Photo';
import Loading from '@c/Loading';
import Dock from '@c/Dock';
import Tool from '@c/Tool';
import Desktop from '@c/Desktop';
import Login from '@c/Login';

export default {
    name: 'app',
    components: {
        Photo,
        Loading,
        Dock,
        Tool,
        Desktop,
        Login
    },
    methods: {
        __mousedown(e) {
            this.$rightMenu.close();
        }
    },
    render(h) {
        return (
            <div 
                id="app"
                style={this.$bus.system.bgStyle}
                onMousedown={this.__mousedown}>
                <Tool />
                <Desktop />
                <Dock />
                <Photo />
                {
                    !this.$bus.hadLogin && <Login />
                }
                <Loading />
                <RightMenu />
            </div>
        );
    }
};
</script>

<style lang="less">
#app {
    .page();
    background-size: cover;
    background-position: center;
}
</style>
