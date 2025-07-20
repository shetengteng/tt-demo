<template>
  <div class="settings-sidebar-panel">
    <!-- 设置侧边栏列表 -->
    <div class="settings-sidebar-list">
      <el-menu :default-active="activeSection" @select="handleSectionSelect">
        <el-menu-item
          v-for="item in sidebarItems"
          :key="item.section"
          :index="item.section"
          class="settings-item"
        >
          <div class="settings-item-content">
            <div class="settings-info">
              <i :class="getIconClass(item.icon)" class="item-icon"></i>
              <div class="settings-title">{{ item.title }}</div>
            </div>
          </div>
        </el-menu-item>
      </el-menu>
    </div>
  </div>
</template>

<script setup>
  import { useIcon } from '../../composables/useIcon'

  const { getIconClass } = useIcon()

  // Props
  const props = defineProps({
    sidebarItems: {
      type: Array,
      default: () => [],
    },
    activeSection: {
      type: String,
      default: 'general',
    },
  })

  // Emits
  const emit = defineEmits(['section-change'])

  // 方法
  const handleSectionSelect = section => {
    emit('section-change', section)
  }
</script>

<style scoped>
  .settings-sidebar-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: var(--sidebar-bg-color, #f5f5f5);
    border-right: 1px solid var(--border-color, #e0e0e0);
  }

  .settings-sidebar-header {
    padding: 20px;
    border-bottom: 1px solid var(--border-color, #e0e0e0);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .sidebar-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: var(--secondary-text-color, #999);
  }

  .sidebar-icon {
    margin-right: 10px;
  }

  .settings-sidebar-list {
    flex: 1;
    overflow-y: auto;
    padding: 10px 0;
    min-height: 0; /* 确保flex子元素可以正确收缩 */
  }

  .settings-sidebar-list .el-menu {
    border: none;
    background: transparent;
  }

  .settings-sidebar-list .el-menu-item {
    height: auto;
    line-height: 1.4;
    padding: 0;
    margin: 0 10px 5px 10px;
    border-radius: 8px;
  }

  .settings-sidebar-list .el-menu-item:hover {
    background-color: var(--hover-bg-color, #f5f5f5);
  }

  .settings-sidebar-list .el-menu-item.is-active {
    background-color: var(--selected-bg-color, #e9e9e9);
    color: var(--selected-text-color, #333);
  }

  .settings-item {
    margin: 0 10px 5px 10px;
    border-radius: 8px;
    height: auto;
    min-height: 50px;
    padding: 12px 16px;
  }

  .settings-item-content {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 12px;
  }

  .settings-info {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;
  }

  .item-icon {
    font-size: 18px;
    color: var(--primary-color, #4a82f0);
    width: 20px;
    text-align: center;
    flex-shrink: 0;
  }

  .settings-title {
    font-weight: 500;
    color: var(--text-color, #333);
    font-size: 14px;
    line-height: 1.4;
  }

  .settings-sidebar-list .el-menu-item.is-active .settings-title {
    color: var(--selected-text-color, #333);
  }

  .settings-sidebar-list .el-menu-item.is-active .item-icon {
    color: var(--selected-text-color, #333);
  }
</style>
