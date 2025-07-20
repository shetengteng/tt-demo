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
          <ApiSettings 
            v-if="activeSection === 'api'" 
            :initial-api-key="apiKey"
            :initial-model="selectedModel"
            @save="handleApiSettingsSave"
          />

          <!-- 外观设置区域 -->
          <AppearanceSettings 
            v-if="activeSection === 'appearance'" 
            v-model:dark-mode="darkMode"
          />
          
          <!-- 关于区域 -->
          <AboutSettings v-if="activeSection === 'about'" />
        </div>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useGlobalTheme } from '@/composables/useGlobalTheme';
import { availableModels } from '@/utils/api';
import { useIcon } from '@/composables/useIcon';

// 导入设置组件
import GeneralSettings from '@/components/settings/GeneralSettings.vue';
import ApiSettings from '@/components/settings/ApiSettings.vue';
import AppearanceSettings from '@/components/settings/AppearanceSettings.vue';
import AboutSettings from '@/components/settings/AboutSettings.vue';

const { getIconClass } = useIcon();
const apiKey = ref('');
const selectedModel = ref('deepseek-chat');
const { darkMode } = useGlobalTheme();
const activeSection = ref('general');
const isMounted = ref(true);

// 侧边栏JSON配置
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

onMounted(() => {
  // 加载已保存的设置
  const savedKey = localStorage.getItem('apiKey');
  if (savedKey) apiKey.value = savedKey;
  
  // 加载保存的模型选择
  const savedModel = localStorage.getItem('selectedModel');
  if (savedModel) selectedModel.value = savedModel;
});

const handleApiSettingsSave = (settings) => {
  apiKey.value = settings.apiKey;
  selectedModel.value = settings.selectedModel;
};
</script>

<style scoped>
.settings-container {
  height: 100%;
  display: flex;
  position: relative;
  overflow: hidden;
}

.settings-sidebar {
  height: 100%;
  width: 100%;
  background-color: var(--sidebar-bg-color, #f5f5f5);
  border-right: 1px solid var(--border-color, #e0e0e0);
  padding: 20px 0;
  overflow-y: auto;
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* 隐藏webkit浏览器的滚动条 */
.settings-sidebar::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.sidebar-title {
  padding: 0 20px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

.sidebar-icon {
  margin-right: 10px;
}

.sidebar-item {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
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
  overflow-y: auto;
  background-color: var(--content-bg-color, #ffffff);
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* 隐藏webkit浏览器的滚动条 */
.settings-content::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
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

/* 全局滚动条隐藏，也影响到可能的嵌套元素 */
:deep(*::-webkit-scrollbar) {
  display: none;
  width: 0;
  height: 0;
}

:deep(*) {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>