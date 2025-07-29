<template>
  <div class="knowledge-list-panel">
    <!-- 知识库列表头部 -->
    <div class="knowledge-list-header">
      <el-button class="new-knowledge-button" @click="createKnowledgeBase">
        <i :class="getIconClass('plus')" class="icon-margin-right"></i>
        <span style="margin-left: 10px">New Knowledge</span>
        <i :class="getIconClass('database')" style="margin-left: 10px"></i>
      </el-button>
    </div>

    <!-- 知识库列表 -->
    <div class="knowledge-list">
      <el-empty v-if="knowledgeBases.length === 0" description="暂无知识库">
        <!-- 移除重复的创建按钮，只保留头部的New Knowledge按钮 -->
      </el-empty>

      <el-menu v-else :default-active="selectedKnowledgeBase" @select="handleKnowledgeBaseSelect">
        <KnowledgeItem v-for="kb in knowledgeBases" :key="kb.id" :knowledge-base="kb"
          @knowledge-action="handleKnowledgeAction" />
      </el-menu>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useIcon } from '@/composables/useIcon'
import { useGlobalKnowledge } from '@/composables/useGlobalKnowledge'
import KnowledgeItem from './KnowledgeItem.vue'

const { getIconClass } = useIcon()

// 使用全局知识库状态管理
const {
  knowledgeBases,
  selectedKnowledgeBase,
  loading,
  loadKnowledgeBases,
  createKnowledgeBase,
  selectKnowledgeBase,
  handleKnowledgeAction,
} = useGlobalKnowledge()

// 方法
const handleKnowledgeBaseSelect = async (id) => {
  await selectKnowledgeBase(id)
}

// 生命周期
onMounted(async () => {
  await loadKnowledgeBases()
})
</script>

<style scoped>
.knowledge-list-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--sidebar-bg-color, #f5f5f5);
  border-right: 1px solid var(--border-color, #e0e0e0);
}

.knowledge-list-header {
  padding: 8px 15px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.new-knowledge-button {
  margin: 8px;
  background-color: #000033;
  color: var(--new-chat-text, white);
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 16px);
  transition: all 0.2s ease;
  font-weight: 500;
  height: 40px;
}

.new-knowledge-button:hover {
  background-color: #000066;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

/* 使用深度选择器确保Element UI按钮的hover样式被正确覆盖 */
:deep(.new-knowledge-button:hover) {
  background-color: #000066 !important;
  border-color: #000066 !important;
}

:deep(.new-knowledge-button) {
  background-color: #000033 !important;
  border-color: #000033 !important;
  color: white !important;
}

/* 深色主题下的按钮样式 */
:deep(.dark-theme .new-knowledge-button) {
  background-color: #4a82f0 !important;
  border-color: #4a82f0 !important;
  color: white !important;
}

:deep(.dark-theme .new-knowledge-button:hover) {
  background-color: #3a72e0 !important;
  border-color: #3a72e0 !important;
}

.icon-margin-right {
  margin-right: 4px;
}

.knowledge-list {
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
  min-height: 0;
  /* 确保flex子元素可以正确收缩 */
}

.knowledge-list .el-menu {
  border: none;
  background: transparent;
}

.knowledge-list .el-menu-item {
  height: auto;
  line-height: 1.4;
  padding: 0;
  margin: 0 10px 5px 10px;
  border-radius: 8px;
}

.knowledge-list .el-menu-item:hover {
  background-color: var(--hover-bg-color, #f5f5f5);
}

.knowledge-list .el-menu-item.is-active {
  background-color: var(--selected-bg-color, #d3d3d3);
  color: var(--selected-text-color, #333);
}

.knowledge-list .el-menu-item.is-active .knowledge-name,
.knowledge-list .el-menu-item.is-active .knowledge-meta {
  color: var(--selected-text-color, #333);
}
</style>
