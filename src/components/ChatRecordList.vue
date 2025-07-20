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
      
      <!-- 按日期分组聊天列表 -->
      <div v-for="(group, groupName) in groupedChats" :key="groupName">
        <!-- 日期分组标题 -->
        <div class="date-group">{{ groupName }}</div>
        
        <!-- 该分组下的聊天项目 -->
        <div 
          v-for="chat in group" 
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
          
          <!-- 弹出菜单 -->
          <div class="menu-popup" v-if="activeMenuId === chat.id" @click.stop>
            <div class="menu-item rename" @click="renameChat(chat.id)">
              <i :class="getIconClass('edit')" class="menu-icon"></i>
              <span>重命名</span>
            </div>
            <div class="menu-item delete" @click="confirmDelete(chat.id)">
              <i :class="getIconClass('delete')" class="menu-icon delete-icon"></i>
              <span>删除</span>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="chatSessions.length === 0" class="empty-state">
        暂无聊天记录
      </div>
    </div>
    
    <!-- 点击其他区域关闭菜单的遮罩 -->
    <div class="menu-overlay" v-if="activeMenuId" @click="closeMenu"></div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { ElMessageBox, ElInput } from 'element-plus';
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

const emit = defineEmits(['new-chat', 'select-chat', 'delete-chat', 'rename-chat']);

// 当前激活的菜单ID
const activeMenuId = ref(null);

// 显示或隐藏菜单
const showMenu = (chatId) => {
  activeMenuId.value = chatId;
};

// 关闭菜单
const closeMenu = () => {
  activeMenuId.value = null;
};

// 创建新聊天
const createNewChat = () => {
  emit('new-chat');
};

// 选择聊天
const selectChat = (chatId) => {
  emit('select-chat', chatId);
};

// 重命名聊天
const renameChat = (chatId) => {
  const chat = props.chatSessions.find(chat => chat.id === chatId);
  if (!chat) return;
  
  ElMessageBox.prompt(
    '请输入新的聊天名称',
    '重命名聊天',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      inputValue: chat.title || '新的聊天',
      inputValidator: (value) => {
        return value.trim().length > 0 || '名称不能为空';
      }
    }
  )
    .then(({ value }) => {
      emit('rename-chat', { id: chatId, title: value });
      closeMenu();
    })
    .catch(() => {
      // 用户取消操作
      closeMenu();
    });
};

// 确认删除对话框
const confirmDelete = (chatId) => {
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
      emit('delete-chat', chatId);
      closeMenu();
    })
    .catch(() => {
      // 用户取消删除操作
      closeMenu();
    });
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

// 按日期分组聊天
const groupedChats = computed(() => {
  const groups = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 24 * 60 * 60 * 1000;
  const weekAgo = today - 7 * 24 * 60 * 60 * 1000;
  
  // 对聊天记录进行排序 (最新的在上面)
  const sortedChats = [...props.chatSessions].sort((a, b) => {
    return (b.lastUpdated || 0) - (a.lastUpdated || 0);
  });
  
  sortedChats.forEach(chat => {
    const timestamp = chat.lastUpdated || 0;
    
    if (timestamp >= today) {
      // 今天
      if (!groups['今天']) groups['今天'] = [];
      groups['今天'].push(chat);
    } else if (timestamp >= yesterday) {
      // 昨天
      if (!groups['昨天']) groups['昨天'] = [];
      groups['昨天'].push(chat);
    } else if (timestamp >= weekAgo) {
      // 7天内
      if (!groups['7 天内']) groups['7 天内'] = [];
      groups['7 天内'].push(chat);
    } else {
      // 更早
      if (!groups['更早']) groups['更早'] = [];
      groups['更早'].push(chat);
    }
  });
  
  return groups;
});
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
  position: relative;
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

.date-group {
  padding: 8px;
  font-size: 12px;
  color: var(--secondary-text-color, #999);
  font-weight: 500;
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
  position: relative;
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

.menu-popup {
  position: absolute;
  top: 0;
  right: 40px;
  background-color: var(--bg-color, white);
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
  width: 140px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: var(--hover-color, #f5f5f5);
}

.menu-icon {
  font-size: 16px;
}

.rename {
  color: var(--text-color);
}

.delete {
  color: #ff4d4f;
}

.delete-icon {
  color: #ff4d4f;
}

.menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 99;
}

.empty-state {
  text-align: center;
  padding: 24px 0;
  color: var(--secondary-text-color, #999);
  font-size: 14px;
}
</style> 