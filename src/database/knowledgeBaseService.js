// src/database/knowledgeBaseService.js - 知识库数据库操作服务
import { SQL } from './sqlConstants.js'

const electronAPI = window.electronAPI

// 保存知识库
async function saveKnowledgeBase(knowledgeBase) {
    try {
        const result = await electronAPI.db.run(SQL.INSERT_KNOWLEDGE_BASE, [
            knowledgeBase.name,
            knowledgeBase.description || null,
        ])
        return result.lastID
    } catch (error) {
        console.error('保存知识库失败:', error)
        return null
    }
}

// 更新知识库
async function updateKnowledgeBase(id, updates) {
    try {
        await electronAPI.db.run(SQL.UPDATE_KNOWLEDGE_BASE, [
            updates.name,
            updates.description || null,
            id,
        ])
        return true
    } catch (error) {
        console.error('更新知识库失败:', error)
        return false
    }
}

// 获取所有知识库
async function getAllKnowledgeBases() {
    try {
        const rows = await electronAPI.db.query(SQL.SELECT_ALL_KNOWLEDGE_BASES)
        return rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }))
    } catch (error) {
        console.error('获取知识库列表失败:', error)
        return []
    }
}

// 根据ID获取知识库
async function getKnowledgeBaseById(id) {
    try {
        const rows = await electronAPI.db.query(SQL.SELECT_KNOWLEDGE_BASE_BY_ID, [id])
        if (rows.length === 0) {
            return null
        }

        const row = rows[0]
        return {
            id: row.id,
            name: row.name,
            description: row.description,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
        }
    } catch (error) {
        console.error('获取知识库失败:', error)
        return null
    }
}

// 删除知识库
async function deleteKnowledgeBase(id) {
    try {
        await electronAPI.db.run(SQL.DELETE_KNOWLEDGE_BASE, [id])
        return true
    } catch (error) {
        console.error('删除知识库失败:', error)
        return false
    }
}

// 获取知识库下的所有文档
async function getDocumentsByKnowledgeBaseId(knowledgeBaseId) {
    try {
        const rows = await electronAPI.db.query(SQL.SELECT_DOCUMENTS_BY_KB_ID, [knowledgeBaseId])
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
        console.error('获取知识库文档失败:', error)
        return []
    }
}

export {
    saveKnowledgeBase,
    updateKnowledgeBase,
    getAllKnowledgeBases,
    getKnowledgeBaseById,
    deleteKnowledgeBase,
    getDocumentsByKnowledgeBaseId,
} 