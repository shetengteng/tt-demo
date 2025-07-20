<template>
  <div class="settings-content">
    <!-- 设置内容头部 -->
    <div class="settings-content-header">
      <div class="content-title">
        <h2>{{ sectionTitles[activeSection] || '设置' }}</h2>
      </div>
    </div>

    <!-- 设置内容区域 -->
    <div class="settings-content-body">
      <GeneralSettings v-if="activeSection === 'general'" />
      <ApiSettings v-if="activeSection === 'api'" />
      <AppearanceSettings v-if="activeSection === 'appearance'" />
      <AboutSettings v-if="activeSection === 'about'" />
    </div>
  </div>
</template>

<script setup>
  // 导入设置组件
  import GeneralSettings from '@/components/settings/GeneralSettings.vue'
  import ApiSettings from '@/components/settings/ApiSettings.vue'
  import AppearanceSettings from '@/components/settings/AppearanceSettings.vue'
  import AboutSettings from '@/components/settings/AboutSettings.vue'

  // Props
  const props = defineProps({
    activeSection: {
      type: String,
      default: 'general',
    },
    sectionTitles: {
      type: Object,
      default: () => ({}),
    },
  })
</script>

<style scoped>
  .settings-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-color, #ffffff);
  }

  .settings-content-header {
    padding: 20px 30px;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
  }

  .content-title {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .content-title h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: var(--text-color, #333);
  }

  .settings-content-body {
    flex: 1;
    padding: 20px 30px;
    overflow-y: auto;
  }
</style>
