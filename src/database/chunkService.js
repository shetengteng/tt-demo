// src/database/chunkService.js - 分块数据库操作服务
import { SQL } from './sqlConstants.js'

const electronAPI = window.electronAPI

// 保存分块
async function saveChunk(chunk) {
    try {
        const result = await electronAPI.db.run(SQL.INSERT_CHUNK, [
            chunk.docId,
            chunk.text,
            chunk.embedding,
            chunk.pageNumber || null,
        ])
        return result.lastID
    } catch (error) {
        console.error('保存分块失败:', error)
        return null
    }
}

// 批量保存分块
async function saveChunks(chunks) {
    try {
        const results = []
        for (const chunk of chunks) {
            const chunkId = await saveChunk(chunk)
            if (chunkId) {
                results.push(chunkId)
            }
        }
        return results
    } catch (error) {
        console.error('批量保存分块失败:', error)
        return []
    }
}

// 获取文档的所有分块
async function getChunksByDocId(docId) {
    try {
        const rows = await electronAPI.db.query(SQL.SELECT_CHUNKS_BY_DOC_ID, [docId])
        return rows.map(row => ({
            id: row.id,
            docId: row.doc_id,
            text: row.text,
            embedding: row.embedding,
            pageNumber: row.page_number,
        }))
    } catch (error) {
        console.error('获取分块失败:', error)
        return []
    }
}

// 删除文档的所有分块
async function deleteChunksByDocId(docId) {
    try {
        await electronAPI.db.run(SQL.DELETE_CHUNKS_BY_DOC_ID, [docId])
        return true
    } catch (error) {
        console.error('删除分块失败:', error)
        return false
    }
}

export {
    saveChunk,
    saveChunks,
    getChunksByDocId,
    deleteChunksByDocId,
} 