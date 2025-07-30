<template>
  <el-dialog
    v-model="dialogVisible"
    :title="`预览文档 - ${document?.name || '未知文档'}`"
    width="900px"
    :before-close="handleClose"
    destroy-on-close
    class="document-preview-dialog"
  >
    <!-- 文档信息 -->
    <div class="document-info" v-if="document">
      <div class="info-item">
        <span class="label">文件名：</span>
        <span class="value">{{ document.name }}</span>
      </div>
      <div class="info-item">
        <span class="label">文件类型：</span>
        <span class="value">{{ document.type }}</span>
      </div>
      <div class="info-item">
        <span class="label">文件大小：</span>
        <span class="value">{{ document.size }}</span>
      </div>
      <div class="info-item">
        <span class="label">上传时间：</span>
        <span class="value">{{ document.uploadTime }}</span>
      </div>
    </div>

    <!-- 内容预览区域 -->
    <div class="content-preview">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <el-text type="info">
          <i class="ri-loader-4-line is-loading"></i>
          正在加载文档内容...
        </el-text>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <el-alert
          title="预览失败"
          :description="error"
          type="error"
          show-icon
          :closable="false"
        />
      </div>

      <!-- 内容显示 -->
      <div v-else-if="content" class="content-display">
        <!-- Markdown 内容 -->
        <div v-if="isMarkdown" class="markdown-content" v-html="renderedContent"></div>
        
        <!-- 普通文本内容 -->
        <div v-else class="text-content">
          <pre>{{ content }}</pre>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <el-empty description="暂无内容可预览" />
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button v-if="content" type="primary" @click="copyContent">
          <i class="ri-file-copy-line"></i>
          复制内容
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { getDocumentById } from '@/database'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  document: {
    type: Object,
    default: null
  }
})

// Emits
const emit = defineEmits(['update:modelValue'])

// 响应式数据
const dialogVisible = ref(false)
const loading = ref(false)
const error = ref('')
const content = ref('')

// 监听外部传入的显示状态
watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
  if (newVal && props.document) {
    loadDocumentContent()
  }
})

// 监听弹框显示状态
watch(dialogVisible, (newVal) => {
  emit('update:modelValue', newVal)
  if (!newVal) {
    // 弹框关闭时重置状态
    content.value = ''
    error.value = ''
  }
})

// 计算属性
const isMarkdown = computed(() => {
  return props.document?.type === 'md' || props.document?.name?.endsWith('.md')
})

const renderedContent = computed(() => {
  if (!isMarkdown.value || !content.value) return ''
  
  // 简单的 Markdown 渲染（基础版本）
  let html = content.value
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gim, '<em>$1</em>')
    .replace(/!\[([^\]]*)\]\(([^\)]+)\)/gim, '<img alt="$1" src="$2" />')
    .replace(/\[([^\]]+)\]\(([^\)]+)\)/gim, '<a href="$2">$1</a>')
    .replace(/\n$/gim, '<br />')

  return html
})

// 方法
const loadDocumentContent = async () => {
  if (!props.document?.id) return

  try {
    loading.value = true
    error.value = ''
    
    const doc = await getDocumentById(props.document.id)
    if (doc && doc.content) {
      content.value = doc.content
    } else {
      error.value = '无法获取文档内容'
    }
  } catch (err) {
    console.error('加载文档内容失败:', err)
    error.value = `加载失败: ${err.message || '未知错误'}`
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  dialogVisible.value = false
}

const copyContent = async () => {
  if (!content.value) return

  try {
    await navigator.clipboard.writeText(content.value)
    ElMessage.success('内容已复制到剪贴板')
  } catch (err) {
    console.error('复制失败:', err)
    ElMessage.error('复制失败')
  }
}
</script>

<style scoped>
.document-preview-dialog {
  max-height: 80vh;
}

.document-info {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background-color: var(--fill-color-light, #f5f7fa);
  border-radius: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.label {
  font-weight: 500;
  color: var(--text-color-regular, #606266);
  font-size: 14px;
}

.value {
  color: var(--text-color, #333);
  font-size: 14px;
}

.content-preview {
  max-height: 500px;
  overflow-y: auto;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  padding: 16px;
  background-color: var(--bg-color, #ffffff);
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.is-loading {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.content-display {
  line-height: 1.6;
  color: var(--text-color, #333);
}

.text-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  margin: 0;
  line-height: 1.5;
}

.markdown-content {
  font-size: 14px;
  line-height: 1.6;
}

.markdown-content h1,
.markdown-content h2,
.markdown-content h3 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--text-color, #333);
}

.markdown-content h1 {
  font-size: 24px;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
  padding-bottom: 8px;
}

.markdown-content h2 {
  font-size: 20px;
}

.markdown-content h3 {
  font-size: 16px;
}

.markdown-content blockquote {
  margin: 16px 0;
  padding: 0 16px;
  border-left: 4px solid var(--border-color, #e0e0e0);
  color: var(--text-color-regular, #606266);
  background-color: var(--fill-color-light, #f5f7fa);
}

.markdown-content strong {
  font-weight: 600;
}

.markdown-content em {
  font-style: italic;
}

.markdown-content a {
  color: var(--primary-color, #4a82f0);
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

.markdown-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 自定义滚动条样式 */
.content-preview::-webkit-scrollbar {
  width: 6px;
}

.content-preview::-webkit-scrollbar-track {
  background-color: transparent;
}

.content-preview::-webkit-scrollbar-thumb {
  background-color: var(--border-color, #d0d0d0);
  border-radius: 3px;
}

.content-preview::-webkit-scrollbar-thumb:hover {
  background-color: var(--secondary-text-color, #999);
}
</style> 