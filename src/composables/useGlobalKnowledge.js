import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    deleteKnowledgeBase as deleteKnowledgeBaseFromDb,
    getAllKnowledgeBases,
    getDocumentsByKnowledgeBaseId,
    saveKnowledgeBase,
    updateKnowledgeBase,
    deleteDocument as deleteDocumentFromDb,
    deleteChunksByDocId,
} from '@/database'
import { fileProcessingService, searchService } from '@/services'

/**
 * 全局知识库状态管理
 * 封装知识库的创建、修改、删除和当前知识库状态
 */

// 全局响应式状态
const knowledgeBases = ref([])
const selectedKnowledgeBase = ref('')
const loading = ref(false)
const fileList = ref([])
const searchKeyword = ref('')
const filteredFiles = ref([])
const selectedFile = ref('')

// 文件上传相关状态
const uploading = ref(false)
const uploadProgress = ref(0)
const uploadStatus = ref('')
const uploadErrors = ref([])
const processingFiles = ref([])

// 搜索相关状态
const searching = ref(false)
const searchResults = ref([])
const searchQuery = ref('')
const searchType = ref('hybrid') // 'semantic', 'keyword', 'hybrid'
const showSearchResults = ref(false)

// 预览相关状态
const showPreviewDialog = ref(false)
const previewDocumentData = ref(null)

// 计算属性
const currentKnowledgeBase = computed(() =>
    knowledgeBases.value.find(kb => kb.id === selectedKnowledgeBase.value)
)

// 格式化日期
const formatDate = (dateString) => {
    if (!dateString) return '未知'
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('zh-CN')
    } catch (error) {
        return '未知'
    }
}

// 格式化文件大小
const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
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

// 加载知识库列表
const loadKnowledgeBases = async () => {
    try {
        loading.value = true
        const dbKnowledgeBases = await getAllKnowledgeBases()
        const formattedKnowledgeBases = dbKnowledgeBases.map(kb => ({
            id: kb.id.toString(),
            name: kb.name,
            description: kb.description,
            fileCount: 0, // 暂时设为0，后续可以计算
            lastUpdated: formatDate(kb.updatedAt),
        }))

        knowledgeBases.value = formattedKnowledgeBases

        // 如果有知识库，默认选中第一个
        if (formattedKnowledgeBases.length > 0 && !selectedKnowledgeBase.value) {
            selectedKnowledgeBase.value = formattedKnowledgeBases[0].id
        }

        return formattedKnowledgeBases
    } catch (error) {
        console.error('加载知识库失败:', error)
        ElMessage.error('加载知识库失败')
        return []
    } finally {
        loading.value = false
    }
}

// 创建知识库
const createKnowledgeBase = async (data) => {
    try {
        const id = await saveKnowledgeBase({
            name: data.name,
            description: data.description,
        })

        if (id) {
            ElMessage.success('知识库创建成功')
            // 重新加载知识库列表
            await loadKnowledgeBases()
            return id
        }
    } catch (error) {
        console.error('创建知识库失败:', error)
        ElMessage.error('创建知识库失败')
    }
    return null
}

// 更新知识库
const updateKnowledgeBaseHandler = async (id, data) => {
    try {
        const success = await updateKnowledgeBase(parseInt(id), {
            name: data.name,
            description: data.description,
        })

        if (success) {
            ElMessage.success('知识库更新成功')
            // 重新加载知识库列表
            await loadKnowledgeBases()
            return true
        }
    } catch (error) {
        console.error('更新知识库失败:', error)
        ElMessage.error('更新知识库失败')
    }
    return false
}

// 删除知识库
const deleteKnowledgeBase = async (id) => {
    try {
        await ElMessageBox.confirm('确定要删除这个知识库吗？删除后无法恢复。', '删除知识库', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        })

        const success = await deleteKnowledgeBaseFromDb(parseInt(id))
        if (success) {
            ElMessage.success('知识库删除成功')
            // 重新加载知识库列表
            await loadKnowledgeBases()
            return true
        }
    } catch (error) {
        if (error !== 'cancel') {
            console.error('删除知识库失败:', error)
            ElMessage.error('删除知识库失败')
        }
    }
    return false
}

// 选择知识库
const selectKnowledgeBase = async (id) => {
    selectedKnowledgeBase.value = id
    await loadDocuments(id)
}

