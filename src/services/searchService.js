// src/services/searchService.js - 向量搜索服务
import { vectorService } from './vectorService.js'
import { getChunksByDocId, getAllDocuments, getDocumentsByKnowledgeBaseId } from '../database/index.js'
import * as mlDistance from 'ml-distance'

/**
 * 向量搜索服务
 * 支持语义搜索和相似度计算
 */
export class SearchService {
    constructor() {
        this.similarityThreshold = 0.3 // 相似度阈值
    }

    /**
     * 在知识库中搜索相关内容
     */
    async searchInKnowledgeBase(query, knowledgeBaseId, options = {}) {
        const {
            limit = 10,
            similarityThreshold = this.similarityThreshold,
            includeContent = true,
            highlightMatches = true
        } = options

        try {
            // 1. 生成查询向量
            const queryEmbedding = await vectorService.generateEmbedding(query)

            // 2. 获取知识库中的所有文档
            const documents = await getDocumentsByKnowledgeBaseId(parseInt(knowledgeBaseId))

            // 3. 获取所有文档的分块和向量
            const allChunks = []
            for (const doc of documents) {
                const chunks = await getChunksByDocId(doc.id)
                const validChunks = chunks.filter(chunk => chunk.embedding)

                allChunks.push(...validChunks.map(chunk => ({
                    ...chunk,
                    document: doc,
                    embedding: this.parseEmbedding(chunk.embedding)
                })))
            }

            // 4. 计算相似度并排序
            const similarities = allChunks.map(chunk => {
                const similarity = this.calculateCosineSimilarity(
                    queryEmbedding.embedding,
                    chunk.embedding
                )

                return {
                    chunk,
                    similarity,
                    document: chunk.document,
                    score: Math.round(similarity * 100) / 100
                }
            }).filter(item => item.similarity >= similarityThreshold)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit)

            // 5. 格式化搜索结果
            const results = similarities.map(item => ({
                id: item.chunk.id,
                documentId: item.document.id,
                documentTitle: item.document.title,
                text: item.chunk.text,
                similarity: item.score,
                position: item.chunk.pageNumber || 0,
                metadata: this.parseMetadata(item.chunk.metadata),
                highlighted: highlightMatches ? this.highlightText(item.chunk.text, query) : item.chunk.text
            }))

            return {
                query,
                total: similarities.length,
                results,
                searchMetadata: {
                    knowledgeBaseId,
                    queryEmbedding: queryEmbedding.dimensions,
                    totalChunks: allChunks.length,
                    threshold: similarityThreshold
                }
            }

        } catch (error) {
            console.error('搜索失败:', error)
            throw new Error(`搜索失败: ${error.message}`)
        }
    }

    /**
     * 在单个文档中搜索
     */
    async searchInDocument(query, documentId, options = {}) {
        const {
            limit = 5,
            similarityThreshold = this.similarityThreshold,
            highlightMatches = true
        } = options

        try {
            // 生成查询向量
            const queryEmbedding = await vectorService.generateEmbedding(query)

            // 获取文档分块
            const chunks = await getChunksByDocId(documentId)
            const validChunks = chunks.filter(chunk => chunk.embedding)

            // 计算相似度
            const similarities = validChunks.map(chunk => {
                const embedding = this.parseEmbedding(chunk.embedding)
                const similarity = this.calculateCosineSimilarity(
                    queryEmbedding.embedding,
                    embedding
                )

                return {
                    chunk,
                    similarity,
                    score: Math.round(similarity * 100) / 100
                }
            }).filter(item => item.similarity >= similarityThreshold)
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, limit)

            const results = similarities.map(item => ({
                id: item.chunk.id,
                text: item.chunk.text,
                similarity: item.score,
                position: item.chunk.pageNumber || 0,
                highlighted: highlightMatches ? this.highlightText(item.chunk.text, query) : item.chunk.text
            }))

            return {
                query,
                documentId,
                total: similarities.length,
                results
            }

        } catch (error) {
            console.error('文档搜索失败:', error)
            throw new Error(`文档搜索失败: ${error.message}`)
        }
    }

    /**
     * 混合搜索：结合关键词搜索和语义搜索
     */
    async hybridSearch(query, knowledgeBaseId, options = {}) {
        const {
            keywordWeight = 0.3,
            semanticWeight = 0.7,
            limit = 10
        } = options

        try {
            // 1. 语义搜索
            const semanticResults = await this.searchInKnowledgeBase(query, knowledgeBaseId, {
                limit: limit * 2, // 获取更多结果用于混合
                ...options
            })

            // 2. 关键词搜索
            const keywordResults = await this.keywordSearch(query, knowledgeBaseId, {
                limit: limit * 2,
                ...options
            })

            // 3. 合并和重新排序
            const combinedResults = this.combineSearchResults(
                semanticResults.results,
                keywordResults.results,
                keywordWeight,
                semanticWeight
            )

            return {
                query,
                total: combinedResults.length,
                results: combinedResults.slice(0, limit),
                searchType: 'hybrid',
                weights: { keyword: keywordWeight, semantic: semanticWeight }
            }

        } catch (error) {
            console.error('混合搜索失败:', error)
            throw new Error(`混合搜索失败: ${error.message}`)
        }
    }

    /**
     * 关键词搜索
     */
    async keywordSearch(query, knowledgeBaseId, options = {}) {
        const { limit = 10, highlightMatches = true } = options

        try {
            const documents = await getDocumentsByKnowledgeBaseId(parseInt(knowledgeBaseId))
            const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 1)

            const results = []

            for (const doc of documents) {
                const chunks = await getChunksByDocId(doc.id)

                chunks.forEach(chunk => {
                    const text = chunk.text.toLowerCase()
                    let score = 0
                    let matches = 0

                    keywords.forEach(keyword => {
                        const count = (text.match(new RegExp(keyword, 'g')) || []).length
                        if (count > 0) {
                            score += count / chunk.text.length * 1000 // 标准化评分
                            matches++
                        }
                    })

                    if (matches > 0) {
                        results.push({
                            id: chunk.id,
                            documentId: doc.id,
                            documentTitle: doc.title,
                            text: chunk.text,
                            similarity: Math.min(score, 1), // 限制在0-1范围
                            position: chunk.pageNumber || 0,
                            matchedKeywords: matches,
                            highlighted: highlightMatches ? this.highlightKeywords(chunk.text, keywords) : chunk.text
                        })
                    }
                })
            }

            return {
                query,
                total: results.length,
                results: results
                    .sort((a, b) => b.similarity - a.similarity)
                    .slice(0, limit)
            }

        } catch (error) {
            console.error('关键词搜索失败:', error)
            throw new Error(`关键词搜索失败: ${error.message}`)
        }
    }

    /**
     * 计算余弦相似度
     */
    calculateCosineSimilarity(vector1, vector2) {
        try {
            // 使用ml-distance的余弦相似度
            const distance = cosine(vector1, vector2)
            return 1 - distance // 转换为相似度
        } catch (error) {
            console.warn('余弦相似度计算失败，使用备用方法:', error)
            return vectorService.calculateSimilarity(vector1, vector2)
        }
    }

    /**
     * 解析嵌入向量
     */
    parseEmbedding(embeddingString) {
        try {
            if (typeof embeddingString === 'string') {
                return JSON.parse(embeddingString)
            }
            return embeddingString
        } catch (error) {
            console.warn('解析嵌入向量失败:', error)
            return null
        }
    }

    /**
     * 解析元数据
     */
    parseMetadata(metadataString) {
        try {
            if (typeof metadataString === 'string') {
                return JSON.parse(metadataString)
            }
            return metadataString || {}
        } catch (error) {
            return {}
        }
    }

    /**
     * 高亮匹配文本
     */
    highlightText(text, query, className = 'search-highlight') {
        const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 1)
        let highlightedText = text

        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'gi')
            highlightedText = highlightedText.replace(
                regex,
                `<span class="${className}">$1</span>`
            )
        })

        return highlightedText
    }

    /**
     * 高亮关键词
     */
    highlightKeywords(text, keywords, className = 'search-highlight') {
        let highlightedText = text

        keywords.forEach(keyword => {
            const regex = new RegExp(`(${keyword})`, 'gi')
            highlightedText = highlightedText.replace(
                regex,
                `<span class="${className}">$1</span>`
            )
        })

        return highlightedText
    }

    /**
     * 合并搜索结果
     */
    combineSearchResults(semanticResults, keywordResults, keywordWeight, semanticWeight) {
        const resultMap = new Map()

        // 添加语义搜索结果
        semanticResults.forEach(result => {
            const key = `${result.documentId}-${result.id}`
            resultMap.set(key, {
                ...result,
                finalScore: result.similarity * semanticWeight,
                searchTypes: ['semantic']
            })
        })

        // 合并关键词搜索结果
        keywordResults.forEach(result => {
            const key = `${result.documentId}-${result.id}`
            if (resultMap.has(key)) {
                const existing = resultMap.get(key)
                existing.finalScore += result.similarity * keywordWeight
                existing.searchTypes.push('keyword')
                existing.matchedKeywords = result.matchedKeywords
            } else {
                resultMap.set(key, {
                    ...result,
                    finalScore: result.similarity * keywordWeight,
                    searchTypes: ['keyword']
                })
            }
        })

        return Array.from(resultMap.values())
            .sort((a, b) => b.finalScore - a.finalScore)
    }

    /**
     * 设置相似度阈值
     */
    setSimilarityThreshold(threshold) {
        this.similarityThreshold = Math.max(0, Math.min(1, threshold))
    }

    /**
     * 获取搜索建议
     */
    async getSearchSuggestions(query, knowledgeBaseId, limit = 5) {
        try {
            // 基于已有内容生成搜索建议
            const documents = await getDocumentsByKnowledgeBaseId(parseInt(knowledgeBaseId))
            const suggestions = []

            const queryLower = query.toLowerCase()

            documents.forEach(doc => {
                if (doc.title.toLowerCase().includes(queryLower)) {
                    suggestions.push({
                        type: 'document',
                        text: doc.title,
                        confidence: 0.9
                    })
                }
            })

            return suggestions.slice(0, limit)
        } catch (error) {
            console.error('获取搜索建议失败:', error)
            return []
        }
    }
}

// 导出单例实例
export const searchService = new SearchService() 