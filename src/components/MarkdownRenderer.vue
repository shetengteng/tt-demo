<template>
  <div class="markdown-body" v-html="renderedMarkdown"></div>
</template>

<script setup>
import {computed } from 'vue';
import markdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import markdownItHighlightjs from 'markdown-it-highlightjs';
import 'github-markdown-css';
import 'highlight.js/styles/atom-one-light.css';
// import 'highlight.js/styles/atom-one-dark.css';

const props = defineProps({
  content: {
    type: String,
    required: true,
    default: ''
  }
});

// 初始化 markdown-it 实例并配置插件
const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true
}).use(markdownItHighlightjs);

// 计算属性：处理 Markdown 渲染和 XSS 净化
const renderedMarkdown = computed(() => {
  if (!props.content) return '';
  // 先渲染 Markdown 为 HTML，再进行安全净化
  const html = md.render(props.content);
  return DOMPurify.sanitize(html);
});
</script>

<style scoped>
/* 自定义 Markdown 容器样式以适应聊天界面 */
.markdown-body {
  font-size: 14px;
  line-height: 1.6;
  padding: 8px 12px;
  color: var(--text-color);
  background-color: var(--chat-bg-color); /* 修改为对话框使用的背景色变量 */
}

/* 适配深色模式 */
:deep(.markdown-body) {
  color: var(--text-color) !important;
}

/* 更新代码块样式 */
:deep(pre) {
  padding: 8px;
  border-radius: 4px;
  margin: 8px 0;
  background-color: var(--code-bg);
  border: 1px solid var(--code-border);
}

/* 适配深色模式 */
.dark-theme :deep(pre) {
  background-color: var(--card-bg);
}

:deep(code) {
  background-color: transparent;
}
</style>