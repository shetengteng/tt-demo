<template>
  <div class="knowledge-container" v-if="isMounted">
    <!-- 使用Splitter实现可拖拽分隔面板 -->
    <el-splitter style="height: 100%">
      <!-- 知识库列表面板 -->
      <el-splitter-panel :min="200" :max="350" size="250px">
        <KnowledgeList
          :knowledge-bases="knowledgeBases"
          :selected-knowledge-base="selectedKnowledgeBase"
          @create-knowledge-base="createKnowledgeBase"
          @select-knowledge-base="handleKnowledgeBaseSelect"
          @knowledge-action="handleKnowledgeAction"
        />
      </el-splitter-panel>

      <!-- 知识库内容主区域面板 -->
      <el-splitter-panel>
        <KnowledgeContent
          :current-knowledge-base="currentKnowledgeBase"
          :file-list="fileList"
          :search-keyword="searchKeyword"
          :filtered-files="filteredFiles"
          :selected-file="selectedFile"
          @create-knowledge-base="createKnowledgeBase"
          @file-change="handleFileChange"
          @search="handleSearch"
          @refresh-file-list="refreshFileList"
          @show-upload-dialog="showUploadDialog"
          @file-select="handleFileSelect"
          @file-action="handleFileAction"
        />
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useIcon } from '../../composables/useIcon'
  import KnowledgeList from './KnowledgeList.vue'
  import KnowledgeContent from './KnowledgeContent.vue'

  const { getIconClass } = useIcon()

  // 响应式数据
  const isMounted = ref(false)
  const knowledgeBases = ref([
    {
      id: '1',
      name: '技术文档库',
      fileCount: 12,
      lastUpdated: '2024-01-15',
    },
    {
      id: '2',
      name: '产品手册库',
      fileCount: 8,
      lastUpdated: '2024-01-10',
    },
    {
      id: '3',
      name: 'API文档库',
      fileCount: 15,
      lastUpdated: '2024-01-12',
    },
  ])
  const selectedKnowledgeBase = ref('')
  const currentKnowledgeBase = computed(() =>
    knowledgeBases.value.find(kb => kb.id === selectedKnowledgeBase.value)
  )

  const fileList = ref([])
  const searchKeyword = ref('')
  const filteredFiles = ref([
    {
      id: '1',
      name: 'API文档.pdf',
      type: 'pdf',
      size: '2.5MB',
      uploadTime: '2024-01-15',
    },
    {
      id: '2',
      name: '用户手册.docx',
      type: 'docx',
      size: '1.8MB',
      uploadTime: '2024-01-14',
    },
    {
      id: '3',
      name: '配置说明.txt',
      type: 'txt',
      size: '156KB',
      uploadTime: '2024-01-13',
    },
    {
      id: '4',
      name: '开发指南.pdf',
      type: 'pdf',
      size: '3.2MB',
      uploadTime: '2024-01-12',
    },
  ])
  const selectedFile = ref('')

  // 方法
  const createKnowledgeBase = () => {
    // TODO: 实现创建知识库逻辑
    console.log('创建知识库')
  }

  const handleKnowledgeBaseSelect = index => {
    selectedKnowledgeBase.value = index
  }

  const handleKnowledgeAction = command => {
    const [action, id] = command.split('-')
    console.log(`${action} knowledge base ${id}`)
  }

  const handleFileChange = file => {
    console.log('文件变化:', file)
  }

  const handleSearch = keyword => {
    // TODO: 实现搜索逻辑
    console.log('搜索:', keyword)
    searchKeyword.value = keyword
  }

  const refreshFileList = () => {
    // TODO: 实现刷新文件列表逻辑
    console.log('刷新文件列表')
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

  onMounted(() => {
    isMounted.value = true
    // 如果有知识库，默认选中第一个
    if (knowledgeBases.value.length > 0) {
      selectedKnowledgeBase.value = knowledgeBases.value[0].id
    }
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
