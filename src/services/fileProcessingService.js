// src/services/fileProcessingService.js - 统一文件处理服务（浏览器端）
import { textChunkService } from './textChunkService.js'
import { vectorService } from './vectorService.js'
import { saveDocument, saveChunks } from '../database/index.js'

/**
 * 统一文件处理服务（浏览器端）
 * 通过IPC与主进程通信处理文件解析
 */
export class FileProcessingService {
    constructor() {
        this.isProcessing = false
        this.processingQueue = []
    }

    /**
     * 处理单个文件的完整流程
     */
    async processFile(filePath, knowledgeBaseId, options = {}) {
        const {
            onProgress,
            chunkConfig = {},
            skipVectorization = false
        } = options

        try {
            // 阶段1: 通过IPC解析文件
            onProgress?.({ stage: 'parsing', progress: 10, message: '正在解析文件...' })
            const parsedFile = await this.parseFileViaIPC(filePath)

            // 阶段2: 文本分块
            onProgress?.({ stage: 'chunking', progress: 30, message: '正在分割文本...' })
            const chunks = await textChunkService.smartChunk(
                parsedFile.content,
                parsedFile.fileType,
                chunkConfig
            )

            if (chunks.length === 0) {
                throw new Error('文件内容为空或无法分块')
            }

            // 阶段3: 生成向量（可选）
            let enrichedChunks = chunks
            if (!skipVectorization) {
                onProgress?.({ stage: 'vectorization', progress: 50, message: '正在生成向量...' })

                const vectorResult = await vectorService.generateChunkEmbeddings(chunks, {
                    onProgress: (vectorProgress) => {
                        onProgress?.({
                            stage: 'vectorization',
                            progress: 50 + (vectorProgress.progress * 0.3), // 50% -> 80%
                            message: `正在生成向量... ${vectorProgress.processed}/${vectorProgress.total}`
                        })
                    }
                })

                enrichedChunks = vectorResult.chunks

                if (vectorResult.summary.failed > 0) {
                    console.warn(`向量生成警告: ${vectorResult.summary.failed} 个分块失败`)
                }
            }

            // 阶段4: 保存到数据库
            onProgress?.({ stage: 'saving', progress: 85, message: '正在保存到数据库...' })

            // 保存文档
            const documentData = {
                knowledgeBaseId: knowledgeBaseId,
                title: parsedFile.fileName,
                content: parsedFile.content,
                embedding: null, // 文档级别的向量（暂时为空）
                filePath: parsedFile.filePath,
                metadata: JSON.stringify({
                    ...parsedFile.metadata,
                    originalPath: filePath,
                    fileSize: parsedFile.fileSize,
                    fileType: parsedFile.fileType,
                    processedAt: new Date().toISOString(),
                    chunkCount: enrichedChunks.length
                })
            }

            const documentId = await saveDocument(documentData)

            // 保存分块
            const chunkData = enrichedChunks.map(chunk => ({
                docId: documentId,
                text: chunk.text,
                embedding: chunk.embedding ? JSON.stringify(chunk.embedding) : null,
                pageNumber: chunk.metadata?.chunkIndex || 0,
                metadata: JSON.stringify({
                    ...chunk.metadata,
                    embeddingMeta: chunk.embeddingMeta,
                    error: chunk.error
                })
            }))

            await saveChunks(chunkData)

            onProgress?.({ stage: 'completed', progress: 100, message: '文件处理完成' })

            return {
                success: true,
                documentId,
                fileName: parsedFile.fileName,
                fileSize: parsedFile.fileSize,
                chunkCount: enrichedChunks.length,
                vectorizedChunks: enrichedChunks.filter(c => c.embedding).length,
                errors: enrichedChunks.filter(c => c.error).map(c => c.error),
                metadata: {
                    processingTime: Date.now(),
                    stages: ['parsing', 'chunking', 'vectorization', 'saving']
                }
            }

        } catch (error) {
            console.error('文件处理失败:', error)
            throw new Error(`文件处理失败: ${error.message}`)
        }
    }

    /**
     * 通过IPC解析文件
     */
    async parseFileViaIPC(filePath) {
        const electronAPI = window.electronAPI
        try {
            const result = await electronAPI.ipc.invoke('parse-file', filePath)
            if (!result.success) {
                throw new Error(result.error)
            }
            return result.data
        } catch (error) {
            console.error('IPC文件解析失败:', error)
            throw new Error(`文件解析失败: ${error.message}`)
        }
    }

