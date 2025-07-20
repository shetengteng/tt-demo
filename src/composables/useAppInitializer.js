import { initialize, cleanup } from './useGlobalMessageHandler'

// 应用级别的全局状态管理器
let appInitialized = false

export function useAppInitializer() {
  // 初始化应用
  const initializeApp = async () => {
    if (appInitialized) return

    try {
      console.log('正在初始化应用...')

      // 初始化全局消息处理器
      await initialize()

      appInitialized = true
      console.log('应用初始化完成')
    } catch (error) {
      console.error('应用初始化失败:', error)
      throw error
    }
  }

  // 清理应用
  const cleanupApp = () => {
    if (!appInitialized) return

    try {
      console.log('正在清理应用...')

      // 清理全局消息处理器
      cleanup()

      appInitialized = false
      console.log('应用清理完成')
    } catch (error) {
      console.error('应用清理失败:', error)
    }
  }

  return {
    initializeApp,
    cleanupApp,
    isInitialized: () => appInitialized,
  }
}
