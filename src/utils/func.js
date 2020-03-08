import Vue from 'vue';
import dayjs from 'dayjs';

const formatTime = (value , formatString = 'YYYY-MM-DD HH:mm:ss')=> {
    return dayjs(value).format(formatString);
};

const isBefore = (value)=> {
    return dayjs().isBefore(dayjs(value));
};

const isAfter = (value)=> {
    return dayjs().isAfter(dayjs(value));
};

const compareTime = (t1, t2)=> {
    return dayjs(t1).isBefore(dayjs(t2));
};

/**
 * base64解码
 * @param {*} str 
 */
const base64Decode = (str)=> {
    if (!str) {
        return str;
    }
    return decodeURIComponent(
        atob(str)
            .split('')
            .map((c)=> '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
};

/**
 * base64编码
 * @param {*} str 
 */
const base64Encode = (str)=> {
    if (!str) {
        return str;
    }
    return btoa(
        encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (match, p1)=> String.fromCharCode('0x' + p1))
    );
};

/**
 * 获取某URL所有参数，集成一个对象
 * @param {*} url 
 */
const getAllUrlQuery = (url)=> {
    let _url = url || window.location.href;
    // 获取连接后面的参数，微信分享的链接可能会有编码问题，先decodeURI
    let params = decodeURI(_url).split('#')[0].split('?');
    // 如果只有一个数据，说明没有带参数
    let result = {};
    if (params.length > 1) {
        params = params[1].split('&');
        params.forEach((item)=> {
            // 取出键值对
            let arr = item.split('=');
            let key = arr[0];
            let value = arr[1];
            // 如果出现大于2的数组，说明value中有 = 这个符号，需要拼接起来
            // 比如微信分享，中文参数先base64编码后有可能会出现这种情况
            if (arr.length > 2) {
                arr.splice(0, 1);
                value = arr.join('=');
            }
            // 因为直接解析为对象可能会出错，如果value是对象，需要自己用JSON.parse(str)解析
            // 同样，直接解码可能会报错，因为有些value是没有编码的，如果value是base64Encode编码的，也需要自己调用base64Decode(str)解码
            result[key] = value;
        });
    }
    // 返回一个空对象
    return result;
};

/**
 * 引入上下文
 * @param {*} context 
 */
const requireAll = context => context.keys().map(item=> {
    return {
        path: item,
        data: context(item)
    };
});

/**
 * 获取cookie
 * @param {*} name 
 */
const getCookie = (name) => {
    const reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    const cookie = document.cookie.match(reg);
    return cookie && cookie[2];
};

/**
 * 延时方法
 * @param {*} duration 时间，毫秒
 */
const wait = (duration)=> {
    return new Promise(resolve => {
        setTimeout(resolve, duration);
    });
};

/**
 * 获取区间中的随机数
 * @param {*} min 最小值
 * @param {*} max 最大值
 * @param {*} fn 处理随机数方法（比如Math.floor, Math.ceil等等）
 */
const getRandom = (min, max, fn = (data)=> data)=> {
    return fn(Math.random() * (max - min + 1) + min);
};

const isArray = (value)=> {
    if (typeof Array.isArray === 'function') {
        return Array.isArray(value);
    }
    return Object.prototype.toString.call(value) === '[object Array]';
};

Vue.$func = Vue.prototype.$func = {
    isBefore,
    isAfter,
    compareTime,
    formatTime,
    getAllUrlQuery,
    base64Decode,
    base64Encode,
    requireAll,
    getCookie,
    wait,
    getRandom,
    isArray
};

export {
    isBefore,
    isAfter,
    compareTime,
    formatTime,
    getAllUrlQuery,
    base64Decode,
    base64Encode,
    requireAll,
    getCookie,
    wait,
    getRandom,
    isArray
};
