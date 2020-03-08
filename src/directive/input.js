import Vue from 'vue';

let focusing = false;

Vue.directive('input', (el)=> {
    el.addEventListener('focus', ()=> {
        focusing = true;
    }, false);
    el.addEventListener('blur', ()=> {
        if (Vue.$bus.isIos) {
            focusing = false;
            setTimeout(() => {
                !focusing && window.scrollTo(0, document.body.clientHeight);
            }, 500);
        } else {
            focusing = false;
        }
    }, false);
});