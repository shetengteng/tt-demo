import { ref, reactive, computed } from 'vue'
import { sendMessageToAI, availableModels } from '@/utils/api'
import { ElMessage } from 'element-plus'
import { v4 as uuidv4 } from 'uuid'
import { knowledgeSearchService } from '@/services'
import {
  initDb,
  saveChatSession,
  saveMessage,
  updateMessage,
  getAllChatSessions,
  getMessagesForChat,
  deleteChatSession,
} from '@/database/index.js'

// 导出数据库操作函数，使它们可以被 useGlobalMessageHandler 直接访问
export { saveChatSession, saveMessage, updateMessage }

// ==================== 全局状态 ====================
// 所有聊天会话
export const chatSessions = ref([])
// 当前活动的聊天会话ID
export const currentChatId = ref('')
export const isMounted = ref(true)
export const controller = ref(new AbortController())
export const currentModel = ref('')
// 数据库加载状态
export const isDbReady = ref(false)
// 初始化状态
export const isInitialized = ref(false)
// AI回复生成状态
export const isLoading = ref(false)

// ==================== 计算属性 ====================
// 获取当前聊天会话的消息
export const messages = computed(() => {
  const currentChat = chatSessions.value.find(
    chat => chat.id === currentChatId.value
  )
  return currentChat ? currentChat.messages : []
})

// ==================== 工具函数 ====================
// 获取模型显示名称的函数
export const getModelDisplayName = modelId => {
  const model = availableModels.find(m => m.value === modelId)
  return model ? model.label : modelId
}

// 更新当前模型
export const updateCurrentModel = () => {
  const modelId = localStorage.getItem('selectedModel') || 'deepseek-chat'
  currentModel.value = getModelDisplayName(modelId)
}

// ==================== 核心方法 ====================
// 初始化全局状态
export const initialize = async () => {
  if (isInitialized.value) return

  try {
    // 初始化数据库
    await initDb()
    isDbReady.value = true

    // 加载所有聊天会话
    chatSessions.value = await getAllChatSessions()

    // 如果有会话，选择最近更新的一个
    if (chatSessions.value.length > 0) {
      // 会话已经按最后更新时间排序
      await selectChat(chatSessions.value[0].id)
    } else {
      // 没有会话就创建一个新的
      await createNewChat()
    }

    isInitialized.value = true
  } catch (error) {
    console.error('全局消息处理器初始化失败:', error)
    ElMessage.error('加载聊天记录失败')
    isDbReady.value = false
  }

  // 获取当前选择的模型
  updateCurrentModel()
}

// 清理全局状态
export const cleanup = () => {
  isMounted.value = false
  controller.value.abort()
  isInitialized.value = false
}

// 创建新的聊天会话
export const createNewChat = async () => {
  const newChatId = uuidv4()
  const newChat = {
    id: newChatId,
    title: '新的聊天', // 默认标题
    messages: [],
    createdAt: Date.now(),
    lastUpdated: Date.now(),
    knowledgeBaseId: null,    // 初始化知识库ID为null
    knowledgeBaseName: null   // 初始化知识库名称为null
  }

  chatSessions.value.unshift(newChat) // 添加到列表开头
  currentChatId.value = newChatId // 切换到新会话

  // 保存会话到SQLite数据库
  try {
    await saveChatSession(newChat)
  } catch (error) {
    console.error('创建新聊天会话失败:', error)
    ElMessage.error('创建新聊天失败')
  }

  return newChatId
}

// 选择聊天会话
export const selectChat = async chatId => {
  // 如果已经是当前会话，不做任何操作
  if (currentChatId.value === chatId) return

  currentChatId.value = chatId

  // 如果该会话还没有加载消息，从数据库加载
  const currentChat = chatSessions.value.find(chat => chat.id === chatId)
  if (
    currentChat &&
    (!currentChat.messages || currentChat.messages.length === 0)
  ) {
    try {
      currentChat.messages = await getMessagesForChat(chatId)
    } catch (error) {
      console.error('加载会话消息失败:', error)
      ElMessage.error('加载聊天记录失败')
    }
  }
}

// 删除聊天会话
export const deleteChat = async chatId => {
  const index = chatSessions.value.findIndex(chat => chat.id === chatId)

  if (index !== -1) {
    // 从列表中移除
    chatSessions.value.splice(index, 1)

    // 从数据库中删除
    try {
      await deleteChatSession(chatId)
    } catch (error) {
      console.error('删除聊天会话失败:', error)
      ElMessage.error('删除聊天记录失败')
      return
    }

    // 如果删除的是当前选中的会话
    if (currentChatId.value === chatId) {
      // 如果还有其他会话，选择第一个
      if (chatSessions.value.length > 0) {
        await selectChat(chatSessions.value[0].id)
      } else {
        // 如果没有其他会话，创建一个新的
        await createNewChat()
      }
    }

    // 提示删除成功
    ElMessage.success('聊天记录已删除')
  }
}

