import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './styles/theme.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';

// 导入FontAwesome相关库
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { 
  faMessage, faHeadset, faBolt, faPlus, 
  faCalendar, faLayerGroup, faUser, faSun, 
  faRobot, faLightbulb, faCheck, faMoon,
  faTimes, faCog
} from '@fortawesome/free-solid-svg-icons';

// 注册所有需要的图标
library.add(
  faMessage, faHeadset, faBolt, faPlus, 
  faCalendar, faLayerGroup, faUser, faSun,
  faRobot, faLightbulb, faCheck, faMoon,
  faTimes, faCog
);

const app = createApp(App);

// 注册FontAwesome组件
app.component('FontAwesomeIcon', FontAwesomeIcon);

// 注册所有Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(router);
app.use(ElementPlus);
app.mount('#app');