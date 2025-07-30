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
          <!-- 搜索按钮 -->
          <el-button v-if="currentKnowledgeBase" @click="openSearchDialog" class="search-button" text>
            <i class="ri-search-line"></i>
          </el-button>
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
              <i :class="uploading ? 'ri-loader-4-line is-loading' : 'ri-upload-cloud-line'"></i>
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

        <!-- 文件列表区域 -->
        <KnowledgeDocumentList
          :documents="filteredFiles"
          :selectedDocument="selectedFile"
          @select="handleFileSelect"
          @action="handleFileAction"
          @refresh="refreshFileList"
        />
      </div>
    </div>

    <!-- 搜索弹框 -->
    <KnowledgeSearchDialog v-model="showSearchDialog" :knowledgeBaseId="currentKnowledgeBase?.id"
      @result-selected="handleSearchResultSelected" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGlobalKnowledge } from '@/composables/useGlobalKnowledge'
import KnowledgeSearchDialog from './components/KnowledgeSearchDialog.vue'
import KnowledgeDocumentList from './components/KnowledgeDocumentList.vue'

// 使用全局知识库状态管理
const {
  currentKnowledgeBase,
  fileList,
  filteredFiles,
  selectedFile,
  uploading,
  uploadProgress,
  uploadStatus,
  uploadErrors,
  refreshFileList,
  selectFile,
  handleFileAction,
  handleFileChange,
} = useGlobalKnowledge()

// 搜索弹框状态
const showSearchDialog = ref(false)

// 方法
const handleFileSelect = index => {
  selectFile(index)
}

// 处理文件上传（Element UI 回调）
const handleFileUpload = async (file, fileList) => {
  await handleFileChange(file, fileList)
}

// 打开搜索弹框
const openSearchDialog = () => {
  showSearchDialog.value = true
}

// 处理搜索结果选择
const handleSearchResultSelected = (result) => {
  console.log('选择搜索结果:', result)
  // 搜索弹框组件内部已经处理了文件选择，这里可以添加额外的逻辑
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

.search-button {
  margin-left: auto;
}

.search-button i {
  font-size: 18px;
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



/* 自定义滚动条样式 */
.knowledge-content-body::-webkit-scrollbar {
  width: 6px;
}

.knowledge-content-body::-webkit-scrollbar-track {
  background-color: transparent;
}

.knowledge-content-body::-webkit-scrollbar-thumb {
  background-color: var(--border-color, #d0d0d0);
  border-radius: 3px;
}

.knowledge-content-body::-webkit-scrollbar-thumb:hover {
  background-color: var(--secondary-text-color, #999);
}
</style>
