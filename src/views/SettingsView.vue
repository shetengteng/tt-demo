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
          <div 
            class="sidebar-item" 
            :class="{ active: activeSection === 'general' }"
            @click="activeSection = 'general'"
          >
            <i :class="getIconClass('general')" class="item-icon"></i>
            <span>通用设置</span>
          </div>
          <div 
            class="sidebar-item" 
            :class="{ active: activeSection === 'api' }"
            @click="activeSection = 'api'"
          >
            <i :class="getIconClass('key')" class="item-icon"></i>
            <span>API 设置</span>
          </div>
          <div 
            class="sidebar-item" 
            :class="{ active: activeSection === 'appearance' }"
            @click="activeSection = 'appearance'"
          >
            <i :class="getIconClass('theme')" class="item-icon"></i>
            <span>外观设置</span>
          </div>
          <div 
            class="sidebar-item" 
            :class="{ active: activeSection === 'about' }"
            @click="activeSection = 'about'"
          >
            <i :class="getIconClass('info')" class="item-icon"></i>
            <span>关于</span>
          </div>
        </div>
      </el-splitter-panel>
      
      <!-- 右侧设置内容面板 -->
      <el-splitter-panel>
        <div class="settings-content">
          <h1 class="content-title">{{ sectionTitles[activeSection] }}</h1>
          
          <!-- 通用设置区域 -->
          <div v-if="activeSection === 'general'" class="settings-section">
            <div class="settings-block">
              <div class="block-header">
                <h2>帐户管理</h2>
                <p class="block-description">管理您的帐户和账单</p>
              </div>
              <div class="block-content">
                <el-button type="primary" class="right-button">打开</el-button>
              </div>
            </div>
            
            <div class="settings-block">
              <div class="block-header">
                <h2>团队成员邀请</h2>
                <p class="block-description">加速开发、共享知识，跨团队建立上下文</p>
              </div>
              <div class="block-content">
                <el-button type="primary" class="right-button">
                  <i :class="getIconClass('user_plus')" style="margin-right: 5px;"></i>
                  邀请
                </el-button>
              </div>
            </div>
          </div>

          <!-- API 设置区域 -->
          <div v-if="activeSection === 'api'" class="settings-section">
            <div class="settings-block">
              <div class="block-header">
                <h2>DeepSeek API 设置</h2>
                <p class="block-description">配置您的API访问凭据</p>
              </div>
              <div class="block-content form-content">
                <el-form label-position="top">
                  <el-form-item label="DeepSeek API 密钥">
                    <el-input
                      v-model="apiKey"
                      placeholder="请输入你的DeepSeek API密钥"
                      type="password"
                      show-password
                    ></el-input>
                  </el-form-item>
                  
                  <el-form-item label="选择模型">
                    <el-select v-model="selectedModel" placeholder="请选择AI模型" style="width:100%">
                      <el-option
                        v-for="model in availableModels"
                        :key="model.value"
                        :label="model.label"
                        :value="model.value"
                      />
                    </el-select>
                  </el-form-item>

                  <el-form-item>
                    <el-button type="primary" @click="saveSettings">保存设置</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </div>

          <!-- 外观设置区域 -->
          <div v-if="activeSection === 'appearance'" class="settings-section">
            <div class="settings-block">
              <div class="block-header">
                <h2>主题设置</h2>
                <p class="block-description">设置应用外观</p>
              </div>
              <div class="block-content">
                <div class="setting-item">
                  <span class="setting-label">深色模式</span>
                  <el-switch v-model="darkMode"></el-switch>
                </div>
              </div>
            </div>
            
            <div class="settings-block">
              <div class="block-header">
                <h2>编辑器设置</h2>
                <p class="block-description">配置字体、格式化、迷你地图等</p>
              </div>
              <div class="block-content">
                <el-button type="default" class="right-button">打开</el-button>
              </div>
            </div>
            
            <div class="settings-block">
              <div class="block-header">
                <h2>键盘快捷键</h2>
                <p class="block-description">配置键盘快捷键</p>
              </div>
              <div class="block-content">
                <el-button type="default" class="right-button">打开</el-button>
              </div>
            </div>
          </div>
          
          <!-- 关于区域 -->
          <div v-if="activeSection === 'about'" class="settings-section">
            <div class="settings-block">
              <div class="block-header">
                <h2>关于应用</h2>
                <p class="block-description">版本信息和帮助</p>
              </div>
              <div class="block-content">
                <p>版本: 1.0.0</p>
                <p>©2024 AI Chat Desktop</p>
              </div>
            </div>
          </div>
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

const { getIconClass } = useIcon();
const apiKey = ref('');
const selectedModel = ref('deepseek-chat');
const { darkMode } = useGlobalTheme();
const activeSection = ref('general');
const isMounted = ref(true);

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

const saveSettings = () => {
  if (!apiKey.value.trim()) {
    ElMessage.warning('请输入有效的API密钥');
    return;
  }

  localStorage.setItem('apiKey', apiKey.value);
  localStorage.setItem('selectedModel', selectedModel.value);
  ElMessage.success('设置已保存');
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
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

.settings-block {
  border-radius: 8px;
  border: 1px solid var(--border-color, #e0e0e0);
  background-color: var(--card-bg-color, #fafafa);
  overflow: hidden;
  width: 100%;
}

.block-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.block-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--primary-text-color, #333);
}

.block-description {
  margin: 5px 0 0;
  font-size: 14px;
  color: var(--secondary-text-color, #666);
}

.block-content {
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-content {
  display: block;
}

.right-button {
  margin-left: auto;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.setting-label {
  font-size: 14px;
}

/* 自定义分隔条样式 */
:deep(.el-splitter__bar) {
  background-color: var(--border-color, #e0e0e0);
}

:deep(.el-splitter__bar:hover) {
  background-color: var(--primary-color, #4a82f0);
}

:deep(.el-form) {
  width: 100%;
  max-width: 100%;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
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