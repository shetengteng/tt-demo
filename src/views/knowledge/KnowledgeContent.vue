<template>
  <div class="knowledge-content">
    <!-- 知识库内容头部 -->
    <div class="knowledge-content-header">
      <div class="knowledge-title">
        <div class="title-row">
          <h2>{{ currentKnowledgeBase?.name || '选择知识库' }}</h2>
          <el-tag v-if="currentKnowledgeBase" type="info" size="small">
            {{ currentKnowledgeBase.fileCount }} 文件
          </el-tag>
        </div>
        <div class="knowledge-info" v-if="currentKnowledgeBase?.description">
          <div class="knowledge-description">
            {{ currentKnowledgeBase.description }}
          </div>
        </div>
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
          <el-upload class="upload-area" drag action="#" :auto-upload="false" :on-change="handleFileUpload"
            :file-list="fileList" :disabled="uploading" multiple accept=".txt,.md,.json,.js,.ts,.vue,.css,.html">
            <el-icon class="el-icon--upload">
              <i :class="uploading ? getIconClass('loading') : getIconClass('upload')"></i>
            </el-icon>
            <div class="el-upload__text">
              <span v-if="!uploading">将文件拖到此处，或<em>点击上传</em></span>
              <span v-else>{{ uploadStatus }}</span>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 TXT、MD、JSON、JS、TS、VUE、CSS、HTML 格式文件
              </div>
            </template>
          </el-upload>

          <!-- 上传进度 -->
          <div v-if="uploading" class="upload-progress">
            <el-progress :percentage="uploadProgress" :stroke-width="8" :show-text="true"
              :format="(percentage) => `${Math.round(percentage)}%`">
            </el-progress>
            <div class="progress-status">{{ uploadStatus }}</div>
          </div>

          <!-- 上传错误 -->
          <div v-if="uploadErrors.length > 0" class="upload-errors">
            <el-alert title="部分文件处理失败" type="warning" :closable="true" @close="uploadErrors = []">
              <template #default>
                <ul class="error-list">
                  <li v-for="(error, index) in uploadErrors" :key="index">
                    {{ error.filePath || '未知文件' }}: {{ error.error }}
                  </li>
                </ul>
              </template>
            </el-alert>
          </div>
        </div>

        <!-- 搜索文件区域 -->
        <div class="search-section">
          <div class="search-input-wrapper">
            <el-input v-model="localSearchKeyword" placeholder="输入关键词进行语义搜索..." :prefix-icon="getIconClass('search')"
              clearable @input="handleSearch" @keyup.enter="handleSemanticSearch" :loading="searching">
              <template #append>
                <el-dropdown @command="setSearchType">
                  <el-button :icon="getIconClass('settings')">
                    {{ searchTypeLabel }}
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="hybrid" :class="{ 'is-active': searchType === 'hybrid' }">
                        <i :class="getIconClass('mix')" class="menu-icon"></i>
                        <span>混合搜索</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="semantic" :class="{ 'is-active': searchType === 'semantic' }">
                        <i :class="getIconClass('ai')" class="menu-icon"></i>
                        <span>语义搜索</span>
                      </el-dropdown-item>
                      <el-dropdown-item command="keyword" :class="{ 'is-active': searchType === 'keyword' }">
                        <i :class="getIconClass('search')" class="menu-icon"></i>
                        <span>关键词搜索</span>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </el-input>

            <div class="search-actions" v-if="localSearchKeyword.trim()">
              <el-button type="primary" size="small" @click="handleSemanticSearch" :loading="searching">
                搜索
              </el-button>
              <el-button size="small" @click="clearSearch" v-if="showSearchResults">
                清除
              </el-button>
            </div>
          </div>

          <!-- 搜索状态 -->
          <div v-if="searching" class="search-status">
            <el-text type="info">
              <i :class="getIconClass('loading')" class="is-loading"></i>
              正在搜索...
            </el-text>
          </div>
        </div>

        <!-- 搜索结果区域 -->
        <div v-if="showSearchResults" class="search-results-section">
          <div class="search-results-header">
            <h4>搜索结果</h4>
            <div class="search-meta">
              <el-tag size="small" type="info">{{ searchResults.length }} 个结果</el-tag>
              <el-tag size="small" :type="searchTypeTagType">{{ searchTypeLabel }}</el-tag>
            </div>
          </div>

          <div class="search-results-list">
            <el-empty v-if="searchResults.length === 0" description="未找到相关内容">
            </el-empty>

            <div v-else class="result-items">
              <div v-for="result in searchResults" :key="`${result.documentId}-${result.id}`" class="result-item"
                @click="selectSearchResult(result)">
                <div class="result-header">
                  <div class="result-title">{{ result.documentTitle }}</div>
                  <div class="result-score">
                    <el-text size="small" type="success">{{ Math.round(result.similarity * 100) }}%</el-text>
                  </div>
                </div>
                <div class="result-content" v-html="result.highlighted"></div>
                <div class="result-meta">
                  <span>位置: {{ result.position }}</span>
                  <span v-if="result.searchTypes">类型: {{ result.searchTypes.join(', ') }}</span>
                  <span v-if="result.matchedKeywords">匹配: {{ result.matchedKeywords }} 个关键词</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 文件列表区域 -->
        <div v-else class="file-list-section">
          <div class="file-list-header">
            <h4>文件列表</h4>
            <el-button type="text" size="small" @click="refreshFileList" :icon="getIconClass('refresh')">
              刷新
            </el-button>
          </div>

          <div class="file-list">
            <el-empty v-if="filteredFiles.length === 0" description="暂无文件">
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
                      <span v-if="file.chunkCount">{{ file.chunkCount }} 分块</span>
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
import { useGlobalKnowledge } from '@/composables/useGlobalKnowledge'

