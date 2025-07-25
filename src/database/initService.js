// src/database/initService.js - 数据库初始化服务

const electronAPI = window.electronAPI

// 数据库初始化
async function initDb() {
  try {
    await electronAPI.db.initDb()
    console.log('数据库初始化完成')
    return true
  } catch (error) {
    console.error('数据库初始化失败:', error)
    return false
  }
}

export {
  initDb,
} 