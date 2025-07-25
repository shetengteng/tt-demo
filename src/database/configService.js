// src/database/configService.js - 配置数据库操作服务
import { SQL } from './sqlConstants.js'

const electronAPI = window.electronAPI

// 保存配置项
async function saveConfig(key, value) {
  try {
    const timestamp = Date.now()
    const jsonValue = typeof value === 'string' ? value : JSON.stringify(value)

    await electronAPI.db.run(SQL.UPSERT_CONFIG, [key, jsonValue, timestamp])
    return true
  } catch (error) {
    console.error('保存配置失败:', error)
    return false
  }
}

// 获取配置项
async function getConfig(key, defaultValue = null) {
  try {
    const rows = await electronAPI.db.query(SQL.SELECT_CONFIG, [key])

    if (rows.length === 0) {
      return defaultValue
    }

    try {
      // 尝试解析JSON
      return JSON.parse(rows[0].value)
    } catch (e) {
      // 如果解析失败，直接返回字符串值
      return rows[0].value
    }
  } catch (error) {
    console.error('获取配置失败:', error)
    return defaultValue
  }
}

// 获取所有配置
async function getAllConfigs() {
  try {
    const rows = await electronAPI.db.query(SQL.SELECT_ALL_CONFIGS)

    const configs = {}
    for (const row of rows) {
      try {
        configs[row.key] = JSON.parse(row.value)
      } catch (e) {
        configs[row.key] = row.value
      }
    }

    return configs
  } catch (error) {
    console.error('获取所有配置失败:', error)
    return {}
  }
}

// 删除配置项
async function deleteConfig(key) {
  try {
    await electronAPI.db.run(SQL.DELETE_CONFIG, [key])
    return true
  } catch (error) {
    console.error('删除配置失败:', error)
    return false
  }
}

export {
  saveConfig,
  getConfig,
  getAllConfigs,
  deleteConfig,
} 