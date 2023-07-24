import { createApp } from 'vue';
import App from './App.vue';
import piniaStore from './store';
import router from './router/permission';

// 导入应用样式
import './styles/index.scss';
// 导入重置样式
import './styles/reset.scss';
// 支持SVG
import 'virtual:svg-icons-register';
import SvgIcon from '@/components/SvgIcon/index.vue';

// createApp(App).component('svg-icon', svgIcon)
const app = createApp(App);

app.use(piniaStore);
app.use(router);
// 全局注册使用=>使用方式：<svg-icon name="vue"></svg-icon>
app.component('svg-icon', SvgIcon);

app.mount('#app');
