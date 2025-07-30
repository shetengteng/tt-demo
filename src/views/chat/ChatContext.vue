<template>
    <div class="chat-main">
        <div class="messages-wrapper">
            <MessageList :messages="messages" :is-loading="isLoading" />
        </div>
        <div class="input-wrapper">
            <MessageInput 
                @send-message="handleSendMessage" 
                @change-model="handleModelChange"
                @update-message="handleUpdateMessage"
            />
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
    updateMessage,
    currentChatId,
    chatSessions,
    saveMessage,
    saveChatSession
} = useGlobalMessageHandler()

// 处理消息更新
const handleUpdateMessage = async (updatedMessage) => {
    if (!currentChatId.value) return
    
    const currentChat = chatSessions.value.find(chat => chat.id === currentChatId.value)
    if (!currentChat) return
    
    // 更新最后一条消息
    const messageIndex = currentChat.messages.length - 1
    if (messageIndex >= 0 && !currentChat.messages[messageIndex].isUser) {
        // 更新消息内容
        currentChat.messages[messageIndex].content = updatedMessage.content
        
        // 保存到数据库
        await updateMessage(currentChatId.value, messageIndex, {
            content: updatedMessage.content
        })
        
        // 更新会话时间戳
        currentChat.lastUpdated = Date.now()
        await saveChatSession(currentChat)
    }
}
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
