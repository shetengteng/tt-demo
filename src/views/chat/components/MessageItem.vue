<template>
  <div class="user-message" v-if="msg.isUser">
    {{ msg.content }}
  </div>
  <div class="system-message" v-else-if="msg.isSystem">
    <MarkdownRenderer :content="msg.content" />
  </div>
  <div class="ai-message-wrapper" v-else>
    <!-- 将图标移至消息外部 -->
    <div class="ai-icon-wrapper">
      <i :class="getIconClass('robot')" class="ai-icon"></i>
      <!-- Loading动画 - 三个点闪动 -->
      <div v-if="isLoading && !msg.content" class="loading-dots">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
    <div class="ai-message-content">
      <!-- 添加模型信息显示 -->
      <div class="ai-model-info">
        {{ msg.model || '知识库搜索' }}
        <span v-if="msg.isReasoningModel" class="reasoning-badge">推理模型</span>
        <span v-if="msg.isKnowledgeBase" class="knowledge-badge">知识库</span>
      </div>

      <!-- 推理模型：显示思考过程 + 最终答案 -->
      <template v-if="msg.isReasoningModel">
        <!-- 思考过程 -->
        <div v-if="msg.reasoningContent" class="reasoning-content">
          <div class="reasoning-header">
            <i :class="getIconClass('lightbulb')" class="thinking-icon"></i>
            <h4>思考过程</h4>
          </div>
          <div class="reasoning-body">
            <MarkdownRenderer :content="msg.reasoningContent" @content-rendered="notifyContentRendered"
              class="reasoning-text" />
          </div>
        </div>

        <!-- 思考中提示 (仅当思考中且还没有内容显示时) -->
        <div v-if="
          msg.reasoningContent &&
          !msg.reasoningComplete &&
          !msg.contentStarted
        " class="thinking-indicator">
          <span class="dot-1">.</span>
          <span class="dot-2">.</span>
          <span class="dot-3">.</span>
          <span class="thinking-text">思考中</span>
        </div>

        <!-- 显示回答内容 (无论思考过程是否完成，只要有内容就显示) -->
        <div v-if="hasAnswer || msg.contentStarted" class="ai-message final-answer">
          <div class="answer-header">
            <i :class="getIconClass('check')" class="answer-icon"></i>
            <h4>回答</h4>
            <div v-if="!msg.reasoningComplete" class="typing-indicator">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          </div>
          <div class="answer-body">
            <MarkdownRenderer :content="displayedAnswer" @content-rendered="notifyContentRendered" />
          </div>
        </div>
      </template>

      <!-- 知识库搜索 -->
      <div v-else-if="msg.isKnowledgeBase" class="ai-message knowledge-message">
        <MarkdownRenderer :content="msg.content" @content-rendered="notifyContentRendered" />
        <div v-if="isLoading && !msg.content" class="knowledge-searching">
          <i :class="getIconClass('search')" class="search-icon"></i>
          <span>正在搜索知识库...</span>
        </div>
      </div>

      <!-- 普通模型：只显示内容 -->
      <div v-else class="ai-message">
        <MarkdownRenderer :content="msg.content" @content-rendered="notifyContentRendered" />
      </div>
    </div>
  </div>
</template>

<script setup>
import MarkdownRenderer from '../../../components/MarkdownRenderer.vue'
import { useIcon } from '@/composables/useIcon.js'
import { computed } from 'vue'

const { getIconClass } = useIcon()

