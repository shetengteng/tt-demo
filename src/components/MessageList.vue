<template>
  <div class="message-list" ref="messageList">
    <MessageItem
      v-for="(msg, index) in messages"
      :key="index"
      :msg="msg"
    />
  </div>
</template>

<script setup>
import MessageItem from './MessageItem.vue';
import { ref, onUpdated } from 'vue';

const props = defineProps({
  messages: {
    type: Array,
    required: true
  }
});

const messageList = ref(null);

onUpdated(() => {
  // 每次消息更新后滚动到底部
  if (messageList.value) {
    messageList.value.scrollTop = messageList.value.scrollHeight;
  }
});
</script>

<style scoped>
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}
</style>