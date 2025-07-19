<template>
  <div class="settings-container">
    <el-card title="主题设置">
        <el-form-item label="深色模式">
          <el-switch v-model="darkMode" @change="toggleTheme"></el-switch>
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
        <el-form-item>
          <el-button type="primary" @click="saveApiKey">保存设置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { ElMessage } from 'element-plus';

const apiKey = ref('');
const darkMode = ref(false);

onMounted(() => {
  // 加载已保存的设置
  const savedKey = localStorage.getItem('apiKey');
  if (savedKey) apiKey.value = savedKey;

  const savedTheme = localStorage.getItem('darkMode');
  if (savedTheme) {
    darkMode.value = savedTheme === 'true';
    applyTheme();
  }
});

const applyTheme = () => {
  if (darkMode.value) {
    document.documentElement.classList.add('dark-theme');
  } else {
    document.documentElement.classList.remove('dark-theme');
  }
};

const toggleTheme = () => {
  localStorage.setItem('darkMode', darkMode.value);
  applyTheme();
};

const saveApiKey = () => {
  if (!apiKey.value.trim()) {
    ElMessage.warning('请输入有效的API密钥');
    return;
  }

  localStorage.setItem('apiKey', apiKey.value);
  ElMessage.success('API密钥已保存');
};
</script>

<style scoped>
.settings-container {
  padding: 20px;
}

.el-card {
  max-width: 600px;
  margin: 0 auto;
}
</style>