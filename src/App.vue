<template>
  <el-container class="app-container">
    <!-- 替换为新的侧边栏 -->
    <ChatSidebar />

    <el-container>
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>

    <!-- 主题切换动画组件 -->
    <ThemeTransition />
  </el-container>
</template>

<script setup>
import ChatSidebar from './components/ChatSidebar.vue'
import ThemeTransition from './components/ThemeTransition.vue'
import { useAppInitializer } from './composables/useAppInitializer'
import { onMounted, onUnmounted } from 'vue'

const { initializeApp, cleanupApp } = useAppInitializer()

// 应用启动时初始化全局状态
onMounted(async () => {
  try {
    await initializeApp()
  } catch (error) {
    console.error('应用启动失败:', error)
  }
})

// 应用关闭时清理全局状态
onUnmounted(() => {
  cleanupApp()
})
</script>

<style>
@import './styles/global.css';

.app-container {
  height: 100vh;
}

.main-content {
  padding: 0 !important;
}
</style>