// 添加重命名聊天函数
export const renameChat = async data => {
  const { id, title } = data
  const chat = chatSessions.value.find(chat => chat.id === id)

  if (chat && title.trim()) {
    // 更新标题
    chat.title = title.trim()
    chat.lastUpdated = Date.now()

    // 保存到数据库
    try {
      await saveChatSession(chat)
    } catch (error) {
      console.error('重命名聊天会话失败:', error)
      ElMessage.error('重命名聊天记录失败')
      return
    }

    // 提示重命名成功
    ElMessage.success('聊天记录已重命名')
  }
}

// 更新会话标题（根据第一条消息内容）
export const updateChatTitle = async (chatId, message) => {
  const chat = chatSessions.value.find(chat => chat.id === chatId)
  if (chat) {
    // 使用用户第一条消息的前15个字符作为标题
    if (chat.title === '新的聊天' && message.isUser) {
      const title = message.content.substring(0, 15)
      chat.title = title + (title.length >= 15 ? '...' : '')
    }

    // 更新时间戳
    chat.lastUpdated = Date.now()

    // 保存到数据库
    try {
      await saveChatSession(chat)
    } catch (error) {
      console.error('更新聊天标题失败:', error)
    }
  }
}

// 处理模型变更
export const handleModelChange = async () => {
  updateCurrentModel()
  ElMessage.success(`已切换到 ${currentModel.value} 模型`)

  // 添加系统消息，表明模型已切换
  if (isMounted.value && currentChatId.value) {
    const systemMsg = {
      content: `*系统: 已切换到 ${currentModel.value} 模型*`,
      isUser: false,
      isSystem: true,
    }

    // 找到当前会话并添加消息
    const currentChat = chatSessions.value.find(
      chat => chat.id === currentChatId.value
    )
    if (currentChat) {
      currentChat.messages.push(systemMsg)
      currentChat.lastUpdated = Date.now()

      // 保存到数据库
      try {
        await saveChatSession(currentChat)
        await saveMessage(currentChatId.value, systemMsg)
      } catch (error) {
        console.error('保存系统消息失败:', error)
      }
    }
  }
}