// 加载文档
const loadDocuments = async (knowledgeBaseId) => {
    if (!knowledgeBaseId) {
        filteredFiles.value = []
        return
    }

    try {
        const documents = await getDocumentsByKnowledgeBaseId(parseInt(knowledgeBaseId))
        filteredFiles.value = documents.map(doc => {
            // 解析metadata获取文件大小等信息
            let metadata = {}
            try {
                metadata = doc.metadata ? JSON.parse(doc.metadata) : {}
            } catch (e) {
                console.warn('解析文档metadata失败:', e)
            }

            return {
                id: doc.id.toString(),
                name: doc.title,
                type: getFileType(doc.file_path || doc.filePath),
                size: metadata.fileSize ? formatFileSize(metadata.fileSize) : '未知',
                uploadTime: formatDate(doc.created_at || doc.createdAt),
                chunkCount: metadata.chunkCount || 0,
                fileType: metadata.fileType || 'unknown',
            }
        })
    } catch (error) {
        console.error('加载文档失败:', error)
        filteredFiles.value = []
    }
}

// 搜索文件（简单文件名搜索）
const searchFiles = (keyword) => {
    searchKeyword.value = keyword
    if (!keyword.trim()) {
        loadDocuments(selectedKnowledgeBase.value)
        showSearchResults.value = false
    } else {
        // 过滤文件列表
        const documents = filteredFiles.value.filter(file =>
            file.name.toLowerCase().includes(keyword.toLowerCase())
        )
        filteredFiles.value = documents
    }
}

// 语义搜索
const performSemanticSearch = async (query) => {
    if (!selectedKnowledgeBase.value) {
        ElMessage.warning('请先选择一个知识库')
        return
    }

    if (!query.trim()) {
        showSearchResults.value = false
        return
    }

    try {
        searching.value = true
        searchQuery.value = query

        let results
        switch (searchType.value) {
            case 'semantic':
                results = await searchService.searchInKnowledgeBase(
                    query,
                    selectedKnowledgeBase.value,
                    { limit: 20, similarityThreshold: 0.3 }
                )
                break
            case 'keyword':
                results = await searchService.keywordSearch(
                    query,
                    selectedKnowledgeBase.value,
                    { limit: 20 }
                )
                break
            case 'hybrid':
            default:
                results = await searchService.hybridSearch(
                    query,
                    selectedKnowledgeBase.value,
                    { limit: 20, keywordWeight: 0.3, semanticWeight: 0.7 }
                )
                break
        }

        searchResults.value = results.results || []
        showSearchResults.value = true

        if (searchResults.value.length === 0) {
            ElMessage.info('未找到相关内容')
        } else {
            ElMessage.success(`找到 ${searchResults.value.length} 个相关结果`)
        }

    } catch (error) {
        console.error('搜索失败:', error)
        ElMessage.error(`搜索失败: ${error.message}`)
        searchResults.value = []
        showSearchResults.value = false
    } finally {
        searching.value = false
    }
}

// 清除搜索结果
const clearSearchResults = () => {
    searchResults.value = []
    searchQuery.value = ''
    showSearchResults.value = false
    searchKeyword.value = ''
    loadDocuments(selectedKnowledgeBase.value)
}

// 设置搜索类型
const setSearchType = (type) => {
    searchType.value = type
    if (searchQuery.value.trim()) {
        performSemanticSearch(searchQuery.value)
    }
}

// 刷新文件列表
const refreshFileList = async () => {
    await loadDocuments(selectedKnowledgeBase.value)
}

// 选择文件
const selectFile = (fileId) => {
    selectedFile.value = fileId
}

// 预览文档
const previewDocument = (file) => {
    if (!file) {
        ElMessage.warning('文档信息不存在')
        return
    }

    previewDocumentData.value = file
    showPreviewDialog.value = true
}

// 删除文档
const deleteDocument = async (documentId, file) => {
    try {
        // 确认删除对话框
        await ElMessageBox.confirm(
            `确定要删除文档 "${file?.name || '未知文档'}" 吗？此操作不可撤销。`,
            '删除确认',
            {
                confirmButtonText: '删除',
                cancelButtonText: '取消',
                type: 'warning',
                confirmButtonClass: 'el-button--danger'
            }
        )

        // 执行删除操作
        const deleteSuccess = await deleteDocumentFromDb(documentId)

        if (deleteSuccess) {
            // 删除相关的文本块
            await deleteChunksByDocId(documentId)

            // 刷新文件列表
            await loadFileList()

            // 如果删除的是当前选中的文件，清除选中状态
            if (selectedFile.value === documentId) {
                selectedFile.value = ''
            }

            ElMessage.success('文档删除成功')
        } else {
            ElMessage.error('文档删除失败')
        }
    } catch (error) {
        if (error !== 'cancel') {
            console.error('删除文档时出错:', error)
            ElMessage.error(`删除文档失败: ${error.message || '未知错误'}`)
        }
    }
}

