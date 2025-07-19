import { createRouter, createWebHashHistory } from 'vue-router';
import ChatView from '../views/ChatView.vue';
import SettingsView from '../views/SettingsView.vue';

const routes = [
  { path: '/', redirect: '/chat' },
  { path: '/chat', component: ChatView, name: 'Chat' },
  { path: '/settings', component: SettingsView, name: 'Settings' }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

export default router;