// preload.js - 预加载脚本，为渲染进程提供安全的API
const { contextBridge, ipcRenderer } = require('electron')

// 将所需的API暴露给渲染进程
contextBridge.exposeInMainWorld('electronAPI', {
  // 提供数据库操作功能
  db: {
    // 初始化数据库
    initDb: () => ipcRenderer.invoke('db:init'),

    // 执行数据库查询
    query: (sql, params) => ipcRenderer.invoke('db:query', sql, params),

    // 执行数据库操作
    run: (sql, params) => ipcRenderer.invoke('db:run', sql, params),
  },

  // 提供路径操作
  path: {
    join: (...args) => ipcRenderer.invoke('path:join', ...args),
  },

  // 提供IPC通信功能
  ipc: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    on: (channel, listener) => ipcRenderer.on(channel, listener),
    off: (channel, listener) => ipcRenderer.off(channel, listener),
  },
})
