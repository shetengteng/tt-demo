import { createRouter, createWebHashHistory } from 'vue-router'
import ChatView from '@/views/chat/index.vue'
import SettingsView from '@/views/settings/index.vue'
import KnowledgeView from '@/views/knowledge/index.vue'

// 创建一个简单的空白组件用于暂未实现的功能
const EmptyView = {
  template:
    '<div class="empty-view"><h2>功能开发中</h2><p>此功能正在开发中，敬请期待！</p></div>',
  name: 'EmptyView',
}

const routes = [
  { path: '/', redirect: '/chat' },
  { path: '/chat', component: ChatView, name: 'Chat' },
  { path: '/knowledge', component: KnowledgeView, name: 'Knowledge' },
  { path: '/settings', component: SettingsView, name: 'Settings' },
  { path: '/support', component: EmptyView, name: 'Support' },
  { path: '/actions', component: EmptyView, name: 'Actions' },
  { path: '/calendar', component: EmptyView, name: 'Calendar' },
  { path: '/layers', component: EmptyView, name: 'Layers' },
  { path: '/profile', component: EmptyView, name: 'Profile' },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
