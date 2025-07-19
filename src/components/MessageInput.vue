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
</style>