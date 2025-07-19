<template>
  <el-container style="height: 100vh;">
    <el-aside width="200px" style="background-color: #001529;">
      <el-menu
        default-active="/chat"
        class="el-menu-vertical-demo"
        background-color="#001529"
        text-color="#fff"
        active-text-color="#ffd04b"
        :router="true"
      >
        <el-menu-item index="chat">
          <el-icon><Message /></el-icon>
          <template #title>聊天</template>
        </el-menu-item>
        <el-menu-item index="settings">
          <el-icon><Setting /></el-icon>
          <template #title>设置</template>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { Message, Setting } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';
const router = useRouter();
</script>

<style>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
}
</style>