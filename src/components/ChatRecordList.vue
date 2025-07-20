<template>
  <div class="chat-records">
    <!-- 新建聊天按钮 -->
    <el-button class="new-chat-button" @click="createNewChat" type="primary">
      <i :class="getIconClass('plus')" class="icon-margin-right"></i>
      <span style="margin-left: 10px;">New Chat</span>
      <i :class="getIconClass('bard')" style="margin-left: 10px;"></i>
    </el-button>
    
    <div class="chat-list">
      
      <!-- 按日期分组聊天列表 -->
      <el-collapse v-model="activeGroups" class="custom-collapse">
        <el-collapse-item 
          v-for="(group, groupName) in groupedChats" 
          :key="groupName"
          :name="groupName"
          :title="groupName"
          class="date-group-item"
        >
          <!-- 该分组下的聊天项目 -->
          <el-list class="chat-group-list">
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
              <el-dropdown 
                @command="handleCommand($event, chat.id)" 
                trigger="click" 
                class="chat-actions"
                @click.stop
              >
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
import { computed, ref } from 'vue';
import { ElMessageBox, ElInput } from 'element-plus';
import { useIcon } from '../composables/useIcon';

const { getIconClass } = useIcon();

// 保持所有折叠面板展开
const activeGroups = ref(['今天', '昨天', '7 天内', '更早']);

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

// 处理下拉菜单命令
const handleCommand = (command, chatId) => {
  if (command === 'rename') {
    renameChat(chatId);
  } else if (command === 'delete') {
    confirmDelete(chatId);
  }
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
    })
    .catch(() => {
      // 用户取消操作
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
    })
    .catch(() => {
      // 用户取消删除操作
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
  
  // 防御性检查：确保 chat 和 chat.id 不为空
  if (!chat || !chat.id) {
    return {
      backgroundColor: colors[0].bg,
      color: colors[0].text
    };
  }
  
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
  width: 100%; /* 修改为100%宽度 */
  height: 100%;
  background-color: var(--sidebar-bg-color, #f5f5f5);
  border-right: 1px solid var(--border-color, #d0d0d0);
  display: flex;
  flex-direction: column;
  padding: 10px;
  position: relative;
  box-sizing: border-box; /* 确保padding不增加总宽度 */
  overflow: hidden; /* 防止滚动条出现在容器本身 */
}

.new-chat-button {
  margin: 8px;
  background-color: var(--new-chat-bg, #0078ff);
  color: var(--new-chat-text, white);
  border: none;
  border-radius: 20px;
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
  overflow-x: hidden; /* 隐藏横向滚动条 */
  padding: 0 4px;
  width: 100%; /* 确保列表占满容器宽度 */
}

/* 自定义Element UI折叠面板样式 */
.custom-collapse {
  --el-collapse-header-height: 30px;
  --el-collapse-header-bg-color: transparent;
  --el-collapse-header-text-color: var(--secondary-text-color, #999);
  --el-collapse-content-bg-color: transparent;
  --el-collapse-border-color: transparent;
  width: 100%; /* 确保折叠面板占满宽度 */
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
  overflow: hidden; /* 防止内容区出现滚动条 */
}

.chat-group-list {
  padding: 0;
  width: 100%; /* 确保组列表占满宽度 */
  overflow: hidden; /* 隐藏可能的滚动条 */
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
  width: auto; /* 改为auto以防止宽度溢出 */
  box-sizing: border-box; /* 确保padding不增加总宽度 */
  max-width: 100%; /* 确保不超出容器 */
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

/* 自定义滚动条样式 */
.chat-list::-webkit-scrollbar {
  width: 6px;
}

.chat-list::-webkit-scrollbar-track {
  background-color: transparent;
}

.chat-list::-webkit-scrollbar-thumb {
  background-color: var(--border-color, #d0d0d0);
  border-radius: 3px;
}

.chat-list::-webkit-scrollbar-thumb:hover {
  background-color: var(--secondary-text-color, #999);
}

/* Dark theme scrollbar overrides */
.dark-theme .chat-list::-webkit-scrollbar-thumb {
  background-color: var(--border-color, #666666);
}

.dark-theme .chat-list::-webkit-scrollbar-thumb:hover {
  background-color: var(--secondary-text-color, #a0a0a0);
}
</style> 