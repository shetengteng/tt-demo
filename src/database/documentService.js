// src/database/documentService.js - 文档数据库操作服务
import { SQL } from './sqlConstants.js'

const electronAPI = window.electronAPI

// 保存文档
async function saveDocument(document) {
    try {
        const result = await electronAPI.db.run(SQL.INSERT_DOCUMENT, [
            document.knowledgeBaseId,
            document.title,
            document.content,
            document.embedding || null,
            document.filePath || null,
        ])
        return result.lastID
    } catch (error) {
        console.error('保存文档失败:', error)
        return null
    }
}

// 获取所有文档
async function getAllDocuments() {
    try {
        const rows = await electronAPI.db.query(SQL.SELECT_ALL_DOCUMENTS)
        return rows.map(row => ({
            id: row.id,
            knowledgeBaseId: row.knowledge_base_id,
            title: row.title,
            content: row.content,
            embedding: row.embedding,
            filePath: row.file_path,
            createdAt: row.created_at,
        }))
    } catch (error) {
        console.error('获取文档列表失败:', error)
        return []
    }
}

// 根据ID获取文档
async function getDocumentById(id) {
    try {
        const rows = await electronAPI.db.query(SQL.SELECT_DOCUMENT_BY_ID, [id])
        if (rows.length === 0) {
            return null
        }

        const row = rows[0]
        return {
            id: row.id,
            knowledgeBaseId: row.knowledge_base_id,
            title: row.title,
            content: row.content,
            embedding: row.embedding,
            filePath: row.file_path,
            createdAt: row.created_at,
        }
    } catch (error) {
        console.error('获取文档失败:', error)
        return null
    }
}

// 删除文档
async function deleteDocument(id) {
    try {
        await electronAPI.db.run(SQL.DELETE_DOCUMENT, [id])
        return true
    } catch (error) {
        console.error('删除文档失败:', error)
        return false
    }
}

export {
    saveDocument,
    getAllDocuments,
    getDocumentById,
    deleteDocument,
} 