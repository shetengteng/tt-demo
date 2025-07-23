<template>
  <div class="input-area">
    <div class="input-row">
      <el-input
        v-model="inputMessage"
        placeholder="What are the best open oppor"
        @keyup.enter="sendMessage"
        class="message-input"
      ></el-input>
    </div>
    <div class="action-row">
      <el-select
        v-model="selectedModel"
        placeholder="Select Source"
        class="source-selector"
        @change="changeModel"
      >
        <el-option
          v-for="model in availableModels"
          :key="model.value"
          :label="model.label"
          :value="model.value"
        />
      </el-select>
      <div class="button-group">
        <el-button class="action-btn" plain>
          <i :class="getIconClass('attachment')"></i>
          Attach
        </el-button>
        <el-button class="action-btn" plain>
          <i :class="getIconClass('mic')"></i>
          Voice
        </el-button>
        <el-button type="primary" class="send-btn" @click="sendMessage">
          <i :class="getIconClass('send')"></i>
          Send
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { availableModels } from '@/utils/api.js'
  import { useIcon } from '@/composables/useIcon.js'

  const { getIconClass } = useIcon()
  const inputMessage = ref('')
  const selectedModel = ref('')
  const emit = defineEmits(['send-message', 'change-model'])

  // 初始化时获取当前选择的模型
  onMounted(() => {
    const savedModel = localStorage.getItem('selectedModel') || 'deepseek-chat'
    selectedModel.value = savedModel
  })

  const sendMessage = () => {
    if (!inputMessage.value.trim()) return
    emit('send-message', inputMessage.value)
    inputMessage.value = ''
  }

  const changeModel = () => {
    localStorage.setItem('selectedModel', selectedModel.value)
    emit('change-model', selectedModel.value)
  }
</script>

<style scoped>
  .input-area {
    padding: 16px;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--chat-bg-color, #ffffff);
    border-radius: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
  }

  .input-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
  }

  .source-selector {
    width: 160px;
    border-radius: 12px;
  }

  .message-input {
    flex: 1;
  }

  .action-row {
    display: flex;
    gap: 12px;
    justify-content: space-between;
    align-items: center;
  }

  .button-group {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    border-radius: 12px;
    padding: 8px 16px;
    background-color: transparent;
  }

  .action-btn i {
    font-size: 18px;
  }

  .send-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    border-radius: 12px;
    padding: 8px 16px;
    background-color: #000033;
  }

  .send-btn i {
    font-size: 18px;
  }

  /* Element UI 主题适配 */
  :deep(.el-input__wrapper) {
    background-color: var(--card-bg, #f5f5f5);
    border-color: transparent;
    border-radius: 12px;
    box-shadow: none;
  }

  :deep(.el-input__inner) {
    color: var(--text-color, #000000);
    background-color: transparent;
    font-size: 14px;
  }

  :deep(.el-input__inner::placeholder) {
    color: var(--secondary-text-color, #999);
  }

  :deep(.el-select__wrapper) {
    background-color: var(--card-bg, #f5f5f5);
    border-color: transparent;
    border-radius: 12px;
    box-shadow: none;
  }

  :deep(.el-button) {
    border: 1px solid #e0e0e0;
    font-weight: 500;
  }

  :deep(.el-button--primary) {
    background-color: #000033;
    border-color: #000033;
    color: white;
  }

  :deep(.el-button--primary:hover) {
    background-color: #000066;
    border-color: #000066;
  }

  /* Dark theme overrides */
  .dark-theme :deep(.el-input__wrapper) {
    background-color: var(--card-bg, #3a3a3a);
    color: var(--text-color, #d0d0d0);
  }

  .dark-theme :deep(.el-input__inner) {
    color: var(--text-color, #d0d0d0);
  }

  .dark-theme :deep(.el-select__wrapper) {
    background-color: var(--card-bg, #3a3a3a);
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
