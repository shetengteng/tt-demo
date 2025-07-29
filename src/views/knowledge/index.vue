<template>
  <div class="knowledge-container" v-if="isMounted">
    <!-- 使用Splitter实现可拖拽分隔面板 -->
    <el-splitter style="height: 100%">
      <!-- 知识库列表面板 -->
      <el-splitter-panel :min="200" :max="350" size="250px">
        <KnowledgeList :knowledge-bases="knowledgeBases" :selected-knowledge-base="selectedKnowledgeBase"
          @update-knowledge-bases="handleUpdateKnowledgeBases" @select-knowledge-base="handleKnowledgeBaseSelect"
          @knowledge-action="handleKnowledgeAction" />
      </el-splitter-panel>

      <!-- 知识库内容主区域面板 -->
      <el-splitter-panel>
        <KnowledgeContent :current-knowledge-base="currentKnowledgeBase" :file-list="fileList"
          :search-keyword="searchKeyword" :filtered-files="filteredFiles" :selected-file="selectedFile"
          @create-knowledge-base="createKnowledgeBase" @file-change="handleFileChange" @search="handleSearch"
          @refresh-file-list="refreshFileList" @show-upload-dialog="showUploadDialog" @file-select="handleFileSelect"
          @file-action="handleFileAction" />
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useIcon } from '@/composables/useIcon'
import KnowledgeList from './KnowledgeList.vue'
import KnowledgeContent from './KnowledgeContent.vue'
import {
  getDocumentsByKnowledgeBaseId,
} from '@/database'

const { getIconClass } = useIcon()

// 响应式数据
const isMounted = ref(false)
const knowledgeBases = ref([])
const selectedKnowledgeBase = ref('')
const currentKnowledgeBase = computed(() =>
  knowledgeBases.value.find(kb => kb.id === selectedKnowledgeBase.value)
)

const fileList = ref([])
const searchKeyword = ref('')
const filteredFiles = ref([])
const selectedFile = ref('')
const loading = ref(false)

// 方法
const handleUpdateKnowledgeBases = (updatedKnowledgeBases) => {
  knowledgeBases.value = updatedKnowledgeBases
}

const loadDocuments = async (knowledgeBaseId) => {
  if (!knowledgeBaseId) {
    filteredFiles.value = []
    return
  }

  try {
    const documents = await getDocumentsByKnowledgeBaseId(parseInt(knowledgeBaseId))
    filteredFiles.value = documents.map(doc => ({
      id: doc.id.toString(),
      name: doc.title,
      type: getFileType(doc.filePath),
      size: '未知', // 暂时设为未知，后续可以从文件获取
      uploadTime: formatDate(doc.createdAt),
    }))
  } catch (error) {
    console.error('加载文档失败:', error)
    filteredFiles.value = []
  }
}


const handleKnowledgeBaseSelect = async (id) => {
  selectedKnowledgeBase.value = id
  await loadDocuments(id)
}


const handleKnowledgeAction = async (command) => {
  // 编辑和删除逻辑已移到 KnowledgeItem.vue 中
  console.log('Knowledge action:', command)
}



const handleFileChange = file => {
  console.log('文件变化:', file)
}

const handleSearch = keyword => {
  searchKeyword.value = keyword
  // 实现搜索逻辑
  if (!keyword.trim()) {
    loadDocuments(selectedKnowledgeBase.value)
  } else {
    // 过滤文件列表
    const documents = filteredFiles.value.filter(file =>
      file.name.toLowerCase().includes(keyword.toLowerCase())
    )
    filteredFiles.value = documents
  }
}

const refreshFileList = async () => {
  await loadDocuments(selectedKnowledgeBase.value)
}

const showUploadDialog = () => {
  // TODO: 实现显示上传对话框逻辑
  console.log('显示上传对话框')
}

const handleFileSelect = index => {
  selectedFile.value = index
  // TODO: 实现文件选择逻辑
  console.log('选择文件:', index)
}

const previewFile = file => {
  // TODO: 实现文件预览逻辑
  console.log('预览文件:', file)
}

const deleteFile = file => {
  // TODO: 实现删除文件逻辑
  console.log('删除文件:', file)
}

const handleFileAction = command => {
  const [action, id] = command.split('-')
  if (action === 'preview') {
    previewFile(filteredFiles.value.find(f => f.id === id))
  } else if (action === 'delete') {
    deleteFile(filteredFiles.value.find(f => f.id === id))
  }
}

const getFileIcon = type => {
  const iconMap = {
    pdf: 'ri-file-pdf-line',
    docx: 'ri-file-word-line',
    txt: 'ri-file-text-line',
  }
  return iconMap[type] || 'ri-file-line'
}


// 根据文件路径获取文件类型
const getFileType = (filePath) => {
  if (!filePath) return 'unknown'
  const extension = filePath.split('.').pop()?.toLowerCase()
  const typeMap = {
    'pdf': 'pdf',
    'docx': 'docx',
    'doc': 'docx',
    'txt': 'txt',
    'md': 'txt',
  }
  return typeMap[extension] || 'unknown'
}

onMounted(async () => {
  isMounted.value = true
})
</script>

<style scoped>
.knowledge-container {
  height: 100%;
  display: flex;
  position: relative;
  overflow: hidden;
}

/* 自定义分隔条样式 */
:deep(.el-splitter__bar) {
  background-color: var(--border-color, #e0e0e0);
}

:deep(.el-splitter__bar:hover) {
  background-color: var(--primary-color, #4a82f0);
}
</style>