const props = defineProps({
  msg: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

// 计算属性：判断是否有任何回答内容可以显示
const hasAnswer = computed(() => {
  return props.msg.content || props.msg.tempContent
})

// 计算属性：获取要显示的回答内容
const displayedAnswer = computed(() => {
  // 优先使用content（如果有），否则使用tempContent
  return props.msg.content || props.msg.tempContent || ''
})

// 定义事件
const emit = defineEmits(['content-rendered'])

// 当Markdown渲染完成时通知父组件
const notifyContentRendered = () => {
  emit('content-rendered')
}
</script>

<style scoped>
.user-message {
  margin: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  display: flex;
  max-width: fit-content;
  width: auto;
  justify-content: flex-end;
  margin-left: auto;
  background-color: var(--user-bg);
  color: var(--user-text);
}

.system-message {
  margin: 8px auto;
  padding: 4px 8px;
  max-width: 80%;
  text-align: center;
  color: var(--text-secondary-color, #666);
  font-style: italic;
  font-size: 0.9em;
}

.ai-message-wrapper {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.ai-icon-wrapper {
  position: relative;
  margin-top: 4px;
  flex-shrink: 0;
}

.ai-icon {
  width: 20px;
  height: 20px;
  color: var(--ai-icon-color);
  font-size: 20px;
}

.loading-dots {
  position: absolute;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 2px;
}

.dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #0078d4;
  animation: dotBlink 1.4s infinite ease-in-out;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes dotBlink {

  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }

  40% {
    opacity: 1;
    transform: scale(1);
  }
}

.ai-message-content {
  display: flex;
  flex-direction: column;
  max-width: 85%;
  gap: 12px;
}

.ai-model-info {
  font-size: 12px;
  margin-bottom: 2px;
  color: var(--secondary-text-color, #666);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reasoning-badge {
  background-color: #e3f2fd;
  color: #0078d4;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
}

.knowledge-badge {
  background-color: #f0f4c3;
  color: #8bc34a;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: bold;
}

.ai-message {
  padding: 12px;
  border-radius: 12px;
  max-width: 100%;
  background-color: var(--ai-bg);
  color: var(--ai-text);
}

.knowledge-message {
  background-color: var(--ai-bg);
  border-left: 3px solid #8bc34a;
}

.knowledge-searching {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--secondary-text-color, #666);
  font-size: 14px;
  margin-top: 8px;
}

.search-icon {
  color: #8bc34a;
}

/* 思考过程样式 */
.reasoning-content {
  background-color: rgba(0, 120, 212, 0.05);
  border-radius: 8px;
  padding: 1px 12px 12px;
  border-left: 3px solid #0078d4;
  margin-bottom: 8px;
}

.reasoning-text :deep(.markdown-body) {
  font-size: 12px !important;
  color: var(--secondary-text-color, #666) !important;
  line-height: 1.5;
}

.reasoning-text :deep(pre),
.reasoning-text :deep(code) {
  font-size: 13px !important;
  /* 增加思考链中的代码字体大小 */
}

.reasoning-header,
.answer-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  margin-top: 8px;
}

.reasoning-header h4,
.answer-header h4 {
  margin: 0;
  font-weight: 500;
  font-size: 14px;
}

.thinking-icon {
  color: #0078d4;
  font-size: 16px;
}

.answer-icon {
  color: #28a745;
  font-size: 16px;
}

.final-answer {
  background-color: var(--ai-bg);
  border-left: 3px solid #28a745;
}

.answer-body,
.reasoning-body {
  margin-left: 24px;
}

/* 思考中指示器样式 */
.thinking-indicator {
  display: flex;
  align-items: center;
  margin: 8px 0;
  color: #0078d4;
  font-weight: 500;
}

.thinking-text {
  margin-left: 4px;
}

@keyframes dotAnimation {
  0% {
    opacity: 0.3;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.3;
  }
}

.dot-1,
.dot-2,
.dot-3 {
  font-size: 24px;
  line-height: 10px;
  animation: dotAnimation 1.5s infinite;
  display: inline-block;
}

.dot-1 {
  animation-delay: 0s;
}

.dot-2 {
  animation-delay: 0.3s;
}

.dot-3 {
  animation-delay: 0.6s;
}

/* 输入指示器样式 */
.typing-indicator {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  margin-left: 6px;
}

.typing-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: #28a745;
  animation: dotAnimation 1s infinite;
  display: inline-block;
}

.typing-dot:nth-child(1) {
  animation-delay: 0s;
}

.typing-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dot:nth-child(3) {
  animation-delay: 0.4s;
}
</style>
