<template>
  <div class="chat-item" :class="{ active: isActive }" @click="selectChat">
    <!-- 左侧图标，使用首字母或图标 -->
    <div class="chat-icon" :style="getIconStyle(chat)">
      <span>{{ getInitial(chat.title) }}</span>
    </div>

    <!-- 中间内容 -->
    <div class="chat-content">
      <div class="chat-title">{{ chat.title || '新的聊天' }}</div>
    </div>

    <!-- 右侧菜单 -->
    <el-dropdown @command="handleCommand" trigger="click" class="chat-actions" @click.stop>
      <span class="el-dropdown-link">
        <i :class="getIconClass('dots')" class="menu-dots"></i>
      </span>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="rename">
            <i :class="getIconClass('edit')" class="menu-icon"></i>
            <span>重命名</span>
          </el-dropdown-item>
          <el-dropdown-item command="delete" divided>
            <i :class="getIconClass('delete')" class="menu-icon delete-icon"></i>
            <span class="delete-text">删除</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { useIcon } from '@/composables/useIcon.js'
import { useGlobalMessageHandler } from '@/composables/useGlobalMessageHandler'
import { ElMessageBox } from 'element-plus'

const { getIconClass } = useIcon()

// 使用全局消息处理器
const {
  selectChat: globalSelectChat,
  deleteChat,
  renameChat,
} = useGlobalMessageHandler()

// 定义props
const props = defineProps({
  chat: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

// 选择聊天
const selectChat = () => {
  globalSelectChat(props.chat.id)
}

// 重命名聊天
const handleRenameChat = () => {
  ElMessageBox.prompt('请输入新的聊天名称', '重命名聊天', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    inputValue: props.chat.title || '新的聊天',
    inputValidator: value => {
      return value.trim().length > 0 || '名称不能为空'
    },
  })
    .then(({ value }) => {
      renameChat({ id: props.chat.id, title: value })
    })
    .catch(() => {
      // 用户取消操作
    })
}

// 确认删除对话框
const confirmDelete = () => {
  ElMessageBox.confirm(
    '确定要删除此聊天记录吗？此操作无法恢复。',
    '删除确认',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      deleteChat(props.chat.id)
    })
    .catch(() => {
      // 用户取消删除操作
    })
}

// 处理下拉菜单命令
const handleCommand = (command) => {
  if (command === 'rename') {
    handleRenameChat()
  } else if (command === 'delete') {
    confirmDelete()
  }
}

// 获取聊天标题的首字母
const getInitial = (title) => {
  if (!title) return 'N'
  return title.charAt(0).toUpperCase()
}

// 根据聊天标题生成图标样式
const getIconStyle = (chat) => {
  // 预定义的颜色列表
  const colors = [
    { bg: '#e8f0fe', text: '#1a73e8' }, // 蓝色
    { bg: '#fce8e6', text: '#d93025' }, // 红色
    { bg: '#e6f4ea', text: '#1e8e3e' }, // 绿色
    { bg: '#fef7e0', text: '#f9ab00' }, // 黄色
    { bg: '#f3e8fd', text: '#9334e6' }, // 紫色
  ]

  // 防御性检查：确保 chat 和 chat.id 不为空
  if (!chat || !chat.id) {
    return {
      backgroundColor: colors[0].bg,
      color: colors[0].text,
    }
  }

  // 根据聊天ID选择一个颜色
  const colorIndex = chat.id.charCodeAt(0) % colors.length
  const color = colors[colorIndex]

  return {
    backgroundColor: color.bg,
    color: color.text,
  }
}
</script>

<style scoped>
.chat-item {
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  width: auto;
  box-sizing: border-box;
  max-width: 100%;
}

.chat-item:hover {
  background-color: var(--hover-color, #e9e9e9);
}

.chat-item.active {
  background-color: var(--selected-bg-color, #d3d3d3);
  color: var(--selected-text-color, #333);
}

.chat-item.active .chat-title {
  color: var(--selected-text-color, #333);
}

.chat-item.active .chat-icon {
  color: var(--selected-text-color, #333);
}

.chat-icon {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;
  font-size: 14px;
  flex-shrink: 0;
}

.chat-content {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-title {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--primary-text-color, #333);
}

.chat-actions {
  opacity: 0;
  transition: opacity 0.2s;
}

.chat-item:hover .chat-actions {
  opacity: 1;
}

.menu-dots {
  color: var(--secondary-text-color, #999);
  font-size: 16px;
  padding: 4px;
  cursor: pointer;
}

.menu-icon {
  margin-right: 6px;
  font-size: 14px;
}

.delete-text {
  color: #ff4d4f;
}

.delete-icon {
  color: #ff4d4f;
}

/* 深色主题下选中状态的样式 */
.dark-theme .chat-item.active {
  background-color: var(--selected-bg-color, #555555);
  color: var(--selected-text-color, #ffffff);
}

.dark-theme .chat-item.active .chat-title {
  color: var(--selected-text-color, #ffffff);
}

.dark-theme .chat-item.active .chat-icon {
  color: var(--selected-text-color, #ffffff);
}
</style>