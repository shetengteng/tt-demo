import { app, BrowserWindow } from 'electron'
import path from 'path'

// 全局窗口引用
let mainWindow = null

// 创建主窗口
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    // 确保窗口有边框、标题和控制按钮
    title: 'TT Demo', // 设置窗口标题
    frame: true,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  })

  // 加载应用的入口页面
  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173/')
    mainWindow.webContents.openDevTools() // 在开发模式下自动打开开发者工具
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'))
  }

  // 窗口关闭时清除引用
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 获取主窗口实例
const getMainWindow = () => mainWindow

// 检查窗口是否存在
const isWindowExists = () => mainWindow !== null

// 聚焦窗口
const focusWindow = () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  }
}

export function useGlobalWindow() {
  return {
    createWindow,
    getMainWindow,
    isWindowExists,
    focusWindow,
  }
}