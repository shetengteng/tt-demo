<template>
  <el-container style="height: 100vh;">
    <!-- 替换为新的侧边栏 -->
    <ChatSidebar />
    
    <el-container>
      <el-main style="padding: 0;">
        <router-view />
      </el-main>
    </el-container>
    
    <!-- 主题切换动画组件 -->
    <ThemeTransition 
      :is-animating="themeAnimationState.isAnimating"
      :click-position="themeAnimationState.clickPosition"
      :is-dark-mode="themeAnimationState.targetTheme"
      @animation-complete="completeAnimation"
    />
  </el-container>
</template>

<script setup>
import ChatSidebar from './components/ChatSidebar.vue';
import ThemeTransition from './components/ThemeTransition.vue';
import { useGlobalTheme } from './composables/useGlobalTheme';
import { useAppInitializer } from './composables/useAppInitializer';
import { useRouter } from 'vue-router';
import { onMounted, onUnmounted } from 'vue';

const router = useRouter();
const { themeAnimationState, completeAnimation } = useGlobalTheme();
const { initializeApp, cleanupApp } = useAppInitializer();

// 应用启动时初始化全局状态
onMounted(async () => {
  try {
    await initializeApp();
  } catch (error) {
    console.error('应用启动失败:', error);
  }
});

// 应用关闭时清理全局状态
onUnmounted(() => {
  cleanupApp();
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}

/* 全局 Element UI 主题适配 */
.el-message {
  background-color: var(--card-bg, #f5f5f5) !important;
  border-color: var(--border-color, #d0d0d0) !important;
  color: var(--text-color, #000000) !important;
}

.el-message--success {
  background-color: #f0f9ff !important;
  border-color: #4a82f0 !important;
  color: #1e40af !important;
}

.el-message--warning {
  background-color: #fffbeb !important;
  border-color: #f59e0b !important;
  color: #92400e !important;
}

.el-message--error {
  background-color: #fef2f2 !important;
  border-color: #ef4444 !important;
  color: #dc2626 !important;
}

/* Dark theme message overrides */
.dark-theme .el-message {
  background-color: var(--card-bg, #3a3a3a) !important;
  border-color: var(--border-color, #666666) !important;
  color: var(--text-color, #d0d0d0) !important;
}

.dark-theme .el-message--success {
  background-color: rgba(74, 130, 240, 0.1) !important;
  border-color: #4a82f0 !important;
  color: #93c5fd !important;
}

.dark-theme .el-message--warning {
  background-color: rgba(245, 158, 11, 0.1) !important;
  border-color: #f59e0b !important;
  color: #fcd34d !important;
}

.dark-theme .el-message--error {
  background-color: rgba(239, 68, 68, 0.1) !important;
  border-color: #ef4444 !important;
  color: #fca5a5 !important;
}

/* Dialog 主题适配 */
.el-dialog {
  background-color: var(--card-bg, #f5f5f5) !important;
  border-color: var(--border-color, #d0d0d0) !important;
}

.el-dialog__header {
  background-color: var(--card-bg, #f5f5f5) !important;
  border-bottom-color: var(--border-color, #d0d0d0) !important;
}

.el-dialog__title {
  color: var(--text-color, #000000) !important;
}

.el-dialog__body {
  color: var(--text-color, #000000) !important;
}

/* Dark theme dialog overrides */
.dark-theme .el-dialog {
  background-color: var(--card-bg, #3a3a3a) !important;
  border-color: var(--border-color, #666666) !important;
}

.dark-theme .el-dialog__header {
  background-color: var(--card-bg, #3a3a3a) !important;
  border-bottom-color: var(--border-color, #666666) !important;
}

.dark-theme .el-dialog__title {
  color: var(--text-color, #d0d0d0) !important;
}

.dark-theme .el-dialog__body {
  color: var(--text-color, #d0d0d0) !important;
}

/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background-color: var(--card-bg, #f5f5f5);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background-color: var(--border-color, #d0d0d0);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--secondary-text-color, #999);
}

::-webkit-scrollbar-corner {
  background-color: var(--card-bg, #f5f5f5);
}

/* Dark theme scrollbar overrides */
.dark-theme ::-webkit-scrollbar-track {
  background-color: var(--card-bg, #3a3a3a);
}

.dark-theme ::-webkit-scrollbar-thumb {
  background-color: var(--border-color, #666666);
}

.dark-theme ::-webkit-scrollbar-thumb:hover {
  background-color: var(--secondary-text-color, #a0a0a0);
}

.dark-theme ::-webkit-scrollbar-corner {
  background-color: var(--card-bg, #3a3a3a);
}

/* Firefox scrollbar styles */
* {
  scrollbar-width: thin;
  scrollbar-color: var(--border-color, #d0d0d0) var(--card-bg, #f5f5f5);
}

.dark-theme * {
  scrollbar-color: var(--border-color, #666666) var(--card-bg, #3a3a3a);
}
</style>