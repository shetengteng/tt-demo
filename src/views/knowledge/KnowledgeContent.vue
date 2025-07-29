<template>
  <div class="knowledge-content">
    <!-- 知识库内容头部 -->
    <div class="knowledge-content-header">
      <div class="knowledge-title">
        <h2>{{ currentKnowledgeBase?.name || '选择知识库' }}</h2>
        <el-tag v-if="currentKnowledgeBase" type="info" size="small">
          {{ currentKnowledgeBase.fileCount }} 个文件
        </el-tag>
      </div>
    </div>

    <!-- 知识库内容区域 -->
    <div class="knowledge-content-body">
      <el-empty v-if="!currentKnowledgeBase" description="请选择一个知识库">
        <!-- 移除创建知识库按钮，避免重复 -->
      </el-empty>

      <div v-else class="knowledge-detail">
        <!-- 上传文件区域 -->
        <div class="upload-section">
          <el-upload class="upload-area" drag action="#" :auto-upload="false" :on-change="handleFileChange"
            :file-list="fileList" multiple>
            <el-icon class="el-icon--upload"><i :class="getIconClass('upload')"></i></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或<em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">支持 PDF、DOCX、TXT 格式文件</div>
            </template>
          </el-upload>
        </div>

        <!-- 搜索文件区域 -->
        <div class="search-section">
          <el-input v-model="localSearchKeyword" placeholder="搜索文件..." :prefix-icon="getIconClass('search')" clearable
            @input="handleSearch" />
        </div>

        <!-- 文件列表区域 -->
        <div class="file-list-section">
          <div class="file-list-header">
            <h4>文件列表</h4>
            <el-button type="text" size="small" @click="refreshFileList" :icon="getIconClass('refresh')">
              刷新
            </el-button>
          </div>

          <div class="file-list">
            <el-empty v-if="filteredFiles.length === 0" description="暂无文件">
              <el-button type="primary" @click="showUploadDialog">上传文件</el-button>
            </el-empty>

            <el-menu v-else :default-active="selectedFile" @select="handleFileSelect">
              <el-menu-item v-for="file in filteredFiles" :key="file.id" :index="file.id" class="file-item">
                <div class="file-item-content">
                  <div class="file-icon">
                    <i :class="getFileIcon(file.type)"></i>
                  </div>
                  <div class="file-info">
                    <div class="file-name">{{ file.name }}</div>
                    <div class="file-meta">
                      <span>{{ file.size }}</span>
                      <span>{{ file.uploadTime }}</span>
                    </div>
                  </div>
                  <div class="file-actions">
                    <el-dropdown @command="handleFileAction" trigger="click" @click.stop>
                      <span class="el-dropdown-link">
                        <i :class="getIconClass('dots')" class="menu-dots"></i>
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item :command="`preview-${file.id}`">
                            <i :class="getIconClass('eye')" class="menu-icon"></i>
                            <span>预览</span>
                          </el-dropdown-item>
                          <el-dropdown-item :command="`delete-${file.id}`" divided>
                            <i :class="getIconClass('delete')" class="menu-icon delete-icon"></i>
                            <span class="delete-text">删除</span>
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>
                </div>
              </el-menu-item>
            </el-menu>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useIcon } from '@/composables/useIcon'

const { getIconClass } = useIcon()

// Props
const props = defineProps({
  currentKnowledgeBase: {
    type: Object,
    default: null,
  },
  fileList: {
    type: Array,
    default: () => [],
  },
  searchKeyword: {
    type: String,
    default: '',
  },
  filteredFiles: {
    type: Array,
    default: () => [],
  },
  selectedFile: {
    type: String,
    default: '',
  },
})

// Emits
const emit = defineEmits([
  'create-knowledge-base',
  'file-change',
  'search',
  'refresh-file-list',
  'show-upload-dialog',
  'file-select',
  'file-action',
])

// 本地搜索关键词
const localSearchKeyword = ref('')

// 方法
const handleFileChange = file => {
  emit('file-change', file)
}

const handleSearch = () => {
  emit('search', localSearchKeyword.value)
}

const refreshFileList = () => {
  emit('refresh-file-list')
}

const showUploadDialog = () => {
  emit('show-upload-dialog')
}

const handleFileSelect = index => {
  emit('file-select', index)
}

const handleFileAction = command => {
  emit('file-action', command)
}

const getFileIcon = type => {
  const iconMap = {
    pdf: 'ri-file-pdf-line',
    docx: 'ri-file-word-line',
    txt: 'ri-file-text-line',
  }
  return iconMap[type] || 'ri-file-line'
}
</script>

<style scoped>
.knowledge-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color, #ffffff);
}

.knowledge-content-header {
  padding: 20px 30px;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.knowledge-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.knowledge-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color, #333);
}

.knowledge-content-body {
  flex: 1;
  padding: 20px 30px;
  overflow-y: auto;
}

.knowledge-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.upload-section {
  border: 2px dashed var(--border-color, #d0d0d0);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  background-color: var(--bg-color-secondary, #fafafa);
}

.upload-area {
  width: 100%;
}

.search-section {
  margin-bottom: 10px;
}

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
  background-color: var(--primary-color, #4a82f0);
  color: white;
}

.file-list .el-menu-item.is-active .file-name,
.file-list .el-menu-item.is-active .file-meta {
  color: white;
}

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

/* 自定义滚动条样式 */
.knowledge-content-body::-webkit-scrollbar,
.file-list::-webkit-scrollbar {
  width: 6px;
}

.knowledge-content-body::-webkit-scrollbar-track,
.file-list::-webkit-scrollbar-track {
  background-color: transparent;
}

.knowledge-content-body::-webkit-scrollbar-thumb,
.file-list::-webkit-scrollbar-thumb {
  background-color: var(--border-color, #d0d0d0);
  border-radius: 3px;
}

.knowledge-content-body::-webkit-scrollbar-thumb:hover,
.file-list::-webkit-scrollbar-thumb:hover {
  background-color: var(--secondary-text-color, #999);
}
</style>
