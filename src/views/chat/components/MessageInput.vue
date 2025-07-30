<template>
  <div class="input-area">
    <div class="input-row">
      <el-input
        v-model="inputMessage"
        placeholder="输入您的问题..."
        @keyup.enter="sendMessage"
        class="message-input"
      ></el-input>
    </div>
    <div class="action-row">
      <!-- 将模型选择和知识库选择放置在一起并居中 -->
      <div class="selector-container">
        <el-select
          v-model="selectedModel"
          placeholder="选择模型"
          class="model-selector"
          @change="changeModel"
        >
          <el-option
            v-for="model in availableModels"
            :key="model.value"
            :label="model.label"
            :value="model.value"
          />
        </el-select>
        
        <el-select
          v-model="selectedKnowledgeBase"
          placeholder="选择知识库(可选)"
          class="kb-selector"
          clearable
          @change="changeKnowledgeBase"
        >
          <el-option
            v-for="kb in knowledgeBases"
            :key="kb.id"
            :label="kb.name"
            :value="kb.id"
          />
        </el-select>
      </div>

      <div class="button-group">
        <el-button type="primary" class="send-btn" @click="sendMessage" :loading="isLoading">
          <i :class="getIconClass('send')"></i>
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, onMounted, watch } from 'vue'
  import { availableModels } from '@/utils/api.js'
  import { useIcon } from '@/composables/useIcon.js'
  import { knowledgeSearchService } from '@/services'
  import { getAllKnowledgeBases, getKnowledgeBaseById } from '@/database'
  import { ElMessage } from 'element-plus'
  import { useGlobalMessageHandler } from '@/composables/useGlobalMessageHandler'

  const { getIconClass } = useIcon()
  const inputMessage = ref('')
  const selectedModel = ref('')
  const selectedKnowledgeBase = ref(null)
  const activeKnowledgeBaseName = ref('')
  const knowledgeBases = ref([])
  const isLoading = ref(false)
  const emit = defineEmits(['send-message', 'change-model', 'update-message'])
  const { currentChatId, chatSessions, saveChatSession } = useGlobalMessageHandler()

  // 初始化时获取当前选择的模型和加载知识库
  onMounted(async () => {
    // 加载模型设置
    const savedModel = localStorage.getItem('selectedModel') || 'deepseek-chat'
    selectedModel.value = savedModel
    
    // 加载知识库列表
    try {
      knowledgeBases.value = await getAllKnowledgeBases()
      
      // 如果当前会话已有关联知识库，加载它
      if (currentChatId.value) {
        const currentChat = chatSessions.value.find(chat => chat.id === currentChatId.value)
        if (currentChat && currentChat.knowledgeBaseId) {
          selectedKnowledgeBase.value = currentChat.knowledgeBaseId
          await updateActiveKnowledgeBaseName()
        }
      }
    } catch (error) {
      console.error('加载知识库列表失败:', error)
    }
  })
  
  // 监听知识库变化
  watch(selectedKnowledgeBase, async () => {
    await updateActiveKnowledgeBaseName()
  })
  
  // 监听当前会话ID变化，当切换会话时更新知识库信息
  watch(currentChatId, async (newChatId) => {
    if (newChatId) {
      const currentChat = chatSessions.value.find(chat => chat.id === newChatId)
      if (currentChat) {
        // 更新知识库选择
        selectedKnowledgeBase.value = currentChat.knowledgeBaseId || null
        await updateActiveKnowledgeBaseName()
      } else {
        // 重置知识库选择
        selectedKnowledgeBase.value = null
        activeKnowledgeBaseName.value = ''
      }
    }
  })
  
  // 更新当前显示的知识库名称
  const updateActiveKnowledgeBaseName = async () => {
    if (!selectedKnowledgeBase.value) {
      activeKnowledgeBaseName.value = ''
      return
    }
    
    try {
      const kb = await getKnowledgeBaseById(selectedKnowledgeBase.value)
      if (kb) {
        activeKnowledgeBaseName.value = kb.name
      } else {
        // 知识库不存在，清空选择
        selectedKnowledgeBase.value = null
        activeKnowledgeBaseName.value = ''
        ElMessage.warning('选择的知识库不存在或已被删除')
      }
    } catch (error) {
      console.error('获取知识库信息失败:', error)
      activeKnowledgeBaseName.value = ''
    }
  }
  
  // 知识库选择变更
  const changeKnowledgeBase = async () => {
    if (currentChatId.value) {
      const currentChat = chatSessions.value.find(chat => chat.id === currentChatId.value)
      if (currentChat) {
        // 保存知识库选择到当前会话
        currentChat.knowledgeBaseId = selectedKnowledgeBase.value
        currentChat.lastUpdated = Date.now()
        await saveChatSession(currentChat)
        
        if (selectedKnowledgeBase.value) {
          ElMessage.success(`已切换到知识库: ${activeKnowledgeBaseName.value}`)
        } else {
          ElMessage.info('已取消知识库选择')
        }
      }
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.value.trim()) return
    
    isLoading.value = true
    
    try {
      // 如果选择了知识库，则使用知识库搜索
      if (selectedKnowledgeBase.value) {
        await handleKnowledgeSearch()
      } else {
        // 否则使用常规模型回答
        handleNormalModelMessage()
      }
    } finally {
      isLoading.value = false
    }
  }

  // 处理常规模型消息
  const handleNormalModelMessage = () => {
    emit('send-message', inputMessage.value)
    inputMessage.value = ''
  }
  
  // 处理知识库搜索
  const handleKnowledgeSearch = async () => {
    // 提交用户消息
    const userMessage = inputMessage.value
    emit('send-message', {
      content: userMessage,
      isUser: true
    })
    
    // 清空输入框
    inputMessage.value = ''
    
    // 创建中断控制器
    const controller = new AbortController()
    
    // 创建AI回复消息
    const aiMessage = {
      content: '',
      isUser: false,
      isKnowledgeBase: true,
      knowledgeBaseId: selectedKnowledgeBase.value,
      knowledgeBaseName: activeKnowledgeBaseName.value // 添加知识库名称
    }
    
    // 提交AI消息（空内容，后续会填充）
    emit('send-message', aiMessage)
    
    try {
      // 调用知识库搜索服务
      await knowledgeSearchService.processQuery(
        userMessage,
        selectedKnowledgeBase.value,
        (chunk) => {
          if (chunk.type === 'content') {
            // 累积AI响应内容
            aiMessage.content += chunk.content
            
            // 通知父组件更新消息
            emit('update-message', aiMessage)
          } else if (chunk.type === 'system' || chunk.type === 'error') {
            // 可以添加系统消息处理逻辑
            console.log('系统消息:', chunk.content)
          }
        },
        controller.signal
      )
    } catch (error) {
      console.error('知识库搜索失败:', error)
      ElMessage.error(`搜索失败: ${error.message}`)
    }
  }

  const changeModel = () => {
    localStorage.setItem('selectedModel', selectedModel.value)
    emit('change-model', selectedModel.value)
  }
