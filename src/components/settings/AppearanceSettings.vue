<template>
  <div class="settings-section">
    <div class="settings-block">
      <div class="block-header">
        <h2>主题设置</h2>
        <p class="block-description">设置应用外观</p>
      </div>
      <div class="block-content">
        <div class="setting-item">
          <span class="setting-label">深色模式</span>
          <el-switch v-model="darkModeValue" @change="handleThemeToggle"></el-switch>
        </div>
      </div>
    </div>
    
    <div class="settings-block">
      <div class="block-header">
        <h2>编辑器设置</h2>
        <p class="block-description">配置字体、格式化、迷你地图等</p>
      </div>
      <div class="block-content">
        <el-button type="default" class="right-button" @click="saveSettings">保存设置</el-button>
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGlobalTheme } from '@/composables/useGlobalTheme';
import { saveConfig, getConfig } from '@/utils/db';
import { ElMessage } from 'element-plus';

const { darkMode, setTheme } = useGlobalTheme();
const darkModeValue = ref(darkMode.value);
const editorSettings = ref({
  fontSize: 14,
  fontFamily: 'Consolas, "Courier New", monospace',
  minimap: true,
  wordWrap: false
});

// 在组件加载时获取设置
onMounted(async () => {
  try {
    // 从数据库加载外观设置
    const savedSettings = await getConfig('appearanceSettings', null);
    if (savedSettings) {
      if (savedSettings.editorSettings) {
        editorSettings.value = { ...editorSettings.value, ...savedSettings.editorSettings };
      }
      
      // 处理暗黑模式设置
      if (savedSettings.darkMode !== undefined) {
        darkModeValue.value = savedSettings.darkMode;
        setTheme(savedSettings.darkMode);
      }
    }
  } catch (error) {
    console.error('加载外观设置失败:', error);
  }
});

// 切换暗黑模式
const handleThemeToggle = async (value) => {
  // 获取开关元素的位置
  const switchElement = document.querySelector('.el-switch');
  if (switchElement) {
    const rect = switchElement.getBoundingClientRect();
    const event = {
      currentTarget: switchElement
    };
    setTheme(value, event);
  } else {
    setTheme(value);
  }
  // 延迟保存设置，等待动画完成
  await saveSettingsToDb();
};

// 保存设置
const saveSettings = async () => {
  await saveSettingsToDb();
  ElMessage.success('外观设置已保存');
};

// 保存设置到数据库
const saveSettingsToDb = async () => {
  try {
    const settings = {
      darkMode: darkModeValue.value,
      editorSettings: editorSettings.value
    };
    await saveConfig('appearanceSettings', settings);
    
    // 为了向后兼容，也保存到localStorage
    localStorage.setItem('darkMode', darkModeValue.value.toString());
  } catch (error) {
    console.error('保存外观设置失败:', error);
    ElMessage.error('保存设置失败');
    return false;
  }
  return true;
};
</script>

<style scoped>
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

/* 深色模式按钮样式优化 */
:deep(.dark-theme .el-button--default) {
  background-color: var(--card-bg);
  border-color: var(--border-color);
  color: var(--text-color);
}
</style> 