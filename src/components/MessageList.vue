<template>
  <div class="message-list" ref="messageList">
    <div class="message-list-inner">
      <MessageItem
        v-for="(msg, index) in messages"
        :key="index"
        :msg="msg"
        :is-loading="isLoading"
        @content-rendered="scrollToBottom"
      />

    </div>
  </div>
</template>

<script setup>
import MessageItem from './MessageItem.vue';
import { ref, onUpdated, watch, nextTick } from 'vue';

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  }
});

const messageList = ref(null);

// 使用watch监听messages变化
watch(() => [...props.messages], () => {
  scrollToBottom();
}, { deep: true });

// 在组件更新后也尝试滚动
onUpdated(() => {
  scrollToBottom();
});

// 滚动到底部的函数
const scrollToBottom = () => {
  nextTick(() => {
    if (messageList.value) {
      // 确保DOM更新完成后再滚动
      setTimeout(() => {
        messageList.value.scrollTop = messageList.value.scrollHeight;
      }, 10); // 增加延迟以确保渲染完成
    }
  });
};
</script>

<style scoped>
.message-list {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 40px;
  scroll-behavior: smooth; /* 添加平滑滚动 */
}

.message-list-inner {
  padding: 16px;
  padding-bottom: 16px;
}
</style>