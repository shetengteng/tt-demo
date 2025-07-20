import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase, closeDatabase } from './src/composables/useDb.js';

// 获取 __dirname 的 ES 模块替代品
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;

// 确保只有一个应用实例
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  // 创建主窗口
  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      minWidth: 800,
      minHeight: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.cjs'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false
      }
    });

    // 加载应用的入口页面
    const isDev = process.env.NODE_ENV === 'development';
    if (isDev) {
      mainWindow.loadURL('http://localhost:5173/');
      mainWindow.webContents.openDevTools(); // 在开发模式下自动打开开发者工具
    } else {
      mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }
    
    // 窗口关闭时清除引用
    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  // 初始化数据库和相关IPC处理程序
  initDatabase();

  // 应用准备就绪后创建窗口
  app.on('ready', createWindow);

  // 所有窗口关闭时退出应用 (macOS除外)
  app.on('window-all-closed', () => {
    // 关闭数据库连接
    closeDatabase();
    
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // macOS 下点击应用图标重新打开窗口
    if (mainWindow === null) {
      createWindow();
    }
  });

  // 处理第二个实例启动的情况
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}