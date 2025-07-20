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
        <div class="sidebar-icon" :class="{ active: currentRoute === '/' || currentRoute === '/chat' }"
             @click="navigateTo('/chat')">
          <div class="icon-bg">
            <i :class="getIconClass('message')"></i>
          </div>
        </div>

        <!--        &lt;!&ndash; 耳机图标 &ndash;&gt;-->
        <!--        <div class="sidebar-icon" :class="{ active: currentRoute === '/support' }" @click="navigateTo('/support')">-->
        <!--          <i :class="getIconClass('headset')"></i>-->
        <!--        </div>-->
        <!--        -->
        <!--        &lt;!&ndash; 闪电图标 &ndash;&gt;-->
        <!--        <div class="sidebar-icon" :class="{ active: currentRoute === '/actions' }" @click="navigateTo('/actions')">-->
        <!--          <i :class="getIconClass('bolt')"></i>-->
        <!--        </div>-->
        <!--        -->
        <!--        &lt;!&ndash; 加号图标 &ndash;&gt;-->
        <!--        <div class="sidebar-icon" @click="createNewChat">-->
        <!--          <i :class="getIconClass('plus')"></i>-->
        <!--        </div>-->
        <!--        -->
        <!--        &lt;!&ndash; 日历图标 &ndash;&gt;-->
        <!--        <div class="sidebar-icon" :class="{ active: currentRoute === '/calendar' }" @click="navigateTo('/calendar')">-->
        <!--          <i :class="getIconClass('calendar')"></i>-->
        <!--        </div>-->

        <!-- 设置图标 -->
        <div class="sidebar-icon" :class="{ active: currentRoute === '/settings' }" @click="navigateTo('/settings')">
          <div class="icon-bg">
            <i :class="getIconClass('cog')"></i>
          </div>
        </div>
      </div>

      <!-- 底部图标组 -->
      <div class="icon-group bottom">
        <!--        &lt;!&ndash; 用户图标带New标记 &ndash;&gt;-->
        <!--        <div class="sidebar-icon" :class="{ active: currentRoute === '/profile' }" @click="navigateTo('/profile')">-->
        <!--          <i :class="getIconClass('user')"></i>-->
        <!--          <span class="new-badge">New</span>-->
        <!--        </div>-->

        <!-- 主题切换图标 -->
        <div class="sidebar-icon theme-toggle" @click="handleThemeToggle">
          <i :class="themeIcon"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {computed} from 'vue';
import {useGlobalTheme} from '../composables/useGlobalTheme';
import {useRouter} from 'vue-router';
import {useIcon} from '../composables/useIcon';

const router = useRouter();
const {toggleTheme, currentTheme} = useGlobalTheme();
const {getIconClass, themeIcon} = useIcon();

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

// 处理主题切换
const handleThemeToggle = (event) => {
  toggleTheme(event);
};
</script>

<style scoped>
.chat-sidebar {
  width: 60px;
  height: 100%;
  background-color: var(--sidebar-bg-color, #ffffff);
  border-right: 1px solid var(--border-color, #d0d0d0);
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
  font-size: 18px;
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

.remix-icon {
  display: inline-flex;
  justify-content: center;
  align-items: center;
}
</style> 