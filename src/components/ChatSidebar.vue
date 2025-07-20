<template>
  <div class="chat-sidebar">
    <!-- 图标菜单项 -->
    <div class="sidebar-icons">
      <!-- 顶部图标组 -->
      <div class="icon-group top">
        <!-- 蓝色圆形图标 -->
        <div class="sidebar-icon blue-circle">
          <div class="circle"></div>
        </div>
        
        <!-- 聊天图标 - 确保这个是active的状态 -->
        <div class="sidebar-icon" :class="{ active: currentRoute === '/' || currentRoute === '/chat' }" @click="navigateTo('/chat')">
          <div class="icon-bg">
            <FontAwesomeIcon icon="message" />
          </div>
        </div>
        
        <!-- 耳机图标 -->
        <div class="sidebar-icon" :class="{ active: currentRoute === '/support' }" @click="navigateTo('/support')">
          <FontAwesomeIcon icon="headset" />
        </div>
        
        <!-- 闪电图标 -->
        <div class="sidebar-icon" :class="{ active: currentRoute === '/actions' }" @click="navigateTo('/actions')">
          <FontAwesomeIcon icon="bolt" />
        </div>
        
        <!-- 加号图标 -->
        <div class="sidebar-icon" @click="createNewChat">
          <FontAwesomeIcon icon="plus" />
        </div>
        
        <!-- 日历图标 -->
        <div class="sidebar-icon" :class="{ active: currentRoute === '/calendar' }" @click="navigateTo('/calendar')">
          <FontAwesomeIcon icon="calendar" />
        </div>
        
        <!-- 设置图标 -->
        <div class="sidebar-icon" :class="{ active: currentRoute === '/settings' }" @click="navigateTo('/settings')">
          <FontAwesomeIcon icon="cog" />
        </div>
      </div>
      
      <!-- 底部图标组 -->
      <div class="icon-group bottom">
        <!-- 用户图标带New标记 -->
        <div class="sidebar-icon" :class="{ active: currentRoute === '/profile' }" @click="navigateTo('/profile')">
          <FontAwesomeIcon icon="user" />
          <span class="new-badge">New</span>
        </div>
        
        <!-- 主题切换图标 -->
        <div class="sidebar-icon theme-toggle" @click="toggleTheme">
          <FontAwesomeIcon :icon="darkMode ? 'moon' : 'sun'" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useGlobalTheme } from '../composables/useGlobalTheme';
import { useRouter } from 'vue-router';

const router = useRouter();
const { toggleTheme, currentTheme, darkMode } = useGlobalTheme();

// 获取当前路由
const currentRoute = computed(() => router.currentRoute.value.path);

// 导航函数
const navigateTo = (path) => {
  router.push(path);
};

// 创建新聊天
const createNewChat = () => {
  // 模拟创建新聊天的操作
  router.push('/chat');
};
</script>

<style scoped>
.chat-sidebar {
  width: 60px;
  height: 100%;
  background-color: var(--sidebar-bg-color, #ffffff);
  border-right: 1px solid var(--border-color, #f0f0f0);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
}

.sidebar-icons {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  justify-content: space-between;
}

.icon-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.top {
  margin-top: 10px;
}

.bottom {
  margin-bottom: 20px;
}

.sidebar-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: relative;
  color: var(--icon-color, #666);
  font-size: 16px;
  transition: all 0.2s ease;
}

.sidebar-icon:hover {
  color: var(--primary-color, #4a82f0);
  transform: scale(1.05);
}

.sidebar-icon.active .icon-bg {
  background-color: #000020;
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.blue-circle .circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #6496ff, #4a7cf0);
}

.new-badge {
  position: absolute;
  bottom: -5px;
  right: -5px;
  background-color: #4a7cf0;
  color: white;
  font-size: 8px;
  padding: 2px 4px;
  border-radius: 8px;
  font-weight: bold;
}

.theme-toggle {
  margin-top: 20px;
}
</style> 