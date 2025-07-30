<template>
  <div class="file-list-section">
    <div class="file-list-header">
      <h4>文件列表</h4>
      <el-button type="text" size="small" @click="handleRefresh">
        <i class="ri-refresh-line"></i>
        刷新
      </el-button>
    </div>

    <div class="file-list">
      <el-empty v-if="documents.length === 0" description="暂无文件">
      </el-empty>

      <el-menu v-else :default-active="selectedDocument" @select="handleDocumentSelect">
        <KnowledgeDocumentItem 
          v-for="document in documents" 
          :key="document.id" 
          :document="document"
          @action="handleDocumentAction"
        />
      </el-menu>
    </div>
  </div>
</template>

<script setup>
import KnowledgeDocumentItem from './KnowledgeDocumentItem.vue'

// Props
const props = defineProps({
  documents: {
    type: Array,
    default: () => []
  },
  selectedDocument: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['select', 'action', 'refresh'])

// 方法
const handleDocumentSelect = (documentId) => {
  emit('select', documentId)
}

const handleDocumentAction = (command) => {
  emit('action', command)
}

const handleRefresh = () => {
  emit('refresh')
}
</script>

<style scoped>
.file-list-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.file-list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.file-list-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-color, #333);
}

.file-list {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  /* 确保flex子元素可以正确收缩 */
}

.file-list .el-menu {
  border: none;
  background: transparent;
}

.file-list .el-menu-item {
  height: auto;
  line-height: 1.4;
  padding: 0;
  margin: 0 0 5px 0;
  border-radius: 8px;
}

.file-list .el-menu-item:hover {
  background-color: var(--hover-bg-color, #f5f5f5);
}

.file-list .el-menu-item.is-active {
  background-color: var(--fill-color-light, #f5f7fa);
  color: var(--text-color, #333);
}

.file-list .el-menu-item.is-active .file-name,
.file-list .el-menu-item.is-active .file-meta {
  color: var(--text-color, #333);
}

/* 自定义滚动条样式 */
.file-list::-webkit-scrollbar {
  width: 6px;
}

.file-list::-webkit-scrollbar-track {
  background-color: transparent;
}

.file-list::-webkit-scrollbar-thumb {
  background-color: var(--border-color, #d0d0d0);
  border-radius: 3px;
}

.file-list::-webkit-scrollbar-thumb:hover {
  background-color: var(--secondary-text-color, #999);
}
</style> 