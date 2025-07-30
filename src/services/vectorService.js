// src/services/vectorService.js - 向量生成服务
import { pipeline, env } from '@xenova/transformers'

/**
 * 向量生成服务
 * 使用 @xenova/transformers 本地模型生成文本向量
 */
export class VectorService {
    constructor() {
        this.pipeline = null
        this.isInitialized = false
        this.modelName = 'Xenova/all-MiniLM-L6-v2' // 轻量级但性能良好的嵌入模型
        this.initializationPromise = null
    }

    /**
     * 初始化向量生成管道
     */
    async initialize() {
        if (this.isInitialized) {
            return this.pipeline
        }

        if (this.initializationPromise) {
            return this.initializationPromise
        }

        this.initializationPromise = this._doInitialize()
        return this.initializationPromise
    }

    async _doInitialize() {
        try {
            console.log('正在初始化向量生成模型...')

            // 设置环境变量，允许本地模式
            env.allowLocalModels = false
            env.allowRemoteModels = true

            // 创建特征提取管道
            this.pipeline = await pipeline('feature-extraction', this.modelName, {
                quantized: true, // 使用量化模型以提高性能
            })

            this.isInitialized = true
            console.log('向量生成模型初始化完成')

            return this.pipeline
        } catch (error) {
            console.error('向量生成模型初始化失败:', error)
            this.initializationPromise = null
            throw new Error(`向量生成模型初始化失败: ${error.message}`)
        }
    }

    /**
     * 生成单个文本的向量
     */
    async generateEmbedding(text) {
        try {
            if (!text || text.trim().length === 0) {
                throw new Error('文本内容不能为空')
            }

            await this.initialize()

            // 生成向量
            const result = await this.pipeline(text.trim(), {
                pooling: 'mean',    // 使用平均池化
                normalize: true,    // 归一化向量
            })

            // 转换为普通数组
            const embedding = Array.from(result.data)

            return {
                text,
                embedding,
                dimensions: embedding.length,
                model: this.modelName,
                createdAt: new Date().toISOString()
            }
        } catch (error) {
            console.error('向量生成失败:', error)
            throw new Error(`向量生成失败: ${error.message}`)
        }
    }

    /**
     * 批量生成多个文本的向量
     */
    async generateEmbeddings(texts, options = {}) {
        const { batchSize = 10, onProgress } = options
        const results = []
        const errors = []

        // 分批处理以避免内存问题
        for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize)

            const batchPromises = batch.map(async (text, index) => {
                try {
                    const result = await this.generateEmbedding(text)
                    return { index: i + index, result }
                } catch (error) {
                    return {
                        index: i + index,
                        error: error.message,
                        text: text.substring(0, 100) + '...'
                    }
                }
            })

            const batchResults = await Promise.allSettled(batchPromises)

            batchResults.forEach((promiseResult) => {
                if (promiseResult.status === 'fulfilled') {
                    const { index, result, error, text } = promiseResult.value
                    if (error) {
                        errors.push({ index, error, text })
                    } else {
                        results.push({ index, ...result })
                    }
                } else {
                    errors.push({
                        index: i,
                        error: promiseResult.reason.message || '未知错误'
                    })
                }
            })

            // 调用进度回调
            if (onProgress) {
                onProgress({
                    processed: Math.min(i + batchSize, texts.length),
                    total: texts.length,
                    progress: Math.min((i + batchSize) / texts.length * 100, 100)
                })
            }
        }

        return { results, errors }
    }

    /**
     * 为文档分块生成向量
     */
    async generateChunkEmbeddings(chunks, options = {}) {
        const texts = chunks.map(chunk => chunk.text)
        const embeddings = await this.generateEmbeddings(texts, options)

        // 将向量结果与分块信息结合
        const enrichedChunks = chunks.map((chunk, index) => {
            const embeddingResult = embeddings.results.find(r => r.index === index)
            const errorResult = embeddings.errors.find(e => e.index === index)

            return {
                ...chunk,
                embedding: embeddingResult?.embedding || null,
                embeddingMeta: embeddingResult ? {
                    dimensions: embeddingResult.dimensions,
                    model: embeddingResult.model,
                    createdAt: embeddingResult.createdAt
                } : null,
                error: errorResult?.error || null
            }
        })

        return {
            chunks: enrichedChunks,
            summary: {
                total: chunks.length,
                success: embeddings.results.length,
                failed: embeddings.errors.length,
                errors: embeddings.errors
            }
        }
    }

    /**
     * 计算向量相似度（余弦相似度）
     */
    calculateSimilarity(vector1, vector2) {
        if (!vector1 || !vector2 || vector1.length !== vector2.length) {
            throw new Error('向量维度不匹配或向量为空')
        }

        let dotProduct = 0
        let magnitude1 = 0
        let magnitude2 = 0

        for (let i = 0; i < vector1.length; i++) {
            dotProduct += vector1[i] * vector2[i]
            magnitude1 += vector1[i] * vector1[i]
            magnitude2 += vector2[i] * vector2[i]
        }

        const magnitude = Math.sqrt(magnitude1) * Math.sqrt(magnitude2)
        return magnitude === 0 ? 0 : dotProduct / magnitude
    }

    /**
     * 释放资源
     */
    async dispose() {
        if (this.pipeline) {
            // transformers.js 通常不需要显式释放资源
            this.pipeline = null
            this.isInitialized = false
            this.initializationPromise = null
            console.log('向量生成服务资源已释放')
        }
    }
}

// 导出单例实例
export const vectorService = new VectorService() 