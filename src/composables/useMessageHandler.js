import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { sendMessageToAI } from '../utils/api';

export function useMessageHandler() {
  const messages = ref([]);
  const isMounted = ref(true);
  const controller = ref(new AbortController());

  onMounted(() => {
    // 加载历史消息
    try {
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) messages.value = JSON.parse(savedMessages);
    } catch (error) {
      console.error('Failed to parse chat history:', error);
      localStorage.removeItem('chatHistory'); // 清除损坏的历史数据
    }
  });

  onUnmounted(() => {
    isMounted.value = false;
    controller.value.abort();
  });

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // 添加用户消息
    const userMsg = { content: message, isUser: true };
    if (isMounted.value) {
      messages.value.push(userMsg);
    }

    // 保存消息到本地存储
    localStorage.setItem('chatHistory', JSON.stringify(messages.value.map(msg => ({...msg}))));

    controller.value = new AbortController();
    try {
      // 创建空的AI消息
      const aiMsg = reactive({ content: '', isUser: false });
      if (isMounted.value) {
        messages.value.push(aiMsg);
      }

      // 调用AI API并传入流式回调和中止信号
      await sendMessageToAI(userMsg.content, (chunk) => {
        if (isMounted.value) {
          aiMsg.content += chunk;
        }
      }, controller.value.signal);

      // 保存完整历史
      localStorage.setItem('chatHistory', JSON.stringify(messages.value.map(msg => ({...msg}))));
    } catch (error) {
      if (error.name !== 'AbortError') {
        // 更新AI消息为错误内容
        aiMsg.content = error.message || '请求失败，请检查API密钥或网络连接';
      } else if (isMounted.value) {
        // 请求中止时移除未完成的AI消息
        messages.value.pop();
      }
    }
  };

  return { handleSendMessage, messages, isMounted };
}