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
          <el-switch v-model="darkModeValue" @change="toggleDarkMode"></el-switch>
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
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  darkMode: {
    type: Boolean,
    required: true
  }
});

const emit = defineEmits(['update:darkMode']);

const darkModeValue = ref(props.darkMode);

watch(() => props.darkMode, (newValue) => {
  darkModeValue.value = newValue;
});

const toggleDarkMode = () => {
  emit('update:darkMode', darkModeValue.value);
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