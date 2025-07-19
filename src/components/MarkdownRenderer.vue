<template>
  <div class="markdown-body" v-html="renderedMarkdown"></div>
</template>

<script setup>
import { computed, onMounted, watch, nextTick, ref } from 'vue';
import markdownIt from 'markdown-it';
import DOMPurify from 'dompurify';
import markdownItHighlightjs from 'markdown-it-highlightjs';
import 'github-markdown-css';
import { useGlobalTheme } from '@/composables/useGlobalTheme';

// 获取全局主题状态
const { darkMode } = useGlobalTheme();


// 创建markdown实例的函数
const createMarkdownInstance = () => {
  return markdownIt({
    html: true,
    linkify: true,
    typographer: true
  }).use(markdownItHighlightjs);
};

// 响应式的markdown实例
const md = ref(createMarkdownInstance());

// 动态加载高亮主题
const loadTheme = async (isDark) => {
  try {
    if (isDark) {
      await import('highlight.js/styles/atom-one-dark.css');
    } else {
      await import('highlight.js/styles/atom-one-light.css');
    }
    console.log('主题已切换:', isDark ? '深色' : '浅色');

    // 重新创建markdown实例以确保代码高亮样式正确应用
    md.value = createMarkdownInstance();
  } catch (error) {
    console.error('加载主题失败:', error);
  }
};

// 初始加载当前主题
onMounted(async () => {
  await loadTheme(darkMode.value);
});


const props = defineProps({
  content: {
    type: String,
    required: true,
    default: ''
  }
});

// 计算属性：处理 Markdown 渲染和 XSS 净化
const renderedMarkdown = computed(() => {
  if (!props.content) return '';
  const html = md.value.render(props.content);
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
  background-color: var(--chat-bg-color);
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

/* 强制代码高亮样式在主题切换时重新应用 */
.dark-theme :deep(.hljs) {
  background: var(--code-bg) !important;
  color: var(--text-color) !important;
}

:deep(.hljs) {
  background: var(--code-bg) !important;
  color: var(--text-color) !important;
}
</style>