<template>
  <div class="chat-container" v-if="isMounted">
    <!-- 使用Splitter实现可拖拽分隔面板 -->
    <el-splitter style="height: 100%">
      <!-- 聊天记录列表面板 -->
      <el-splitter-panel :min="180" :max="300" size="220px">
        <ChatRecordList class="chat-records-list" />
      </el-splitter-panel>

      <!-- 聊天内容主区域面板 -->
      <el-splitter-panel>
        <ChatContext />
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<script setup>
  import ChatRecordList from '@/views/chat/ChatRecordList.vue'
  import ChatContext from '@/views/chat/ChatContext.vue'
  import { isMounted } from '@/composables/useGlobalMessageHandler'
</script>

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
  .dark-theme :deep(.el-splitter-bar__dragger:before) {
    background-color: var(--border-color, #333333);
  }

  .dark-theme :deep(.el-splitter__bar:hover) {
    background-color: var(--primary-color, #4a82f0);
  }
</style>
