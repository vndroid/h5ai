const {map} = require('../util');
const event = require('../core/event');
const allsettings = require('../core/settings');

const win = global.window;
const settings = Object.assign({
    enabled: false,
    id: 'G-0000000000'  // GA4 测量 ID (格式 G-XXXXXXXXXX)
}, allsettings['google-tag-id']);

const snippet = () => {
    // 新的 GA4 gtag.js 代码段
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${settings.id}`;
    document.head.appendChild(script);

    win.dataLayer = win.dataLayer || [];
    win.gtag = function() {
        dataLayer.push(arguments);
    };
    win.gtag('js', new Date());
};

const init = () => {
    if (!settings.enabled) {
        return;
    }

    snippet();

    // GA4 配置（禁用自动页面浏览跟踪）
    win.gtag('config', settings.id, {
        send_page_view: false  // 禁用自动页面浏览事件
    });

    event.sub('location.changed', item => {
        const loc = win.location;
        const pagePath = item.absHref;
        
        // 发送 GA4 页面浏览事件
        win.gtag('event', 'page_view', {
            page_title: map(item.getCrumb(), i => i.label).join(' > '),
            page_location: `${loc.protocol}//${loc.host}${pagePath}`,
            page_path: pagePath
        });
    });
};

init();
