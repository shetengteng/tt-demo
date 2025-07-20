import { ref, computed } from 'vue'
import 'remixicon/fonts/remixicon.css'
import { useGlobalTheme } from './useGlobalTheme'

// 预定义图标映射表 - 包含应用中使用的所有图标的名称
const iconMap = {
  // 侧边栏图标
  message: 'ri-message-3-line',
  headset: 'ri-customer-service-2-line',
  bolt: 'ri-flashlight-line',
  plus: 'ri-add-line',
  calendar: 'ri-calendar-line',
  cog: 'ri-settings-3-line',
  user: 'ri-user-line',
  database: 'ri-book-line', // 更改为书本图标
  upload: 'ri-upload-line',
  search: 'ri-search-line',
  refresh: 'ri-refresh-line',
  eye: 'ri-eye-line',
  delete: 'ri-delete-bin-line',
  more: 'ri-more-line',
  sun: 'ri-sun-line',
  moon: 'ri-moon-line',
  bard: 'ri-bard-line',

  // 聊天记录列表图标
  magic: 'ri-magic-line',
  star: 'ri-star-line',
  dots: 'ri-more-2-line',

  // 消息相关图标
  robot: 'ri-robot-line',
  lightbulb: 'ri-lightbulb-line',
  check: 'ri-check-line',

  // 其他通用图标
  times: 'ri-close-line',
  edit: 'ri-edit-line',
  copy: 'ri-file-copy-line',

  // 设置页面图标
  settings: 'ri-settings-3-line',
  general: 'ri-dashboard-line',
  key: 'ri-key-line',
  theme: 'ri-palette-line',
  info: 'ri-information-line',
  user_plus: 'ri-user-add-line',
  keyboard: 'ri-keyboard-line',
  github: 'ri-github-fill',

  // 消息输入图标
  attachment: 'ri-attachment-2-line',
  mic: 'ri-mic-line',
  send: 'ri-send-plane-fill',
}

export function useIcon() {
  // 引入全局主题状态
  const { darkMode } = useGlobalTheme()

  // 获取图标类名的函数
  const getIconClass = name => {
    return iconMap[name] || 'ri-question-line'
  }

  // 获取完整的图标组件 (包含使用的类)
  const getIcon = (name, additionalClasses = '') => {
    const iconClass = getIconClass(name)
    return {
      class: `remix-icon ${iconClass} ${additionalClasses}`,
      name,
    }
  }

  // 为主题切换提供图标，直接使用全局主题状态
  const themeIcon = computed(() => {
    return getIconClass(darkMode.value ? 'moon' : 'sun')
  })

  return {
    getIconClass,
    getIcon,
    themeIcon,
  }
}

// 直接导出一个获取图标的辅助函数，方便使用
export const remixIcon = (name, additionalClasses = '') => {
  const { getIconClass } = useIcon()
  return getIconClass(name)
}
