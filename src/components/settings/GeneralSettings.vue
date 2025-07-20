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
  </div>
</template>

<script setup>
import { useIcon } from '@/composables/useIcon';

const { getIconClass } = useIcon();
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