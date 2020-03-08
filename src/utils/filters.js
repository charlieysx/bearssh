import Vue from 'vue';
import dayjs from 'dayjs';

Vue.filter('time',  (value, formatString = 'YYYY-MM-DD HH:mm:ss')=> {
    return dayjs(value).format(formatString);
});

Vue.filter('fileSize', (value)=> {
    if (value >= Math.pow(1024, 4)) {
        return (value / Math.pow(1024, 4)).toFixed(2) + ' TB';
    } else if (value >= Math.pow(1024, 3)) {
        return (value / Math.pow(1024, 3)).toFixed(2) + ' GB';
    } else if (value >= 1024 * 1024) {
        return (value / 1024 / 1024).toFixed(2) + ' MB';
    } else if (value >= 1024 && value < 1024 * 1024) {
        return (value / 1024).toFixed(2) + ' KB';
    } else {
        return (value) + ' B';
    }
});