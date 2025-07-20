<template>
  <div class="input-area">
    <div class="top-controls">
      <el-select 
        v-model="selectedModel" 
        size="small" 
        placeholder="选择模型"
        @change="changeModel"
        class="model-selector">
        <el-option
          v-for="model in availableModels"
          :key="model.value"
          :label="model.label"
          :value="model.value"
        />
      </el-select>
    </div>
    <div class="input-controls">
      <el-input
        v-model="inputMessage"
        placeholder="输入消息..."
        @keyup.enter="sendMessage"
      ></el-input>
      <el-button type="primary" @click="sendMessage">发送</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { availableModels } from '@/utils/api';

const inputMessage = ref('');
const selectedModel = ref('');
const emit = defineEmits(['send-message', 'change-model']);

// 初始化时获取当前选择的模型
onMounted(() => {
  const savedModel = localStorage.getItem('selectedModel') || 'deepseek-chat';
  selectedModel.value = savedModel;
});

const sendMessage = () => {
  if (!inputMessage.value.trim()) return;
  emit('send-message', inputMessage.value);
  inputMessage.value = '';
};

const changeModel = () => {
  localStorage.setItem('selectedModel', selectedModel.value);
  emit('change-model', selectedModel.value);
};
</script>

<style scoped>
.input-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--chat-bg-color, #ffffff);
}

.top-controls {
  display: flex;
  justify-content: flex-end;
}

.model-selector {
  width: 180px;
}

.input-controls {
  display: flex;
  gap: 8px;
}

.el-input {
  flex: 1;
}

/* Element UI 主题适配 */
:deep(.el-input__wrapper) {
  background-color: var(--card-bg, #f5f5f5);
  border-color: var(--border-color, #d0d0d0);
  color: var(--text-color, #000000);
}

:deep(.el-input__inner) {
  color: var(--text-color, #000000);
  background-color: transparent;
}

:deep(.el-input__inner::placeholder) {
  color: var(--secondary-text-color, #999);
}

:deep(.el-select__wrapper) {
  background-color: var(--card-bg, #f5f5f5);
  border-color: var(--border-color, #d0d0d0);
  color: var(--text-color, #000000);
}

:deep(.el-select__inner) {
  color: var(--text-color, #000000);
  background-color: transparent;
}

:deep(.el-button--primary) {
  background-color: var(--primary-color, #4a82f0);
  border-color: var(--primary-color, #4a82f0);
  color: white;
}

:deep(.el-button--primary:hover) {
  background-color: var(--new-chat-hover-bg, #0056cc);
  border-color: var(--new-chat-hover-bg, #0056cc);
}

/* Dark theme overrides */
.dark-theme :deep(.el-input__wrapper) {
  background-color: var(--card-bg, #3a3a3a);
  border-color: var(--border-color, #666666);
  color: var(--text-color, #d0d0d0);
}

.dark-theme :deep(.el-input__inner) {
  color: var(--text-color, #d0d0d0);
}

.dark-theme :deep(.el-select__wrapper) {
  background-color: var(--card-bg, #3a3a3a);
  border-color: var(--border-color, #666666);
  color: var(--text-color, #d0d0d0);
}

.dark-theme :deep(.el-select__inner) {
  color: var(--text-color, #d0d0d0);
}

.dark-theme :deep(.el-select-dropdown) {
  background-color: var(--card-bg, #3a3a3a);
  border-color: var(--border-color, #666666);
}

.dark-theme :deep(.el-select-dropdown__item) {
  color: var(--text-color, #d0d0d0);
}

.dark-theme :deep(.el-select-dropdown__item:hover) {
  background-color: var(--hover-color, #444444);
}

.dark-theme :deep(.el-select-dropdown__item.selected) {
  background-color: var(--primary-color, #4a82f0);
  color: white;
}
</style>