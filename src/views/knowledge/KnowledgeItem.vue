<template>
  <el-menu-item :index="knowledgeBase.id" class="knowledge-item">
    <div class="knowledge-item-content">
      <div class="knowledge-info">
        <div class="knowledge-name">{{ knowledgeBase.name }}</div>
        <div class="knowledge-meta">
          <span>{{ knowledgeBase.fileCount }} 个文件</span>
          <span>{{ knowledgeBase.lastUpdated }}</span>
        </div>
      </div>
      <div class="knowledge-actions">
        <el-dropdown
          @command="handleKnowledgeAction"
          trigger="click"
          @click.stop
        >
          <span class="el-dropdown-link">
            <i :class="getIconClass('dots')" class="menu-dots"></i>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="`edit-${knowledgeBase.id}`">
                <i :class="getIconClass('edit')" class="menu-icon"></i>
                <span>编辑</span>
              </el-dropdown-item>
              <el-dropdown-item :command="`delete-${knowledgeBase.id}`" divided>
                <i
                  :class="getIconClass('delete')"
                  class="menu-icon delete-icon"
                ></i>
                <span class="delete-text">删除</span>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </el-menu-item>
</template>

<script setup>
  import { useIcon } from '../../composables/useIcon'

  const { getIconClass } = useIcon()

  // Props
  const props = defineProps({
    knowledgeBase: {
      type: Object,
      required: true,
    },
  })

  // Emits
  const emit = defineEmits(['knowledge-action'])

  // 方法
  const handleKnowledgeAction = command => {
    emit('knowledge-action', command)
  }
</script>

<style scoped>
  .knowledge-item {
    margin: 0 10px 5px 10px;
    border-radius: 8px;
    height: auto;
    min-height: 60px;
    padding: 12px 16px;
  }

  .knowledge-item-content {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    gap: 10px;
  }

  .knowledge-info {
    flex: 1;
    min-width: 0; /* 防止文本溢出 */
  }

  .knowledge-name {
    font-weight: 500;
    color: var(--text-color, #333);
    margin-bottom: 6px;
    font-size: 14px;
    line-height: 1.4;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }

  .knowledge-meta {
    font-size: 12px;
    color: var(--secondary-text-color, #999);
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    line-height: 1.3;
  }

  .knowledge-actions {
    opacity: 0;
    transition: opacity 0.2s;
    flex-shrink: 0;
    display: flex;
    align-items: center;
  }

  .knowledge-item:hover .knowledge-actions {
    opacity: 1;
  }

  .menu-dots {
    color: var(--secondary-text-color, #999);
    font-size: 16px;
    padding: 4px;
    cursor: pointer;
  }

  .menu-icon {
    margin-right: 6px;
    font-size: 14px;
  }

  .delete-text {
    color: #ff4d4f;
  }

  .delete-icon {
    color: #ff4d4f;
  }

  /* 被选中状态的颜色改为淡灰色 */
  :deep(.knowledge-item.is-active) {
    background-color: var(--selected-bg-color, #d3d3d3) !important;
    color: var(--selected-text-color, #333) !important;
  }

  :deep(.knowledge-item.is-active .knowledge-name),
  :deep(.knowledge-item.is-active .knowledge-meta) {
    color: var(--selected-text-color, #333) !important;
  }

  :deep(.knowledge-item.is-active .menu-dots) {
    color: var(--selected-text-color, #333) !important;
  }
</style>
