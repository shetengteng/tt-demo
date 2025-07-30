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
        <el-dropdown @command="handleAction" trigger="click" @click.stop>
          <span class="el-dropdown-link">
            <i class="ri-more-2-line menu-dots"></i>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item :command="`preview-${document.id}`">
                <i class="ri-eye-line menu-icon"></i>
                <span>预览</span>
              </el-dropdown-item>
              <el-dropdown-item :command="`delete-${document.id}`" divided>
                <i class="ri-delete-bin-line menu-icon delete-icon"></i>
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
// Props
const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

// Emits
const emit = defineEmits(['action'])

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

const handleAction = (command) => {
  emit('action', command)
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
  gap: 5px;
  flex-shrink: 0;
  align-items: center;
}

.file-item:hover .file-actions {
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
</style> 