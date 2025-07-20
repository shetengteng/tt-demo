<template>
  <div class="settings-section">
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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { availableModels } from '@/utils/api';

const props = defineProps({
  initialApiKey: {
    type: String,
    default: ''
  },
  initialModel: {
    type: String,
    default: 'deepseek-chat'
  }
});

const emit = defineEmits(['save']);

const apiKey = ref(props.initialApiKey);
const selectedModel = ref(props.initialModel);

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
  
  emit('save', {
    apiKey: apiKey.value,
    selectedModel: selectedModel.value
  });
  
  ElMessage.success('设置已保存');
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

.form-content {
  display: block;
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

/* 深色模式表单样式优化 */
:deep(.dark-theme .el-input__inner) {
  background-color: var(--card-bg);
  border-color: var(--border-color);
  color: var(--text-color);
}

:deep(.dark-theme .el-select__wrapper) {
  background-color: var(--card-bg);
}

:deep(.dark-theme .el-form-item__label) {
  color: var(--text-color);
}

:deep(.dark-theme .el-button--default) {
  background-color: var(--card-bg);
  border-color: var(--border-color);
  color: var(--text-color);
}
</style> 