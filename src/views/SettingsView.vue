<template>
  <div class="settings-container" v-if="isMounted">
    <!-- 使用Splitter实现可拖拽分隔面板 -->
    <el-splitter style="height: 100%">
      <!-- 左侧设置导航面板 -->
      <el-splitter-panel :min="180" :max="300" size="220px">
        <div class="settings-sidebar">
          <div class="sidebar-title">
            <i :class="getIconClass('settings')" class="sidebar-icon"></i>
            <span>设置</span>
          </div>
          <!-- 使用sidebarItems配置动态生成侧边栏项 -->
          <div 
            v-for="item in sidebarItems"
            :key="item.section"
            class="sidebar-item" 
            :class="{ active: activeSection === item.section }"
            @click="activeSection = item.section"
          >
            <i :class="getIconClass(item.icon)" class="item-icon"></i>
            <span>{{ item.title }}</span>
          </div>
        </div>
      </el-splitter-panel>
      
      <!-- 右侧设置内容面板 -->
      <el-splitter-panel>
        <div class="settings-content">
          <h1 class="content-title">{{ sectionTitles[activeSection] }}</h1>
          
          <!-- 通用设置区域 -->
          <GeneralSettings v-if="activeSection === 'general'" />

          <!-- API 设置区域 -->
          <ApiSettings v-if="activeSection === 'api'" />

          <!-- 外观设置区域 -->
          <AppearanceSettings v-if="activeSection === 'appearance'" />
          
          <!-- 关于区域 -->
          <AboutSettings v-if="activeSection === 'about'" />
        </div>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useIcon } from '@/composables/useIcon';

// 导入设置组件
import GeneralSettings from '@/components/settings/GeneralSettings.vue';
import ApiSettings from '@/components/settings/ApiSettings.vue';
import AppearanceSettings from '@/components/settings/AppearanceSettings.vue';
import AboutSettings from '@/components/settings/AboutSettings.vue';

const { getIconClass } = useIcon();
const activeSection = ref('general');
const isMounted = ref(true);

// 侧边栏JSON配置（保持在代码中，不存入数据库）
const sidebarItems = [
  {
    section: 'general',
    title: '通用设置',
    icon: 'general'
  },
  {
    section: 'api',
    title: 'API 设置',
    icon: 'key'
  },
  {
    section: 'appearance',
    title: '外观设置',
    icon: 'theme'
  },
  {
    section: 'about',
    title: '关于',
    icon: 'info'
  }
];

const sectionTitles = {
  general: '通用',
  api: 'API 设置',
  appearance: '外观设置',
  about: '关于'
};
</script>

<style scoped>
.settings-container {
  height: 100vh;
  display: flex;
  position: relative;
  overflow: hidden;
}

.settings-sidebar {
  height: 100%;
  width: 100%;
  background-color: var(--sidebar-bg-color, #f5f5f5);
  border-right: 1px solid var(--border-color, #d0d0d0);
  padding: 10px 0;
  overflow: hidden;
}



.sidebar-title {
  padding: 0 20px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--secondary-text-color, #999);
}

.sidebar-icon {
  margin-right: 10px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin: 0 8px 4px 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  border-radius: 8px;
}

.sidebar-item:hover {
  background-color: var(--hover-color, #e9e9e9);
}

.sidebar-item.active {
  background-color: var(--active-color, #e6f7ff);
  font-weight: 500;
}

.item-icon {
  margin-right: 10px;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-content {
  height: 100%;
  width: 100%;
  padding: 30px;
  overflow: hidden;
  background-color: var(--content-bg-color, #ffffff);
  display: flex;
  flex-direction: column;
}



.content-title {
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 30px;
  color: var(--primary-text-color, #333);
  padding-left: 60px; /* 添加左侧间距，与内容对齐 */
}

/* 自定义分隔条样式 */
:deep(.el-splitter__bar) {
  background-color: var(--border-color, #e0e0e0);
}

:deep(.el-splitter__bar:hover) {
  background-color: var(--primary-color, #4a82f0);
}

/* 确保splitter不会产生滚动条 */
:deep(.el-splitter) {
  height: 100%;
  overflow: hidden;
}

:deep(.el-splitter-panel) {
  overflow: hidden;
}
</style>