<template>
    <div class="user-message" v-if="msg.isUser">
        <div class="user-name">用户</div>
        <div class="user-content">{{ msg.content }}</div>
    </div>
    <div class="ai-message" v-else>
        <div class="user-name">助手</div>
        <div class="user-content">
            <MarkdownRenderer :content="msg.content" />
        </div>
    </div>
</template>

<script setup>
import MarkdownRenderer from './MarkdownRenderer.vue';
const props = defineProps({
    msg: {
        type: Object,
        required: true
    }
});
</script>

<style scoped>
.user-message {
    margin-bottom: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    display: flex;
    max-width: fit-content;
    width: auto;
    justify-content: flex-end;
    margin-left: auto;
    background-color: var(--user-bg);
    color: var(--user-text);
}

.ai-message {
    margin-bottom: 8px;
    padding: 8px 12px;
    border-radius: 8px;
    display: flex;
    max-width: fit-content;
    width: auto;
    justify-content: flex-start;
    background-color: var(--ai-bg);
    color: var(--ai-text);

}
</style>