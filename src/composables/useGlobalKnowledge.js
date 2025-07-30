import { computed, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    deleteKnowledgeBase as deleteKnowledgeBaseFromDb,
    getAllKnowledgeBases,
    getDocumentsByKnowledgeBaseId,
    saveKnowledgeBase,
    updateKnowledgeBase,
} from '@/database'

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

// 搜索文件
const searchFiles = (keyword) => {
    searchKeyword.value = keyword
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

// 刷新文件列表
const refreshFileList = async () => {
    await loadDocuments(selectedKnowledgeBase.value)
}

// 选择文件
const selectFile = (fileId) => {
    selectedFile.value = fileId
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
const handleFileAction = (command) => {
    const [action, id] = command.split('-')
    const file = filteredFiles.value.find(f => f.id === id)

    if (action === 'preview') {
        // TODO: 实现文件预览逻辑
        console.log('预览文件:', file)
    } else if (action === 'delete') {
        // TODO: 实现删除文件逻辑
        console.log('删除文件:', file)
    }
}

// 处理文件变化
const handleFileChange = (file) => {
    console.log('文件变化:', file)
    // TODO: 实现文件上传逻辑
}

// 显示上传对话框
const showUploadDialog = () => {
    // TODO: 实现显示上传对话框逻辑
    console.log('显示上传对话框')
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
    handleKnowledgeAction,
    handleFileAction,
    handleFileChange,
    showUploadDialog,
}

export function useGlobalKnowledge() {
    return globalKnowledgeState
} 