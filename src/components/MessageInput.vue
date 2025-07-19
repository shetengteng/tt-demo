<template>
  <div class="input-area">
    <el-input
      v-model="inputMessage"
      placeholder="输入消息..."
      @keyup.enter="sendMessage"
    ></el-input>
    <el-button type="primary" @click="sendMessage">发送</el-button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const inputMessage = ref('');
const emit = defineEmits(['send-message']);

const sendMessage = () => {
  if (!inputMessage.value.trim()) return;
  emit('send-message', inputMessage.value);
  inputMessage.value = '';
};
</script>

<style scoped>
.input-area {
  display: flex;
  gap: 8px;
  padding: 16px;
  width: 100%;
  box-sizing: border-box;
  background-color: var(--chat-bg-color, #ffffff);
}

.el-input {
  flex: 1;
}
</style>