// 发送消息处理
export const handleSendMessage = async message => {
  // 支持字符串或结构化消息对象
  const isMessageObject = typeof message === 'object'
  const messageContent = isMessageObject ? message.content : message

  if (!messageContent.trim() || !isDbReady.value) return

  // 设置loading状态
  isLoading.value = true

  // 更新当前模型信息
  updateCurrentModel()

  // 确保有当前会话
  if (!currentChatId.value || !chatSessions.value.find(chat => chat.id === currentChatId.value)) {
    await createNewChat()
  }

  const currentChat = chatSessions.value.find(chat => chat.id === currentChatId.value)
  if (!currentChat) return

  try {
    // 添加用户消息 - 如果message是对象且isUser为true，则使用该对象，否则创建新消息
    const userMsg = isMessageObject && message.isUser
      ? message
      : { content: messageContent, isUser: true }

    // 将用户消息添加到会话
    currentChat.messages.push(userMsg)
    await updateChatTitle(currentChatId.value, userMsg)
    await saveMessage(currentChatId.value, userMsg)

    // 如果传入的是完整消息对象，并且不是用户消息（即是AI消息），直接使用
    if (isMessageObject && !message.isUser) {
      // 是已经构建好的AI消息对象（如知识库搜索结果）
      currentChat.messages.push(message)

      // 如果消息包含知识库信息，保存到会话中
      if (message.knowledgeBaseId) {
        currentChat.knowledgeBaseId = message.knowledgeBaseId
        currentChat.knowledgeBaseName = message.knowledgeBaseName || null
      }

      currentChat.lastUpdated = Date.now()
      await saveMessage(currentChatId.value, message)
      await saveChatSession(currentChat)
      isLoading.value = false
      return
    }

    // 创建标准AI消息
    const modelId = localStorage.getItem('selectedModel') || 'deepseek-chat'
    const isReasoningModel = modelId === 'deepseek-reasoner'

    const aiMsg = reactive({
      content: '',
      isUser: false,
      model: currentModel.value,
      ...(isReasoningModel && {
        reasoningContent: '',
        reasoningComplete: false,
        tempContent: '',
        contentStarted: false,
        isReasoningModel: true,
      })
    })

    currentChat.messages.push(aiMsg)
    currentChat.lastUpdated = Date.now()
    await saveMessage(currentChatId.value, aiMsg)
    await saveChatSession(currentChat)

    // 发送消息到AI
    controller.value = new AbortController()
    await sendMessageToAI(
      messageContent,
      async chunk => {
        if (!isMounted.value) return

        if (isReasoningModel) {
          handleReasoningModelChunk(aiMsg, chunk)
        } else {
          aiMsg.content += chunk.content
        }

        // 定期更新数据库中的AI消息内容
        try {
          const messageIndex = currentChat.messages.length - 1
          const updates = {}

          if (isReasoningModel) {
            if (aiMsg.reasoningContent) updates.reasoningContent = aiMsg.reasoningContent
            if (aiMsg.content) updates.content = aiMsg.content
            if (aiMsg.reasoningComplete) updates.reasoningComplete = aiMsg.reasoningComplete
          } else {
            if (aiMsg.content) updates.content = aiMsg.content
          }

          if (Object.keys(updates).length > 0) {
            await updateMessage(currentChatId.value, messageIndex, updates)
          }
        } catch (error) {
          console.error('更新AI消息失败:', error)
        }
      },
      controller.value.signal
    )

    // 完成处理
    if (isReasoningModel) {
      aiMsg.reasoningComplete = true
      aiMsg.content = aiMsg.tempContent || aiMsg.content

      // 最终更新数据库
      try {
        const messageIndex = currentChat.messages.length - 1
        await updateMessage(currentChatId.value, messageIndex, {
          reasoningComplete: true,
          content: aiMsg.content,
          reasoningContent: aiMsg.reasoningContent
        })
      } catch (error) {
        console.error('更新最终AI消息失败:', error)
      }
    }

    // 最终保存
    currentChat.lastUpdated = Date.now()
    await saveChatSession(currentChat)

  } catch (error) {
    handleSendMessageError(error, currentChat)
  } finally {
    isLoading.value = false
  }
}

// 处理推理模型的数据块
const handleReasoningModelChunk = (aiMsg, chunk) => {
  switch (chunk.type) {
    case 'reasoning':
      // 思考过程内容
      aiMsg.reasoningContent += chunk.content
      break
    case 'content':
      // 实时显示最终回答内容
      aiMsg.tempContent = (aiMsg.tempContent || '') + chunk.content
      aiMsg.content = aiMsg.tempContent // 更新完整内容
      break
    case 'content_started':
      // 标记已开始接收答案内容
      aiMsg.contentStarted = true
      break
    case 'reasoning_complete':
      // 标记思考过程已完成
      aiMsg.reasoningComplete = true
      break
  }
}

// 处理发送消息错误
const handleSendMessageError = async (error, currentChat) => {
  if (error.name === 'AbortError') {
    // 用户取消请求，移除未完成的AI消息
    if (currentChat.messages.length > 0 && !currentChat.messages[currentChat.messages.length - 1].isUser) {
      currentChat.messages.pop()
    }
  } else {
    // 其他错误，显示错误消息
    const errorMsg = `错误: ${error.message || '请求失败，请检查API密钥或网络连接'}`
    const aiMsg = currentChat.messages[currentChat.messages.length - 1]
    if (aiMsg && !aiMsg.isUser) {
      aiMsg.content = errorMsg

      // 保存错误消息到数据库
      try {
        const messageIndex = currentChat.messages.length - 1
        await updateMessage(currentChatId.value, messageIndex, {
          content: errorMsg
        })
      } catch (updateError) {
        console.error('保存错误消息失败:', updateError)
      }
    }
    ElMessage.error(errorMsg)
  }
}

// ==================== 兼容性函数 ====================
// 为了保持向后兼容，提供一个 useGlobalMessageHandler 函数
export function useGlobalMessageHandler() {
  return {
    // 状态
    chatSessions,
    currentChatId,
    isMounted,
    controller,
    currentModel,
    isDbReady,
    isInitialized,
    isLoading,
    messages,

    // 方法
    initialize,
    cleanup,
    handleSendMessage,
    handleModelChange,
    createNewChat,
    selectChat,
    deleteChat,
    renameChat,
    updateCurrentModel,
    getModelDisplayName,
    updateMessage, // 添加 updateMessage 到导出列表
    saveMessage,   // 添加 saveMessage 到导出列表
    saveChatSession // 添加 saveChatSession 到导出列表
  }
}
