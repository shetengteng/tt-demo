<template>
    <div class="user-message" v-if="msg.isUser">
        {{ msg.content }}
    </div>
    <div class="ai-message-wrapper" v-else>
        <!-- 将图标移至消息外部 -->
        <FontAwesomeIcon :icon="faRobot" class="ai-icon" />
        <div class="ai-message">
            <MarkdownRenderer :content="msg.content" />
        </div>
    </div>
</template>

<script setup>
import MarkdownRenderer from './MarkdownRenderer.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faRobot } from '@fortawesome/free-solid-svg-icons';
const props = defineProps({
    msg: {
        type: Object,
        required: true
    }
});
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

.ai-message-wrapper {
    display: flex;
    gap: 12px;
    margin-bottom: 8px;
}

.ai-icon {
    width: 20px;
    height: 20px;
    color: var(--ai-icon-color);
    margin-top: 4px;
    /* 轻微调整顶部对齐 */
}

.ai-name {
    /* 移除垂直居中 */
    margin-bottom: 6px;
    font-weight: 500;
}

.ai-message {
    /* 移除原有的margin-bottom，由外层容器控制间距 */
    padding: 8px 12px;
    border-radius: 12px;
    max-width: fit-content;
    background-color: var(--ai-bg);
    color: var(--ai-text);
}
</style>