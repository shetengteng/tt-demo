// src/services/textChunkService.js - 文本分块服务
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

/**
 * 文本分块服务
 * 使用 langchain 提供的多种分块策略
 */
export class TextChunkService {
    constructor() {
        // 默认分块配置
        this.defaultConfig = {
            chunkSize: 1000,        // 每个分块的字符数
            chunkOverlap: 200,      // 分块间重叠字符数
            separators: ['\n\n', '\n', ' ', ''], // 分隔符优先级
        }
    }

    /**
     * 创建文本分割器
     */
    createSplitter(config = {}) {
        const finalConfig = { ...this.defaultConfig, ...config }

        return new RecursiveCharacterTextSplitter({
            chunkSize: finalConfig.chunkSize,
            chunkOverlap: finalConfig.chunkOverlap,
            separators: finalConfig.separators,
        })
    }

    /**
     * 分块文本内容
     */
    async chunkText(text, config = {}) {
        try {
            if (!text || text.trim().length === 0) {
                return []
            }

            const splitter = this.createSplitter(config)
            const chunks = await splitter.createDocuments([text])

            return chunks.map((chunk, index) => ({
                id: index,
                text: chunk.pageContent,
                metadata: {
                    ...chunk.metadata,
                    chunkIndex: index,
                    chunkSize: chunk.pageContent.length,
                }
            }))
        } catch (error) {
            console.error('文本分块失败:', error)
            throw new Error(`文本分块失败: ${error.message}`)
        }
    }

    /**
     * 根据文件类型优化分块策略
     */
    getOptimizedConfig(fileType) {
        const configs = {
            '.md': {
                separators: ['\n# ', '\n## ', '\n### ', '\n\n', '\n', ' ', ''],
                chunkSize: 1500,
                chunkOverlap: 300,
            },
            '.js': {
                separators: ['\nfunction ', '\nclass ', '\nconst ', '\nlet ', '\n\n', '\n', ' ', ''],
                chunkSize: 800,
                chunkOverlap: 150,
            },
            '.vue': {
                separators: ['\n<template>', '\n<script>', '\n<style>', '\n\n', '\n', ' ', ''],
                chunkSize: 1200,
                chunkOverlap: 250,
            },
            '.txt': {
                separators: ['\n\n', '\n', '. ', '! ', '? ', ' ', ''],
                chunkSize: 1000,
                chunkOverlap: 200,
            }
        }

        return configs[fileType] || this.defaultConfig
    }

    /**
     * 智能分块 - 根据文件类型自动选择最佳策略
     */
    async smartChunk(text, fileType, customConfig = {}) {
        const optimizedConfig = this.getOptimizedConfig(fileType)
        const finalConfig = { ...optimizedConfig, ...customConfig }

        return this.chunkText(text, finalConfig)
    }

    /**
     * 批量分块多个文档
     */
    async chunkDocuments(documents, config = {}) {
        const results = []
        const errors = []

        for (const doc of documents) {
            try {
                const chunks = await this.smartChunk(
                    doc.content,
                    doc.fileType,
                    config
                )

                results.push({
                    documentId: doc.id || doc.fileName,
                    fileName: doc.fileName,
                    chunks: chunks.map(chunk => ({
                        ...chunk,
                        documentId: doc.id || doc.fileName,
                        fileName: doc.fileName,
                    }))
                })
            } catch (error) {
                errors.push({
                    documentId: doc.id || doc.fileName,
                    error: error.message
                })
            }
        }

        return { results, errors }
    }
}

// 导出单例实例
export const textChunkService = new TextChunkService() 