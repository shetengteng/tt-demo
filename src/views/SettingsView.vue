<template>
  <div class="settings-container">
    <el-card title="主题设置">
        <el-form-item label="深色模式">
          <el-switch v-model="darkMode"></el-switch>
        </el-form-item>
      </el-card>

      <el-card title="API 设置" style="margin-top: 20px;">
      <el-form label-width="120px">
        <el-form-item label="DeepSeek API 密钥">
          <el-input
            v-model="apiKey"
            placeholder="请输入你的DeepSeek API密钥"
            type="password"
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item label="选择模型">
          <el-select v-model="selectedModel" placeholder="请选择AI模型">
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
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { useGlobalTheme } from '@/composables/useGlobalTheme';
import { availableModels } from '@/utils/api';

const apiKey = ref('');
const selectedModel = ref('deepseek-chat');
const { darkMode } = useGlobalTheme();

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
  padding: 20px;
}
</style>