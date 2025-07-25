// src/database/messageService.js - 消息数据库操作服务
import { SQL } from './sqlConstants.js'

const electronAPI = window.electronAPI

// 保存消息
async function saveMessage(chatId, message) {
  try {
    const isUser = message.isUser ? 1 : 0
    const isSystem = message.isSystem ? 1 : 0
    const isReasoningModel = message.isReasoningModel ? 1 : 0
    const reasoningComplete = message.reasoningComplete ? 1 : 0
    const timestamp = Date.now()

    await electronAPI.db.run(SQL.INSERT_MESSAGE, [
      chatId,
      message.content,
      message.reasoningContent || null,
      isUser,
      isSystem,
      message.model || null,
      timestamp,
      isReasoningModel,
      reasoningComplete,
    ])
    return true
  } catch (error) {
    console.error('保存消息失败:', error)
    return false
  }
}

// 更新消息内容（用于流式更新AI消息）
async function updateMessage(chatId, messageIndex, updates) {
  try {
    // 首先获取该聊天会话的指定索引消息的ID
    const messages = await electronAPI.db.query(
      SQL.SELECT_MESSAGES_BY_CHAT_ID,
      [chatId]
    )

    if (messageIndex >= messages.length) {
      throw new Error('消息索引超出范围')
    }

    const messageId = messages[messageIndex].id

    // 构建更新SQL语句
    let updateSQL = 'UPDATE messages SET '
    const params = []
    const updateFields = []

    if ('content' in updates) {
      updateFields.push('content = ?')
      params.push(updates.content)
    }

    if ('reasoningContent' in updates) {
      updateFields.push('reasoning_content = ?')
      params.push(updates.reasoningContent)
    }

    if ('reasoningComplete' in updates) {
      updateFields.push('reasoning_complete = ?')
      params.push(updates.reasoningComplete ? 1 : 0)
    }

    updateSQL += updateFields.join(', ') + ' WHERE id = ?'
    params.push(messageId)

    // 执行更新
    await electronAPI.db.run(updateSQL, params)
    return true
  } catch (error) {
    console.error('更新消息失败:', error)
    return false
  }
}

// 获取指定聊天会话的所有消息
async function getMessagesForChat(chatId) {
  try {
    const rows = await electronAPI.db.query(SQL.SELECT_MESSAGES_BY_CHAT_ID, [
      chatId,
    ])

    // 转换数据格式为应用中使用的格式
    return rows.map(row => ({
      id: row.id,
      chatId: row.chat_id,
      content: row.content,
      reasoningContent: row.reasoning_content,
      isUser: row.is_user === 1,
      isSystem: row.is_system === 1,
      model: row.model,
      timestamp: row.timestamp,
      isReasoningModel: row.is_reasoning_model === 1,
      reasoningComplete: row.reasoning_complete === 1,
    }))
  } catch (error) {
    console.error('获取消息失败:', error)
    return []
  }
}

export {
  saveMessage,
  updateMessage,
  getMessagesForChat,
} 