    /**
     * 批量处理多个文件
     */
    async processFiles(filePaths, knowledgeBaseId, options = {}) {
        const {
            onProgress,
            onFileProgress,
            maxConcurrent = 3,
            ...fileOptions
        } = options

        const results = []
        const errors = []
        const total = filePaths.length

        // 分批并发处理文件
        for (let i = 0; i < filePaths.length; i += maxConcurrent) {
            const batch = filePaths.slice(i, i + maxConcurrent)

            const batchPromises = batch.map(async (filePath, batchIndex) => {
                const globalIndex = i + batchIndex

                try {
                    const result = await this.processFile(filePath, knowledgeBaseId, {
                        ...fileOptions,
                        onProgress: (progress) => {
                            onFileProgress?.({
                                fileIndex: globalIndex,
                                fileName: filePath,
                                ...progress
                            })
                        }
                    })

                    return { index: globalIndex, filePath, result }
                } catch (error) {
                    return {
                        index: globalIndex,
                        filePath,
                        error: error.message
                    }
                }
            })

            const batchResults = await Promise.allSettled(batchPromises)

            batchResults.forEach((promiseResult) => {
                if (promiseResult.status === 'fulfilled') {
                    const { index, filePath, result, error } = promiseResult.value
                    if (error) {
                        errors.push({ index, filePath, error })
                    } else {
                        results.push({ index, filePath, ...result })
                    }
                } else {
                    errors.push({
                        index: i,
                        filePath: batch[0],
                        error: promiseResult.reason.message || '未知错误'
                    })
                }
            })

            // 更新总体进度
            const processed = Math.min(i + maxConcurrent, total)
            onProgress?.({
                processed,
                total,
                progress: (processed / total) * 100,
                stage: 'batch_processing',
                message: `已处理 ${processed}/${total} 个文件`
            })
        }

        return {
            summary: {
                total: filePaths.length,
                success: results.length,
                failed: errors.length,
                totalChunks: results.reduce((sum, r) => sum + (r.chunkCount || 0), 0),
                totalVectorized: results.reduce((sum, r) => sum + (r.vectorizedChunks || 0), 0)
            },
            results,
            errors
        }
    }

    /**
     * 处理拖拽上传的文件
     */
    async processUploadedFiles(fileList, knowledgeBaseId, options = {}) {
        // 将File对象转换为临时文件路径（需要在主进程中处理）
        const tempFilePaths = await this.saveTemporaryFiles(fileList)

        try {
            const result = await this.processFiles(tempFilePaths, knowledgeBaseId, options)

            // 清理临时文件
            await this.cleanupTemporaryFiles(tempFilePaths)

            return result
        } catch (error) {
            // 出错时也要清理临时文件
            await this.cleanupTemporaryFiles(tempFilePaths)
            throw error
        }
    }

    /**
     * 保存临时文件（通过IPC与主进程通信）
     */
    async saveTemporaryFiles(fileList) {
        const electronAPI = window.electronAPI
        const tempPaths = []

        for (const file of fileList) {
            try {
                // 读取文件内容
                const buffer = await file.arrayBuffer()
                const content = new Uint8Array(buffer)

                // 通过IPC保存到临时目录
                const tempPath = await electronAPI.ipc.invoke('save-temp-file', {
                    fileName: file.name,
                    content: Array.from(content)
                })

                tempPaths.push(tempPath)
            } catch (error) {
                console.error(`保存临时文件失败: ${file.name}`, error)
                throw new Error(`保存临时文件失败: ${file.name}`)
            }
        }

        return tempPaths
    }

    /**
     * 清理临时文件
     */
    async cleanupTemporaryFiles(tempPaths) {
        const electronAPI = window.electronAPI

        for (const tempPath of tempPaths) {
            try {
                await electronAPI.ipc.invoke('cleanup-temp-file', tempPath)
            } catch (error) {
                console.warn(`清理临时文件失败: ${tempPath}`, error)
            }
        }
    }

    /**
     * 获取处理进度
     */
    getProcessingStatus() {
        return {
            isProcessing: this.isProcessing,
            queueLength: this.processingQueue.length
        }
    }

    /**
     * 取消正在进行的处理
     */
    cancel() {
        this.isProcessing = false
        this.processingQueue = []
    }
}

// 导出单例实例
export const fileProcessingService = new FileProcessingService() 