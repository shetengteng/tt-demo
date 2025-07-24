// src/utils/db.js - SQLite数据库操作服务
import { SQL } from '@/composables/sqlConstants.js' // 导入SQL常量

const electronAPI = window.electronAPI

// 数据库初始化
async function initDb() {
  try {
    await electronAPI.db.initDb()
    console.log('数据库初始化完成')
    return true
  } catch (error) {
    console.error('数据库初始化失败:', error)
    return false
  }
}

// 保存聊天会话
async function saveChatSession(chat) {
  try {
    // 确保title不为空
    if (!chat.title || chat.title.trim() === '') {
      chat.title = '未命名会话'
    }

    await electronAPI.db.run(
      SQL.INSERT_OR_REPLACE_CHAT_SESSION,
      [chat.id, chat.title, chat.createdAt, chat.lastUpdated]
    )
    return true
  } catch (error) {
    console.error('保存聊天会话失败:', error)
    return false
  }
}

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

// 获取所有聊天会话
async function getAllChatSessions() {
  try {
    const rows = await electronAPI.db.query(SQL.SELECT_ALL_CHAT_SESSIONS)

    // 转换数据格式为应用中使用的格式
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      createdAt: row.created_at,
      lastUpdated: row.last_updated,
      messages: [], // 暂时为空，后面会加载
    }))
  } catch (error) {
    console.error('获取聊天会话失败:', error)
    return []
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

// 删除聊天会话
async function deleteChatSession(chatId) {
  try {
    // 首先删除该会话的所有消息
    await electronAPI.db.run(SQL.DELETE_MESSAGES_BY_CHAT_ID, [chatId])

    // 然后删除会话本身
    await electronAPI.db.run(SQL.DELETE_CHAT_SESSION, [chatId])

    return true
  } catch (error) {
    console.error('删除聊天会话失败:', error)
    return false
  }
}

// 保存配置项
async function saveConfig(key, value) {
  try {
    const timestamp = Date.now()
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value)

    await electronAPI.db.run(SQL.UPSERT_CONFIG, [key, jsonValue, timestamp])
    return true
  } catch (error) {
    console.error('保存配置失败:', error)
    return false
  }
}

// 获取配置项
async function getConfig(key, defaultValue = null) {
  try {
    const rows = await electronAPI.db.query(SQL.SELECT_CONFIG, [key])

    if (rows.length === 0) {
      return defaultValue
    }

    try {
      // 尝试解析JSON
      return JSON.parse(rows[0].value)
    } catch (e) {
      // 如果解析失败，直接返回字符串值
      return rows[0].value
    }
  } catch (error) {
    console.error('获取配置失败:', error)
    return defaultValue
  }
}

// 获取所有配置
async function getAllConfigs() {
  try {
    const rows = await electronAPI.db.query(SQL.SELECT_ALL_CONFIGS)

    const configs = {}
    for (const row of rows) {
      try {
        configs[row.key] = JSON.parse(row.value)
      } catch (e) {
        configs[row.key] = row.value
      }
    }

    return configs
  } catch (error) {
    console.error('获取所有配置失败:', error)
    return {}
  }
}

// 删除配置项
async function deleteConfig(key) {
  try {
    await electronAPI.db.run(SQL.DELETE_CONFIG, [key])
    return true
  } catch (error) {
    console.error('删除配置失败:', error)
    return false
  }
}

// 导出模块
export {
  initDb,
  saveChatSession,
  saveMessage,
  updateMessage,
  getAllChatSessions,
  getMessagesForChat,
  deleteChatSession,
  saveConfig,
  getConfig,
  getAllConfigs,
  deleteConfig,
}
