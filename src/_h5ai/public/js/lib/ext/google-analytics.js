const {map} = require('../util');
const event = require('../core/event');
const allsettings = require('../core/settings');

const win = global.window;
const settings = Object.assign({
    enabled: false,
    id: 'G-0000000000'
}, allsettings['google-tag-id']);

// GA4 新版统计代码
const snippet = () => {
    /* eslint-disable */
    // 创建 dataLayer 和 gtag 函数
    win.dataLayer = win.dataLayer || [];
    win.gtag = function() { win.dataLayer.push(arguments); };
    
    // 设置当前时间戳
    win.gtag('js', new Date());
    
    // 创建 GA4 配置
    win.gtag('config', settings.id, {
        send_page_view: false, // 禁用自动页面浏览跟踪
        transport_type: 'beacon' // 使用 beacon API 发送数据
    });
    
    // 动态加载 gtag.js 脚本
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${settings.id}`;
    document.head.appendChild(script);
    /* eslint-enable */
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    // 初始化 GA4
    snippet();

    // 监听路由变化事件
    event.sub('location.changed', item => {
        const loc = win.location;
        
        // 构建页面信息
        const pageLocation = `${loc.protocol}//${loc.host}${item.absHref}`;
        const pageTitle = map(item.getCrumb(), i => i.label).join(' > ');
        
        // 发送 GA4 页面浏览事件
        win.gtag('event', 'page_view', {
            page_location: pageLocation,
            page_title: pageTitle,
            page_path: item.absHref
        });
    });
};

init();
