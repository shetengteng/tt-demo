// src/services/knowledgeSearchService.js - 知识库搜索与答案生成服务
import { vectorService } from './vectorService.js'
import { searchService } from './searchService.js'
import { sendMessageToAI } from '@/utils/api.js'

/**
 * 知识库搜索服务
 * 实现基于知识库的问答流程：问题向量化 -> 向量搜索 -> 获取Top3知识片段 -> 构造Prompt -> 调用LLM -> 输出回答
 */
export class KnowledgeSearchService {
    constructor() {
        this.maxTopResults = 3 // 获取的相关知识片段数量
    }

    /**
     * 完整的知识库问答流程
     * @param {string} query 用户问题
     * @param {number} knowledgeBaseId 知识库ID
     * @param {function} onChunk 回调函数，用于流式输出
     * @param {AbortSignal} signal 中断信号
     */
    async processQuery(query, knowledgeBaseId, onChunk, signal) {
        try {
            // 1. 问题向量化 & 向量相似度搜索
            onChunk?.({ type: 'system', content: '正在搜索知识库...' })
            const searchResults = await this.searchKnowledge(query, knowledgeBaseId)

            if (!searchResults || searchResults.results.length === 0) {
                return this.handleNoResults(query, onChunk, signal)
            }

            // 2. 获取Top3知识片段
            const topChunks = this.getTopChunks(searchResults.results)

            // 3. 构造Prompt
            const prompt = this.constructPrompt(query, topChunks)

            // 4. 调用DeepSeek API
            return this.generateAnswer(prompt, onChunk, signal)
        } catch (error) {
            console.error('知识库问答流程出错:', error)
            onChunk?.({
                type: 'error',
                content: `知识库搜索失败: ${error.message}`
            })
            return {
                content: `处理失败: ${error.message}`,
                error: true
            }
        }
    }

    /**
     * 第1步：问题向量化和相似度搜索
     */
    async searchKnowledge(query, knowledgeBaseId) {
        // 使用现有的搜索服务
        const searchResults = await searchService.hybridSearch(query, knowledgeBaseId, {
            limit: this.maxTopResults * 2, // 获取更多结果再筛选
            similarityThreshold: 0.2,      // 降低阈值以获得更多潜在结果
            includeContent: true,
            highlightMatches: false        // 不需要高亮标记
        })
        return searchResults
    }

    /**
     * 第2步：获取Top3知识片段
     */
    getTopChunks(results) {
        // 获取相似度最高的前N个结果
        const topResults = results.slice(0, this.maxTopResults)

        return topResults.map(result => ({
            text: result.text,
            documentTitle: result.documentTitle || '未知文档',
            similarity: result.similarity,
            position: result.position
        }))
    }

    /**
     * 第3步：构造Prompt
     */
    constructPrompt(query, chunks) {
        // 构建包含上下文的提示
        let contextText = chunks.map(chunk =>
            `文档: ${chunk.documentTitle}\n内容: ${chunk.text}`
        ).join('\n\n---\n\n')

        // 构造最终的提示词
        const prompt = `你是一个智能助手，请根据以下参考信息回答用户的问题。
如果参考信息中没有相关内容，请直接告知用户你无法回答该问题。
不要编造信息，仅基于提供的参考信息作答。

参考信息:
${contextText}

用户问题: ${query}

请提供准确、简洁的回答:`;

        return prompt
    }

    /**
     * 第4步：调用DeepSeek API生成回答
     */
    async generateAnswer(prompt, onChunk, signal) {
        try {
            // 发送构造好的prompt到LLM
            return await sendMessageToAI(
                prompt,
                chunk => {
                    // 直接转发AI的回复流
                    onChunk?.(chunk)
                },
                signal
            )
        } catch (error) {
            console.error('生成回答失败:', error)
            throw error
        }
    }

    /**
     * 处理知识库中没有匹配内容的情况
     */
    async handleNoResults(query, onChunk, signal) {
        const noResultsPrompt = `用户问了一个问题，但在知识库中没有找到相关内容。
用户问题: ${query}
请礼貌地告诉用户这个问题在知识库中没有找到相关信息，并建议用户尝试其他问题或重新表述问题。`

        return this.generateAnswer(noResultsPrompt, onChunk, signal)
    }
}

// 导出单例实例
export const knowledgeSearchService = new KnowledgeSearchService() 