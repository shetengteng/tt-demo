<template>
  <el-dialog
    v-model="dialogVisible"
    title="知识库搜索"
    width="800px"
    :before-close="handleClose"
    destroy-on-close
    class="knowledge-search-dialog"
  >
    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-input-wrapper">
                 <el-input
           v-model="searchKeyword"
           placeholder="输入关键词进行搜索..."
           clearable
           @keyup.enter="handleSearch"
           :loading="searching"
           size="large"
         >
           <template #prefix>
             <i class="ri-search-line"></i>
           </template>
          <template #append>
            <el-button type="primary" @click="handleSearch" :loading="searching">
              搜索
            </el-button>
          </template>
        </el-input>
      </div>

      <!-- 搜索类型选择 -->
      <div class="search-options">
        <div class="search-type-label">搜索类型：</div>
                 <el-radio-group v-model="searchType" @change="onSearchTypeChange">
           <el-radio value="hybrid">
             <i class="ri-git-merge-line option-icon"></i>
             混合搜索
           </el-radio>
           <el-radio value="semantic">
             <i class="ri-ai-generate option-icon"></i>
             语义搜索
           </el-radio>
           <el-radio value="keyword">
             <i class="ri-search-line option-icon"></i>
             关键词搜索
           </el-radio>
         </el-radio-group>
      </div>

      <!-- 搜索状态 -->
             <div v-if="searching" class="search-status">
         <el-text type="info">
           <i class="ri-loader-4-line is-loading"></i>
           正在搜索...
         </el-text>
       </div>
    </div>

    <!-- 搜索结果区域 -->
    <div class="search-results-section" v-if="hasSearched">
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
          <div
            v-for="result in searchResults"
            :key="`${result.documentId}-${result.id}`"
            class="result-item"
            @click="selectSearchResult(result)"
          >
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

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
        <el-button v-if="hasSearched" @click="clearSearch">清除搜索</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useGlobalKnowledge } from '@/composables/useGlobalKnowledge'

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  knowledgeBaseId: {
    type: String,
    default: ''
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'result-selected'])

// 响应式数据
const dialogVisible = ref(false)
const searchKeyword = ref('')
const searchType = ref('hybrid')
const hasSearched = ref(false)

// 使用全局知识库状态管理
const {
  searching,
  searchResults,
  performSemanticSearch,
  setSearchType: globalSetSearchType,
  selectFile
} = useGlobalKnowledge()

// 监听外部传入的显示状态
watch(() => props.modelValue, (newVal) => {
  dialogVisible.value = newVal
})

// 监听弹框显示状态
watch(dialogVisible, (newVal) => {
  emit('update:modelValue', newVal)
  if (!newVal) {
    // 弹框关闭时重置状态
    searchKeyword.value = ''
    hasSearched.value = false
  }
})

// 计算属性
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

// 方法
const handleSearch = async () => {
  if (!searchKeyword.value.trim()) {
    return
  }

  hasSearched.value = true
  
  // 设置搜索类型
  globalSetSearchType(searchType.value)
  
  // 执行搜索，只在当前知识库中搜索
  await performSemanticSearch(searchKeyword.value.trim(), props.knowledgeBaseId)
}

const handleClose = () => {
  dialogVisible.value = false
}

const clearSearch = () => {
  searchKeyword.value = ''
  hasSearched.value = false
  // 这里可以调用全局的清除搜索结果方法
}

const onSearchTypeChange = () => {
  // 如果已经有搜索关键词，重新搜索
  if (searchKeyword.value.trim() && hasSearched.value) {
    handleSearch()
  }
}

const selectSearchResult = (result) => {
  // 选择搜索结果
  selectFile(result.documentId)
  emit('result-selected', result)
  // 关闭弹框
  handleClose()
}
</script>

<style scoped>
.knowledge-search-dialog {
  max-height: 80vh;
}

.search-section {
  margin-bottom: 20px;
}

.search-input-wrapper {
  margin-bottom: 16px;
}

.search-options {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  padding: 12px 16px;
  background-color: var(--fill-color-light, #f5f7fa);
  border-radius: 8px;
}

.search-type-label {
  font-weight: 500;
  color: var(--text-color, #333);
  font-size: 14px;
}

.option-icon {
  margin-right: 4px;
  font-size: 14px;
}

.search-status {
  text-align: center;
  padding: 10px;
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
  max-height: 400px;
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

/* 自定义滚动条样式 */
.search-results-list::-webkit-scrollbar {
  width: 6px;
}

.search-results-list::-webkit-scrollbar-track {
  background-color: transparent;
}

.search-results-list::-webkit-scrollbar-thumb {
  background-color: var(--border-color, #d0d0d0);
  border-radius: 3px;
}

.search-results-list::-webkit-scrollbar-thumb:hover {
  background-color: var(--secondary-text-color, #999);
}
</style> 