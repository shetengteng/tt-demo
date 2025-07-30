<template>
  <el-menu-item :index="document.id" class="file-item">
    <div class="file-item-content">
      <div class="file-icon">
        <i :class="getFileIcon(document.type)"></i>
      </div>
      <div class="file-info">
        <div class="file-name">{{ document.name }}</div>
        <div class="file-meta">
          <span>{{ document.size }}</span>
          <span>{{ document.uploadTime }}</span>
          <span v-if="document.chunkCount">{{ document.chunkCount }} 分块</span>
        </div>
      </div>
      <div class="file-actions">
        <el-button 
          type="text" 
          size="small" 
          @click="openPreview"
          class="action-button preview-button"
          title="预览"
        >
          <i class="ri-eye-line"></i>
        </el-button>
        <el-button 
          type="text" 
          size="small" 
          @click="handleDelete"
          class="action-button delete-button"
          title="删除"
        >
          <i class="ri-delete-bin-line"></i>
        </el-button>
      </div>
    </div>
    
    <!-- 文档预览弹框 -->
    <DocumentPreviewDialog
      v-model="showPreview"
      :document="document"
    />
  </el-menu-item>
</template>

<script setup>
import { ref } from 'vue'
import DocumentPreviewDialog from './DocumentPreviewDialog.vue'

// Props
const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['action'])

// 响应式数据
const showPreview = ref(false)

// 方法
const getFileIcon = (type) => {
  const iconMap = {
    pdf: 'ri-file-pdf-line',
    docx: 'ri-file-word-line',
    txt: 'ri-file-text-line',
    md: 'ri-markdown-line',
    js: 'ri-braces-line',
    ts: 'ri-braces-line',
    vue: 'ri-vuejs-line',
    css: 'ri-css3-line',
    html: 'ri-html5-line',
    json: 'ri-brackets-line',
  }
  return iconMap[type] || 'ri-file-line'
}

const openPreview = () => {
  showPreview.value = true
}

const handleDelete = () => {
  emit('action', `delete-${props.document.id}`)
}
</script>

<style scoped>
.file-item {
  margin: 0 0 5px 0;
  border-radius: 8px;
  height: auto;
  min-height: 50px;
  padding: 10px 16px;
}

.file-item-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

.file-icon {
  font-size: 20px;
  color: var(--primary-color, #4a82f0);
  width: 24px;
  text-align: center;
  flex-shrink: 0;
  margin-top: 2px;
}

.file-info {
  flex: 1;
  min-width: 0;
  /* 防止文本溢出 */
}

.file-name {
  font-weight: 500;
  color: var(--text-color, #333);
  margin-bottom: 4px;
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.file-meta {
  font-size: 12px;
  color: var(--secondary-text-color, #999);
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  line-height: 1.3;
}

.file-actions {
  opacity: 0;
  transition: opacity 0.2s;
  display: flex;
  gap: 0px;
  flex-shrink: 0;
  align-items: center;
}

.file-item:hover .file-actions {
  opacity: 1;
}

.action-button {
  padding: 4px;
  margin: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.action-button i {
  font-size: 16px;
}

.preview-button {
  color: var(--primary-color, #4a82f0);
}

.preview-button:hover {
  background-color: rgba(74, 130, 240, 0.1);
  color: var(--primary-color, #4a82f0);
}

.delete-button {
  color: #ff4d4f;
}

.delete-button:hover {
  background-color: rgba(255, 77, 79, 0.1);
  color: #ff4d4f;
}
</style> 