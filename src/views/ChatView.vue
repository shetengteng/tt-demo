<template>
  <div class="chat-container" v-if="isMounted">
    <!-- 使用Splitter实现可拖拽分隔面板 -->
    <el-splitter style="height: 100%">
      <!-- 聊天记录列表面板 -->
      <el-splitter-panel :min="180" :max="300" size="220px">
        <ChatRecordList 
          :chat-sessions="chatSessions"
          :current-chat-id="currentChatId"
          @new-chat="createNewChat"
          @select-chat="selectChat"
          @delete-chat="deleteChat"
          @rename-chat="renameChat"
          class="chat-records-list"
        />
      </el-splitter-panel>
      
      <!-- 聊天内容主区域面板 -->
      <el-splitter-panel>
        <div class="chat-main">
          <div class="messages-wrapper">
            <MessageList :messages="messages"/>
          </div>
          <div class="input-wrapper">
            <MessageInput 
              @send-message="handleSendMessage"
              @change-model="handleModelChange"
            />
          </div>
        </div>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup>
import MessageList from '../components/MessageList.vue';
import MessageInput from '../components/MessageInput.vue';
import ChatRecordList from '../components/ChatRecordList.vue';
import {useMessageHandler} from '../composables/useMessageHandler';

const {
  handleSendMessage, 
  handleModelChange, 
  messages, 
  isMounted, 
  chatSessions, 
  currentChatId, 
  createNewChat, 
  selectChat,
  deleteChat,
  renameChat
} = useMessageHandler();
</script>

<style>
/* 全局样式覆盖，确保滚动条行为一致 */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
}

/* 确保根容器也是全高的 */
#app {
  height: 100%;
  overflow: hidden;
}
</style>

<style scoped>
.chat-container {
  height: 100%;
  display: flex;
  position: relative;
  overflow: hidden; /* 防止整个容器出现额外的滚动条 */
}

.chat-records-list {
  height: 100%;
  overflow-y: auto;
}

.chat-main {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.messages-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 0; /* 确保flex子元素可以正确收缩 */
}

.input-wrapper {
  flex-shrink: 0; /* 防止输入框被压缩 */
  background-color: transparent;
  padding: 0 40px 20px 40px;
}

/* 移除被深度组件继承的样式 */
:deep(.message-list) {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 自定义分隔条样式 */
:deep(.el-splitter__bar) {
  background-color: var(--border-color, #e0e0e0);
}

:deep(.el-splitter__bar:hover) {
  background-color: var(--primary-color, #4a82f0);
}

/* Dark theme splitter bar overrides */
.dark-theme :deep(el-splitter-bar__dragger:before) {
  background-color: var(--border-color, #333333);
}

.dark-theme :deep(.el-splitter__bar:hover) {
  background-color: var(--primary-color, #4a82f0);
}

/* 自定义滚动条样式 */
:deep(.message-list)::-webkit-scrollbar {
  width: 6px;
}

:deep(.message-list)::-webkit-scrollbar-track {
  background-color: transparent;
}

:deep(.message-list)::-webkit-scrollbar-thumb {
  background-color: var(--border-color, #d0d0d0);
  border-radius: 3px;
}

:deep(.message-list)::-webkit-scrollbar-thumb:hover {
  background-color: var(--secondary-text-color, #999);
}

/* Dark theme scrollbar overrides */
.dark-theme :deep(.message-list)::-webkit-scrollbar-thumb {
  background-color: var(--border-color, #666666);
}

.dark-theme :deep(.message-list)::-webkit-scrollbar-thumb:hover {
  background-color: var(--secondary-text-color, #a0a0a0);
}
</style>