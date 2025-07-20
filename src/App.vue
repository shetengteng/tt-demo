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
import { useRouter } from 'vue-router';

const router = useRouter();
const { themeAnimationState, completeAnimation } = useGlobalTheme();
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}
</style>