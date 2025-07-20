<template>
  <el-container style="height: 100vh;">
    <!-- 替换为新的侧边栏 -->
    <ChatSidebar />
    
    <el-container>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import ChatSidebar from './components/ChatSidebar.vue';
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
}
</style>