// 处理知识库操作
const handleKnowledgeAction = async (command) => {
    const [action, id] = command.split('-')
    if (action === 'edit') {
        const knowledgeBase = knowledgeBases.value.find(kb => kb.id === id)
        if (knowledgeBase) {
            await updateKnowledgeBaseHandler(id, knowledgeBase)
        }
    }
    if (action === 'delete') {
        await deleteKnowledgeBase(id)
    }
}

// 处理文件操作
const handleFileAction = async (command) => {
    const [action, id] = command.split('-')
    const file = filteredFiles.value.find(f => f.id === id)

    if (action === 'preview') {
        previewDocument(file)
    } else if (action === 'delete') {
        await deleteDocument(id, file)
    }
}

// 处理文件变化（拖拽上传）
const handleFileChange = async (file, fileList) => {
    if (!selectedKnowledgeBase.value) {
        ElMessage.warning('请先选择一个知识库')
        return
    }

    // 获取当前选中的文件列表
    const currentFiles = fileList || [file]

    try {
        uploading.value = true
        uploadProgress.value = 0
        uploadStatus.value = '准备上传...'
        uploadErrors.value = []
        processingFiles.value = []

        // 处理文件上传
        const result = await fileProcessingService.processUploadedFiles(
            currentFiles.map(f => f.raw || f), // 处理Element Plus的文件对象
            parseInt(selectedKnowledgeBase.value),
            {
                onProgress: (progress) => {
                    uploadProgress.value = progress.progress
                    uploadStatus.value = progress.message || '处理中...'
                },
                onFileProgress: (fileProgress) => {
                    // 更新单个文件的处理状态
                    const existingIndex = processingFiles.value.findIndex(
                        f => f.fileName === fileProgress.fileName
                    )
                    if (existingIndex >= 0) {
                        processingFiles.value[existingIndex] = {
                            ...processingFiles.value[existingIndex],
                            ...fileProgress
                        }
                    } else {
                        processingFiles.value.push({
                            fileName: fileProgress.fileName,
                            ...fileProgress
                        })
                    }
                }
            }
        )

        // 处理结果
        if (result.summary.success > 0) {
            ElMessage.success(`成功处理 ${result.summary.success} 个文件`)

            // 如果有错误，显示警告
            if (result.errors.length > 0) {
                uploadErrors.value = result.errors
                ElMessage.warning(`${result.errors.length} 个文件处理失败`)
            }

            // 刷新文件列表
            await refreshFileList()
        } else {
            throw new Error('所有文件处理失败')
        }

    } catch (error) {
        console.error('文件上传失败:', error)
        ElMessage.error(`文件上传失败: ${error.message}`)
        uploadErrors.value = [{ error: error.message }]
    } finally {
        uploading.value = false
        uploadStatus.value = ''
        processingFiles.value = []
    }
}

// 显示上传对话框
const showUploadDialog = () => {
    if (!selectedKnowledgeBase.value) {
        ElMessage.warning('请先选择一个知识库')
        return
    }

    // 触发文件选择器
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.accept = '.txt,.md,.json,.js,.ts,.vue,.css,.html'

    input.onchange = async (event) => {
        const files = Array.from(event.target.files)
        if (files.length > 0) {
            await handleFileChange(null, files)
        }
    }

    input.click()
}

// 创建全局状态对象
const globalKnowledgeState = {
    // 状态
    knowledgeBases,
    selectedKnowledgeBase,
    currentKnowledgeBase,
    loading,
    fileList,
    searchKeyword,
    filteredFiles,
    selectedFile,

    // 文件上传状态
    uploading,
    uploadProgress,
    uploadStatus,
    uploadErrors,
    processingFiles,

    // 搜索状态
    searching,
    searchResults,
    searchQuery,
    searchType,
    showSearchResults,

    // 预览状态
    showPreviewDialog,
    previewDocumentData,

    // 方法
    loadKnowledgeBases,
    createKnowledgeBase,
    updateKnowledgeBase: updateKnowledgeBaseHandler,
    deleteKnowledgeBase,
    selectKnowledgeBase,
    loadDocuments,
    searchFiles,
    refreshFileList,
    selectFile,
    previewDocument,
    deleteDocument,
    handleKnowledgeAction,
    handleFileAction,
    handleFileChange,
    showUploadDialog,

    // 搜索方法
    performSemanticSearch,
    clearSearchResults,
    setSearchType,
}

export function useGlobalKnowledge() {
    return globalKnowledgeState
} 