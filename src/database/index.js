// src/database/index.js - 数据库服务统一导出
import {
  saveChatSession,
  getAllChatSessions,
  deleteChatSession,
} from './chatService.js'

import {
  saveMessage,
  updateMessage,
  getMessagesForChat,
} from './messageService.js'

import {
  saveConfig,
  getConfig,
  getAllConfigs,
  deleteConfig,
} from './configService.js'

import {
  saveDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
} from './documentService.js'

import {
  saveKnowledgeBase,
  updateKnowledgeBase,
  getAllKnowledgeBases,
  getKnowledgeBaseById,
  deleteKnowledgeBase,
  getDocumentsByKnowledgeBaseId,
} from './knowledgeBaseService.js'

import {
  saveChunk,
  saveChunks,
  getChunksByDocId,
  deleteChunksByDocId,
} from './chunkService.js'

import {
  initDb,
} from './initService.js'

// 统一导出所有数据库服务
export {
  initDb,
  saveChatSession,
  getAllChatSessions,
  deleteChatSession,
  saveMessage,
  updateMessage,
  getMessagesForChat,
  saveConfig,
  getConfig,
  getAllConfigs,
  deleteConfig,
  saveDocument,
  getAllDocuments,
  getDocumentById,
  deleteDocument,
  saveKnowledgeBase,
  updateKnowledgeBase,
  getAllKnowledgeBases,
  getKnowledgeBaseById,
  deleteKnowledgeBase,
  getDocumentsByKnowledgeBaseId,
  saveChunk,
  saveChunks,
  getChunksByDocId,
  deleteChunksByDocId,
} 