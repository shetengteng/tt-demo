// 测试全局状态是否正常工作
console.log('测试全局状态...')

// 模拟导入全局状态
import {
  chatSessions,
  currentChatId,
  currentModel,
  isDbReady,
  isInitialized,
  messages,
  initialize,
  cleanup,
  createNewChat,
  selectChat,
  deleteChat,
  renameChat,
  handleSendMessage,
  handleModelChange,
  updateCurrentModel,
  getModelDisplayName,
} from './src/composables/useGlobalMessageHandler.js'

console.log('✅ 全局状态导入成功')
console.log('可用的全局变量:')
console.log('- chatSessions:', chatSessions)
console.log('- currentChatId:', currentChatId)
console.log('- currentModel:', currentModel)
console.log('- isDbReady:', isDbReady)
console.log('- isInitialized:', isInitialized)
console.log('- messages:', messages)

console.log('可用的全局方法:')
console.log('- initialize:', typeof initialize)
console.log('- cleanup:', typeof cleanup)
console.log('- createNewChat:', typeof createNewChat)
console.log('- selectChat:', typeof selectChat)
console.log('- deleteChat:', typeof deleteChat)
console.log('- renameChat:', typeof renameChat)
console.log('- handleSendMessage:', typeof handleSendMessage)
console.log('- handleModelChange:', typeof handleModelChange)
console.log('- updateCurrentModel:', typeof updateCurrentModel)
console.log('- getModelDisplayName:', typeof getModelDisplayName)

console.log('🎉 全局状态测试完成！')
