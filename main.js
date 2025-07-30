import { app, Menu } from 'electron'
import { closeDatabase, initDatabase } from './src/database/useDb.js'
import { useGlobalWindow } from './src/composables/useGlobalWindow.js'

// 确保只有一个应用实例
const gotTheLock = app.requestSingleInstanceLock()

// 获取全局窗口管理器
const { createWindow, getMainWindow, focusWindow } = useGlobalWindow()

if (!gotTheLock) {
  app.quit()
} else {
  // 初始化数据库和相关IPC处理程序
  initDatabase()

  // 应用准备就绪后创建窗口并隐藏菜单栏
  app.on('ready', () => {
    // 隐藏菜单栏
    Menu.setApplicationMenu(null)
    createWindow()
  })

  // 所有窗口关闭时退出应用 (macOS除外)
  app.on('window-all-closed', () => {
    // 关闭数据库连接
    closeDatabase()

    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // macOS 下点击应用图标重新打开窗口
    if (getMainWindow() === null) {
      createWindow()
    }
  })

  // 处理第二个实例启动的情况
  app.on('second-instance', () => {
    focusWindow()
  })
}
