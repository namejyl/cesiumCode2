import './style.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn';
import 'element-plus/dist/index.css';
const app = createApp(App);
window.tiandituToken = 'e0fe6b56ff3bff592aaae4d9dc17e325';
app.use(ElementPlus, {
  locale: zhCn // 插件中文
});
app.use(ElementPlus);
app.use(router);
app.mount('#app');
export default app;
