// src/database/chatService.js - 聊天会话数据库操作服务
import { SQL } from './sqlConstants.js'

const electronAPI = window.electronAPI

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

export {
  saveChatSession,
  getAllChatSessions,
  deleteChatSession,
} 