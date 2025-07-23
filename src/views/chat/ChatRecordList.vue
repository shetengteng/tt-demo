<template>
  <div class="chat-records">
    <!-- 新建聊天按钮 -->
    <el-button class="new-chat-button" @click="createNewChat">
      <i :class="getIconClass('plus')" class="icon-margin-right"></i>
      <span style="margin-left: 10px">New Chat</span>
      <i :class="getIconClass('bard')" style="margin-left: 10px"></i>
    </el-button>

    <div class="chat-list">
      <!-- 按日期分组聊天列表 -->
      <el-collapse v-model="activeGroups" class="custom-collapse">
        <el-collapse-item v-for="(group, groupName) in groupedChats" :key="groupName" :name="groupName"
          :title="groupName" class="date-group-item">
          <!-- 该分组下的聊天项目 -->
          <el-list class="chat-group-list">
            <ChatRecordItem v-for="chat in group" :key="chat.id" :chat="chat" :is-active="currentChatId === chat.id" />
          </el-list>
        </el-collapse-item>
      </el-collapse>

      <div v-if="chatSessions.length === 0" class="empty-state">
        暂无聊天记录
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useIcon } from '@/composables/useIcon'
import { useGlobalMessageHandler } from '@/composables/useGlobalMessageHandler'
import ChatRecordItem from './ChatRecordItem.vue'

const { getIconClass } = useIcon()

// 使用全局消息处理器
const {
  chatSessions,
  currentChatId,
  createNewChat,
} = useGlobalMessageHandler()

// 保持所有折叠面板展开
const activeGroups = ref(['今天', '昨天', '7 天内', '更早'])

// 按日期分组聊天
const groupedChats = computed(() => {
  const groups = {}
  const now = new Date()
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).getTime()
  const yesterday = today - 24 * 60 * 60 * 1000
  const weekAgo = today - 7 * 24 * 60 * 60 * 1000

  // 对聊天记录进行排序 (最新的在上面)
  const sortedChats = [...chatSessions.value].sort((a, b) => {
    return (b.lastUpdated || 0) - (a.lastUpdated || 0)
  })

  sortedChats.forEach(chat => {
    const timestamp = chat.lastUpdated || 0

    if (timestamp >= today) {
      // 今天
      if (!groups['今天']) groups['今天'] = []
      groups['今天'].push(chat)
    } else if (timestamp >= yesterday) {
      // 昨天
      if (!groups['昨天']) groups['昨天'] = []
      groups['昨天'].push(chat)
    } else if (timestamp >= weekAgo) {
      // 7天内
      if (!groups['7 天内']) groups['7 天内'] = []
      groups['7 天内'].push(chat)
    } else {
      // 更早
      if (!groups['更早']) groups['更早'] = []
      groups['更早'].push(chat)
    }
  })

  return groups
})
</script>

<style scoped>
.chat-records {
  width: 100%;
  /* 修改为100%宽度 */
  height: 100%;
  background-color: var(--sidebar-bg-color, #f5f5f5);
  border-right: 1px solid var(--border-color, #d0d0d0);
  display: flex;
  flex-direction: column;
  padding: 10px;
  position: relative;
  box-sizing: border-box;
  /* 确保padding不增加总宽度 */
  overflow: hidden;
  /* 防止滚动条出现在容器本身 */
}

.new-chat-button {
  margin: 8px;
  background-color: #000033;
  color: var(--new-chat-text, white);
  border: none;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: calc(100% - 16px);
  transition: all 0.2s ease;
  font-weight: 500;
  height: 40px;
}

.new-chat-button:hover {
  background-color: var(--new-chat-hover-bg, #0056cc);
}

/* 使用深度选择器确保Element UI按钮的hover样式被正确覆盖 */
:deep(.new-chat-button:hover) {
  background-color: #000066 !important;
  border-color: #000066 !important;
}

:deep(.new-chat-button) {
  background-color: #000033 !important;
  border-color: #000033 !important;
  color: white !important;
}

/* 深色主题下的按钮样式 */
:deep(.dark-theme .new-chat-button) {
  background-color: #4a82f0 !important;
  border-color: #4a82f0 !important;
  color: white !important;
}

:deep(.dark-theme .new-chat-button:hover) {
  background-color: #3a72e0 !important;
  border-color: #3a72e0 !important;
}

.icon-margin-right {
  margin-right: 0;
}

.chat-category {
  margin: 16px 8px 8px 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--secondary-text-color, #999);
  font-weight: 500;
}

.category-icon {
  font-size: 14px;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  /* 隐藏横向滚动条 */
  padding: 0 8px 0 0;
  width: 100%;
  /* 确保列表占满容器宽度 */
}

/* 自定义Element UI折叠面板样式 */
.custom-collapse {
  --el-collapse-header-height: 30px;
  --el-collapse-header-bg-color: transparent;
  --el-collapse-header-text-color: var(--secondary-text-color, #999);
  --el-collapse-content-bg-color: transparent;
  --el-collapse-border-color: transparent;
  width: 100%;
  /* 确保折叠面板占满宽度 */
}

/* 修复折叠面板可能导致的滚动问题 */
.date-group-item {
  overflow-x: hidden;
  width: 100%;
}

.date-group-item :deep(.el-collapse-item__header) {
  font-size: 12px;
  font-weight: 500;
  padding: 0 8px;
  color: var(--secondary-text-color, #999);
}

/* 修复箭头不可见的问题 */
.date-group-item :deep(.el-collapse-item__arrow) {
  color: var(--secondary-text-color, #999);
  font-size: 12px;
  margin: 0 8px;
  transition: transform 0.3s;
}

.date-group-item :deep(.is-active .el-collapse-item__arrow) {
  transform: rotate(90deg);
}

.date-group-item :deep(.el-collapse-item__content) {
  padding: 0;
}

.date-group-item :deep(.el-collapse-item__wrap) {
  overflow: hidden;
  /* 防止内容区出现滚动条 */
}

.chat-group-list {
  padding: 0;
  width: 100%;
  /* 确保组列表占满宽度 */
  overflow: hidden;
  /* 隐藏可能的滚动条 */
}



.empty-state {
  text-align: center;
  padding: 24px 0;
  color: var(--secondary-text-color, #999);
  font-size: 14px;
}

/* Element UI 主题适配 */
:deep(.el-button--primary) {
  background-color: var(--new-chat-bg, #0078ff);
  border-color: var(--new-chat-bg, #0078ff);
  color: var(--new-chat-text, white);
}

:deep(.el-button--primary:hover) {
  background-color: var(--new-chat-hover-bg, #0056cc);
  border-color: var(--new-chat-hover-bg, #0056cc);
}

:deep(.el-dropdown-menu) {
  background-color: var(--card-bg, #f5f5f5);
  border-color: var(--border-color, #d0d0d0);
}

:deep(.el-dropdown-menu__item) {
  color: var(--text-color, #000000);
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: var(--hover-color, #e9e9e9);
  color: var(--text-color, #000000);
}

:deep(.el-dropdown-menu__item.is-disabled) {
  color: var(--secondary-text-color, #999);
}

/* Dark theme overrides */
.dark-theme :deep(.el-dropdown-menu) {
  background-color: var(--card-bg, #2d2d2d);
  border-color: var(--border-color, #555555);
}

.dark-theme :deep(.el-dropdown-menu__item) {
  color: var(--text-color, #ffffff);
}

.dark-theme :deep(.el-dropdown-menu__item:hover) {
  background-color: var(--hover-color, #333333);
  color: var(--text-color, #ffffff);
}
</style>
