import '@utils/storage';
import '@utils/filters';
import '@directive';
import './plugins/element.js';
import '@utils/func';
import '@c/common';
import '@c/form';
import '@c/software';
import '@utils/bus/index.js';
import './plugins/ssh';

import Vue from 'vue';
import App from './App.vue';

// 禁止拖放文件进来直接显示
document.addEventListener('drop', (e) => {
    e.preventDefault();
});
document.addEventListener('dragover', (e) => {
    e.preventDefault();
});

Vue.config.productionTip = false;

new Vue({
    render: h => h(App)
}).$mount('#app');
