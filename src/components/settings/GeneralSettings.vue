<template>
  <div class="settings-section">
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

    <el-button type="primary" @click="saveSettings">
      保存设置
    </el-button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useIcon } from '@/composables/useIcon';
import { saveConfig, getConfig } from '@/utils/db';
import { ElMessage } from 'element-plus';

const { getIconClass } = useIcon();
const settings = ref({
  // 默认设置值
  accountEnabled: true,
  teamInvitesEnabled: true
});

// 在组件加载时获取设置
onMounted(async () => {
  try {
    const savedSettings = await getConfig('generalSettings', null);
    if (savedSettings) {
      settings.value = { ...settings.value, ...savedSettings };
    }
  } catch (error) {
    console.error('加载通用设置失败:', error);
  }
});

// 保存设置
const saveSettings = async () => {
  try {
    await saveConfig('generalSettings', settings.value);
    ElMessage.success('通用设置已保存');
  } catch (error) {
    console.error('保存通用设置失败:', error);
    ElMessage.error('保存设置失败');
  }
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
</style> 