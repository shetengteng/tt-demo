import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { sendMessageToAI, availableModels } from '../utils/api';
import { ElMessage } from 'element-plus';

export function useMessageHandler() {
  const messages = ref([]);
  const isMounted = ref(true);
  const controller = ref(new AbortController());
  const currentModel = ref('');

  // 获取模型显示名称的函数
  const getModelDisplayName = (modelId) => {
    const model = availableModels.find(m => m.value === modelId);
    return model ? model.label : modelId;
  };

  onMounted(() => {
    // 加载历史消息
    try {
      const savedMessages = localStorage.getItem('chatHistory');
      if (savedMessages) messages.value = JSON.parse(savedMessages);
    } catch (error) {
      console.error('Failed to parse chat history:', error);
      localStorage.removeItem('chatHistory'); // 清除损坏的历史数据
    }
    
    // 获取当前选择的模型
    updateCurrentModel();
  });

  onUnmounted(() => {
    isMounted.value = false;
    controller.value.abort();
  });
  
  // 更新当前模型
  const updateCurrentModel = () => {
    const modelId = localStorage.getItem('selectedModel') || 'deepseek-chat';
    currentModel.value = getModelDisplayName(modelId);
  };
  
  // 处理模型变更
  const handleModelChange = (modelId) => {
    updateCurrentModel();
    ElMessage.success(`已切换到 ${currentModel.value} 模型`);
    
    // 添加系统消息，表明模型已切换
    if (isMounted.value) {
      const systemMsg = { 
        content: `*系统: 已切换到 ${currentModel.value} 模型*`, 
        isUser: false,
        isSystem: true
      };
      messages.value.push(systemMsg);
      
      // 保存消息历史
      localStorage.setItem('chatHistory', JSON.stringify(messages.value.map(msg => ({...msg}))));
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // 更新当前模型信息
    updateCurrentModel();
    
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
      const aiMsg = reactive({ 
        content: '', 
        isUser: false,
        model: currentModel.value // 添加模型信息
      });
      
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
        const aiMsg = messages.value[messages.value.length - 1];
        aiMsg.content = error.message || '请求失败，请检查API密钥或网络连接';
      } else if (isMounted.value) {
        // 请求中止时移除未完成的AI消息
        messages.value.pop();
      }
    }
  };

  return { handleSendMessage, handleModelChange, messages, isMounted, currentModel };
}