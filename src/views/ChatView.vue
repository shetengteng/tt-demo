<template>
  <div class="chat-container" v-if="isMounted">
    <div class="messages-wrapper">
      <MessageList :messages="messages"/>
    </div>
    <div class="input-wrapper">
      <MessageInput @send-message="handleSendMessage"/>
    </div>
  </div>
</template>

<script setup>
import MessageList from '../components/MessageList.vue';
import MessageInput from '../components/MessageInput.vue';
import {useMessageHandler} from '../composables/useMessageHandler';

const {handleSendMessage, messages, isMounted} = useMessageHandler();


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
  flex-direction: column;
  position: relative;
  overflow: hidden; /* 防止整个容器出现额外的滚动条 */
}

.messages-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.input-wrapper {
  flex-shrink: 0;
  position: relative;
  z-index: 10;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  background-color: var(--chat-bg-color, #ffffff);
  border-top: 1px solid var(--border-color, #e0e0e0);
}

/* 移除被深度组件继承的样式 */
:deep(.message-list) {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>