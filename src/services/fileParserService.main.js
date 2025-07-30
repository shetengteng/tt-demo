// src/services/fileParserService.main.js - 文件解析服务（主进程）
import fs from 'fs/promises'
import path from 'path'

/**
 * 文件解析服务（主进程版本）
 * 在主进程中处理文件操作，确保安全性和兼容性
 */
export class FileParserServiceMain {
    constructor() {
        this.supportedFormats = ['.txt', '.md', '.json', '.js', '.ts', '.vue', '.css', '.html']
    }

    /**
     * 检查文件是否受支持
     */
    isSupported(filePath) {
        const ext = path.extname(filePath).toLowerCase()
        return this.supportedFormats.includes(ext)
    }

    /**
     * 解析文件内容
     */
    async parseFile(filePath) {
        try {
            if (!this.isSupported(filePath)) {
                throw new Error(`不支持的文件格式: ${path.extname(filePath)}`)
            }

            // 检查文件是否存在
            try {
                await fs.access(filePath)
            } catch (error) {
                throw new Error(`文件不存在: ${filePath}`)
            }

            // 读取文件内容
            const content = await fs.readFile(filePath, 'utf-8')

            // 提取文件信息
            const stats = await fs.stat(filePath)
            const fileName = path.basename(filePath)
            const fileExt = path.extname(filePath)

            return {
                fileName,
                filePath,
                fileSize: stats.size,
                fileType: fileExt,
                content: content.trim(),
                createdAt: stats.birthtime,
                modifiedAt: stats.mtime,
                metadata: {
                    encoding: 'utf-8',
                    lineCount: content.split('\n').length,
                    charCount: content.length
                }
            }
        } catch (error) {
            console.error('文件解析失败:', error)
            throw new Error(`文件解析失败: ${error.message}`)
        }
    }

    /**
     * 批量解析文件
     */
    async parseFiles(filePaths) {
        const results = []
        const errors = []

        for (const filePath of filePaths) {
            try {
                const result = await this.parseFile(filePath)
                results.push(result)
            } catch (error) {
                errors.push({ filePath, error: error.message })
            }
        }

        return { results, errors }
    }

    /**
     * 获取支持的文件格式
     */
    getSupportedFormats() {
        return [...this.supportedFormats]
    }
}

// 导出单例实例
export const fileParserServiceMain = new FileParserServiceMain() 