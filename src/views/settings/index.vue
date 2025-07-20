<template>
  <div class="settings-container" v-if="isMounted">
    <!-- 使用Splitter实现可拖拽分隔面板 -->
    <el-splitter style="height: 100%">
      <!-- 左侧设置导航面板 -->
      <el-splitter-panel :min="180" :max="300" size="220px">
        <SettingsSidebar
          :sidebar-items="sidebarItems"
          :active-section="activeSection"
          @section-change="handleSectionChange"
        />
      </el-splitter-panel>

      <!-- 右侧设置内容面板 -->
      <el-splitter-panel>
        <SettingsContent
          :active-section="activeSection"
          :section-titles="sectionTitles"
        />
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup>
  import { ref } from 'vue'
  import { useIcon } from '@/composables/useIcon'

  // 导入设置组件
  import SettingsSidebar from './SettingsSidebar.vue'
  import SettingsContent from './SettingsContent.vue'

  const { getIconClass } = useIcon()
  const activeSection = ref('general')
  const isMounted = ref(true)

  // 侧边栏JSON配置（保持在代码中，不存入数据库）
  const sidebarItems = [
    {
      section: 'general',
      title: '通用设置',
      icon: 'general',
    },
    {
      section: 'api',
      title: 'API 设置',
      icon: 'key',
    },
    {
      section: 'appearance',
      title: '外观设置',
      icon: 'theme',
    },
    {
      section: 'about',
      title: '关于',
      icon: 'info',
    },
  ]

  const sectionTitles = {
    general: '通用',
    api: 'API 设置',
    appearance: '外观设置',
    about: '关于',
  }

  // 处理侧边栏选择变化
  const handleSectionChange = section => {
    activeSection.value = section
  }
</script>

<style scoped>
  .settings-container {
    height: 100%;
    display: flex;
    position: relative;
    overflow: hidden;
  }

  /* 自定义分隔条样式 */
  :deep(.el-splitter__bar) {
    background-color: var(--border-color, #e0e0e0);
  }

  :deep(.el-splitter__bar:hover) {
    background-color: var(--primary-color, #4a82f0);
  }
</style>
