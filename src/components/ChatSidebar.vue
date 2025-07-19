<template>
  <div class="chat-sidebar">
    <div class="sidebar-header">
      <h3>聊天记录</h3>
      <el-button 
        type="primary" 
        size="small" 
        circle 
        @click="createNewChat"
        class="new-chat-btn"
      >
        <i class="el-icon-plus">+</i>
      </el-button>
    </div>
    
    <div class="chat-list">
      <div 
        v-for="chat in chatSessions" 
        :key="chat.id"
        class="chat-item"
        :class="{ active: currentChatId === chat.id }"
        @click="selectChat(chat.id)"
      >
        <div class="chat-title">{{ chat.title || '新的聊天' }}</div>
        <div class="chat-time">{{ formatTime(chat.lastUpdated) }}</div>
      </div>
      
      <div v-if="chatSessions.length === 0" class="empty-state">
        暂无聊天记录
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  chatSessions: {
    type: Array,
    required: true
  },
  currentChatId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['new-chat', 'select-chat']);

const createNewChat = () => {
  emit('new-chat');
};

const selectChat = (chatId) => {
  emit('select-chat', chatId);
};

// 格式化时间
const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  
  // 同一天显示时间，不同天显示日期
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  } else {
    return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' });
  }
};
</script>

<style scoped>
.chat-sidebar {
  width: 250px;
  height: 100%;
  background-color: var(--sidebar-bg-color, #f5f5f5);
  border-right: 1px solid var(--border-color, #e0e0e0);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color, #e0e0e0);
}

.sidebar-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
}

.chat-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.chat-item {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  position: relative;
}

.chat-item:hover {
  background-color: var(--hover-color, #e9e9e9);
}

.chat-item.active {
  background-color: var(--active-color, #e6f7ff);
}

.chat-title {
  font-size: 14px;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-time {
  font-size: 12px;
  color: var(--secondary-text-color, #999);
}

.empty-state {
  text-align: center;
  padding: 24px 0;
  color: var(--secondary-text-color, #999);
  font-size: 14px;
}

.new-chat-btn {
  min-height: 32px;
  min-width: 32px;
  font-size: 16px;
}
</style> 