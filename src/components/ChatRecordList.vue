<template>
  <div class="chat-records">
    <!-- 新建聊天按钮 -->
    <div class="new-chat-button" @click="createNewChat">
      <i :class="getIconClass('plus')"></i>
      <span>New Chat</span>
      <i :class="getIconClass('magic')" class="magic-icon"></i>
    </div>
    
    <div class="chat-list">
      <!-- 保存的聊天 -->
      <div class="chat-category">
        <i :class="getIconClass('star')" class="category-icon"></i>
        <span>Saved</span>
      </div>
      
      <!-- 聊天列表 -->
      <div 
        v-for="chat in chatSessions" 
        :key="chat.id"
        class="chat-item"
        :class="{ active: currentChatId === chat.id }"
        @click="selectChat(chat.id)"
      >
        <!-- 左侧图标，使用首字母或图标 -->
        <div class="chat-icon" :style="getIconStyle(chat)">
          <span>{{ getInitial(chat.title) }}</span>
        </div>
        
        <!-- 中间内容 -->
        <div class="chat-content">
          <div class="chat-title">{{ chat.title || '新的聊天' }}</div>
        </div>
        
        <!-- 右侧菜单 -->
        <div class="chat-actions">
          <i :class="getIconClass('dots')" class="menu-dots" @click.stop="showMenu(chat.id)"></i>
        </div>
      </div>
      
      <div v-if="chatSessions.length === 0" class="empty-state">
        暂无聊天记录
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { ElMessageBox } from 'element-plus';
import { useIcon } from '../composables/useIcon';

const { getIconClass } = useIcon();

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

const emit = defineEmits(['new-chat', 'select-chat', 'delete-chat']);

const createNewChat = () => {
  emit('new-chat');
};

const selectChat = (chatId) => {
  emit('select-chat', chatId);
};

// 获取聊天标题的首字母
const getInitial = (title) => {
  if (!title) return 'N';
  return title.charAt(0).toUpperCase();
};

// 根据聊天标题生成图标样式
const getIconStyle = (chat) => {
  // 预定义的颜色列表
  const colors = [
    { bg: '#e8f0fe', text: '#1a73e8' }, // 蓝色
    { bg: '#fce8e6', text: '#d93025' }, // 红色
    { bg: '#e6f4ea', text: '#1e8e3e' }, // 绿色
    { bg: '#fef7e0', text: '#f9ab00' }, // 黄色
    { bg: '#f3e8fd', text: '#9334e6' }, // 紫色
  ];
  
  // 根据聊天ID选择一个颜色
  const colorIndex = chat.id.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];
  
  return {
    backgroundColor: color.bg,
    color: color.text
  };
};

// 显示菜单
const showMenu = (chatId) => {
  ElMessageBox.confirm(
    '选择操作',
    '聊天菜单',
    {
      confirmButtonText: '重命名',
      cancelButtonText: '删除',
      distinguishCancelAndClose: true,
      type: 'info'
    }
  )
    .then(() => {
      // 重命名逻辑（此处仅示例）
      console.log('重命名', chatId);
    })
    .catch((action) => {
      if (action === 'cancel') {
        confirmDelete(chatId);
      }
    });
};

// 确认删除对话框
const confirmDelete = (chatId) => {
  ElMessageBox.confirm(
    '确定要删除此聊天记录吗？此操作无法恢复。',
    '删除确认',
    {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      emit('delete-chat', chatId);
    })
    .catch(() => {
      // 用户取消删除操作
    });
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
.chat-records {
  width: 250px;
  height: 100%;
  background-color: var(--sidebar-bg-color, #f5f5f5);
  border-right: 1px solid var(--border-color, #e0e0e0);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  padding: 10px;
}

.new-chat-button {
  margin: 8px;
  padding: 10px 15px;
  background-color: #05101f;
  color: white;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
}

.new-chat-button:hover {
  background-color: #122142;
}

.magic-icon {
  transform: rotate(45deg);
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
  padding: 0 4px;
}

.chat-item {
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.chat-item:hover {
  background-color: var(--hover-color, #e9e9e9);
}

.chat-item.active {
  background-color: var(--active-color, #e6f7ff);
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
}

.chat-title {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
}

.empty-state {
  text-align: center;
  padding: 24px 0;
  color: var(--secondary-text-color, #999);
  font-size: 14px;
}
</style> 