</script>

<style scoped>
  .input-area {
    padding: 16px;
    width: 100%;
    box-sizing: border-box;
    background-color: var(--chat-bg-color, #ffffff);
    border-radius: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e0e0e0;
  }

  .input-row {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 12px;
  }
  
  /* 模型和知识库选择器容器 */
  .selector-container {
    display: flex;
    gap: 12px;
    justify-content: flex-start; /* 改为左对齐 */
  }

  .model-selector, .kb-selector {
    width: 160px;
    border-radius: 12px;
  }

  .message-input {
    flex: 1;
  }

  .action-row {
    display: flex;
    gap: 12px;
    justify-content: space-between; /* 保持两端对齐，使按钮组靠右 */
    align-items: center;
  }

  .button-group {
    display: flex;
    gap: 8px;
  }

  .send-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    border-radius: 12px;
    padding: 8px 16px;
    background-color: #000033;
  }

  .send-btn i {
    font-size: 18px;
  }
  
  /* 当前知识库信息显示 */
  .current-info {
    margin-top: 8px;
    text-align: center;
    color: var(--secondary-text-color, #666);
    font-size: 12px;
  }

  /* Element UI 主题适配 */
  :deep(.el-input__wrapper) {
    background-color: var(--card-bg, #f5f5f5);
    border-color: transparent;
    border-radius: 12px;
    box-shadow: none;
  }

  :deep(.el-input__inner) {
    color: var(--text-color, #000000);
    background-color: transparent;
    font-size: 14px;
  }

  :deep(.el-input__inner::placeholder) {
    color: var(--secondary-text-color, #999);
  }

  :deep(.el-select__wrapper) {
    background-color: var(--card-bg, #f5f5f5);
    border-color: transparent;
    border-radius: 12px;
    box-shadow: none;
  }

  :deep(.el-button) {
    border: 1px solid #e0e0e0;
    font-weight: 500;
  }

  :deep(.el-button--primary) {
    background-color: #000033;
    border-color: #000033;
    color: white;
  }

  :deep(.el-button--primary:hover) {
    background-color: #000066;
    border-color: #000066;
  }

  /* Dark theme overrides */
  .dark-theme :deep(.el-input__wrapper) {
    background-color: var(--card-bg, #3a3a3a);
    color: var(--text-color, #d0d0d0);
  }

  .dark-theme :deep(.el-input__inner) {
    color: var(--text-color, #d0d0d0);
  }

  .dark-theme :deep(.el-select__wrapper) {
    background-color: var(--card-bg, #3a3a3a);
    color: var(--text-color, #d0d0d0);
  }

  .dark-theme :deep(.el-select-dropdown) {
    background-color: var(--card-bg, #3a3a3a);
    border-color: var(--border-color, #666666);
  }

  .dark-theme :deep(.el-select-dropdown__item) {
    color: var(--text-color, #d0d0d0);
  }

  .dark-theme :deep(.el-select-dropdown__item:hover) {
    background-color: var(--hover-color, #444444);
  }

  .dark-theme :deep(.el-select-dropdown__item.selected) {
    background-color: var(--primary-color, #4a82f0);
    color: white;
  }
</style>