const { getIconClass } = useIcon()

// 使用全局知识库状态管理
const {
  currentKnowledgeBase,
  fileList,
  searchKeyword,
  filteredFiles,
  selectedFile,
  uploading,
  uploadProgress,
  uploadStatus,
  uploadErrors,
  searching,
  searchResults,
  searchQuery,
  searchType,
  showSearchResults,
  searchFiles,
  refreshFileList,
  selectFile,
  handleFileAction,
  handleFileChange,
  showUploadDialog,
  performSemanticSearch,
  clearSearchResults,
  setSearchType,
} = useGlobalKnowledge()

// 本地搜索关键词
const localSearchKeyword = ref('')

// 方法
const handleSearch = () => {
  searchFiles(localSearchKeyword.value)
}

const handleFileSelect = index => {
  selectFile(index)
}

const getFileIcon = type => {
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

// 处理文件上传（Element UI 回调）
const handleFileUpload = async (file, fileList) => {
  await handleFileChange(file, fileList)
}

// 搜索类型标签
const searchTypeLabel = computed(() => {
  const labels = {
    hybrid: '混合搜索',
    semantic: '语义搜索',
    keyword: '关键词搜索'
  }
  return labels[searchType.value] || '混合搜索'
})

const searchTypeTagType = computed(() => {
  const types = {
    hybrid: 'primary',
    semantic: 'success',
    keyword: 'warning'
  }
  return types[searchType.value] || 'primary'
})

// 处理语义搜索
const handleSemanticSearch = () => {
  if (localSearchKeyword.value.trim()) {
    performSemanticSearch(localSearchKeyword.value.trim())
  }
}

// 清除搜索
const clearSearch = () => {
  localSearchKeyword.value = ''
  clearSearchResults()
}

// 选择搜索结果
const selectSearchResult = (result) => {
  // 可以实现跳转到对应文档的功能
  console.log('选择搜索结果:', result)
  selectFile(result.documentId)
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
  flex-direction: column;
  gap: 8px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.knowledge-title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color, #333);
}

.knowledge-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.knowledge-info .el-tag {
  width: fit-content;
  align-self: flex-start;
}

.knowledge-description {
  color: var(--secondary-text-color, #666);
  font-size: 14px;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
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

.upload-area.is-disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.upload-progress {
  margin-top: 15px;
  padding: 15px;
  background-color: var(--fill-color-light, #f5f7fa);
  border-radius: 8px;
}

.progress-status {
  margin-top: 8px;
  font-size: 14px;
  color: var(--text-color-regular, #606266);
  text-align: center;
}

.upload-errors {
  margin-top: 15px;
}

.error-list {
  margin: 0;
  padding-left: 20px;
  list-style-type: disc;
}

.error-list li {
  margin: 5px 0;
  font-size: 14px;
  color: var(--color-warning, #e6a23c);
}

.search-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.search-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.search-status {
  margin-top: 10px;
  text-align: center;
}

.search-status .is-loading {
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

.search-results-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.search-results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.search-results-header h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color, #333);
}

.search-meta {
  display: flex;
  gap: 8px;
}

.search-results-list {
  flex: 1;
  overflow-y: auto;
}

.result-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.result-item {
  padding: 15px;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: 8px;
  background-color: var(--bg-color, #ffffff);
  cursor: pointer;
  transition: all 0.2s ease;
}

.result-item:hover {
  border-color: var(--primary-color, #4a82f0);
  box-shadow: 0 2px 8px rgba(74, 130, 240, 0.1);
  transform: translateY(-1px);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.result-title {
  font-weight: 600;
  color: var(--primary-color, #4a82f0);
  font-size: 14px;
  flex: 1;
}

.result-score {
  flex-shrink: 0;
  margin-left: 12px;
}

.result-content {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color, #333);
  margin-bottom: 8px;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.result-content :deep(.search-highlight) {
  background-color: #fff566;
  padding: 1px 3px;
  border-radius: 3px;
  font-weight: 600;
}

.result-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: var(--secondary-text-color, #999);
}

.result-meta span {
  display: flex;
  align-items: center;
}

.menu-icon {
  margin-right: 6px;
  font-size: 14px;
}

.is-active {
  background-color: var(--primary-color, #4a82f0);
  color: white;
}

.is-active .menu-icon {
  color: white;
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
