<template>
  <div class="chat-container" v-if="isMounted">
    <MessageList :messages="messages"/>
    <MessageInput @send-message="handleSendMessage"/>
  </div>
</template>

<script setup>
import MessageList from '../components/MessageList.vue';
import MessageInput from '../components/MessageInput.vue';
import {useMessageHandler} from '../composables/useMessageHandler';

const {handleSendMessage, messages, isMounted} = useMessageHandler();


</script>

<style scoped>
.chat-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.message {
  max-width: 70%;
  padding: 8px 12px;
  margin-bottom: 8px;
  border-radius: 8px;
}

.user {
  background: #0078ff;
  color: white;
  margin-left: auto;
}

.ai {
  background: #e5e5ea;
  color: black;
}

.input-area {
  display: flex;
  gap: 8px;
  padding: 16px;
}

.el-input {
  flex: 1;
}
</style>