<template>
    <div class="chat-main">
        <div class="messages-wrapper">
            <MessageList :messages="messages" :is-loading="isLoading" />
        </div>
        <div class="input-wrapper">
            <MessageInput @send-message="handleSendMessage" @change-model="handleModelChange" />
        </div>
    </div>
</template>

<script setup>
import MessageList from '@/views/chat/components/MessageList.vue'
import MessageInput from '@/views/chat/components/MessageInput.vue'
import { useGlobalMessageHandler } from '@/composables/useGlobalMessageHandler'

// 使用全局消息处理器
const {
    messages,
    isLoading,
    handleSendMessage,
    handleModelChange,
} = useGlobalMessageHandler()
</script>

<style scoped>
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
    min-height: 0;
}

.input-wrapper {
    flex-shrink: 0;
    background-color: transparent;
    padding: 0 40px 20px 40px;
}
</style>
