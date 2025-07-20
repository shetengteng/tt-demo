<template>
  <div class="settings-section">
    <div class="settings-block">
      <div class="block-header">
        <h2>关于应用</h2>
        <p class="block-description">版本信息和帮助</p>
      </div>
      <div class="block-content about-content">
        <p><strong>版本:</strong> 1.0.0</p>
        <p><strong>构建日期:</strong> 2024年8月</p>
        <p>©2024 AI Chat Desktop</p>
        <div class="about-links">
          <el-button type="primary" link>
            <i :class="getIconClass('info')" class="icon-margin-right"></i>
            查看文档
          </el-button>
          <el-button type="primary" link>
            <i :class="getIconClass('github')" class="icon-margin-right"></i>
            GitHub
          </el-button>
        </div>
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
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.about-content p {
  margin: 0;
}

.about-links {
  margin-top: 16px;
  display: flex;
  gap: 16px;
}

.icon-margin-right {
  margin-right: 4px;
}

/* Element UI 主题适配 */
:deep(.el-button--primary) {
  color: var(--primary-color, #4a82f0);
}

:deep(.el-button--primary:hover) {
  color: var(--new-chat-hover-bg, #0056cc);
}

/* Dark theme overrides */
.dark-theme :deep(.el-button--primary) {
  color: var(--primary-color, #4a82f0);
}

.dark-theme :deep(.el-button--primary:hover) {
  color: var(--new-chat-hover-bg, #3a72e0);
}
</style> 