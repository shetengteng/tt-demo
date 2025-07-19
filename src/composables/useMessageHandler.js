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
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        
        // 确保加载的历史消息能正确显示思考过程
        messages.value = parsedMessages.map(msg => {
          // 对于带有思考过程的消息，确保设置正确的标志位
          if (msg.reasoningContent && msg.isReasoningModel) {
            return {
              ...msg,
              reasoningComplete: true // 确保历史记录中的消息显示为思考完成状态
            };
          }
          return msg;
        });
      }
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
      // 检查当前模型是否是思维链模型
      const modelId = localStorage.getItem('selectedModel') || 'deepseek-chat';
      const isReasoningModel = modelId === 'deepseek-reasoner';
      
      // 创建响应式消息对象
      let aiMsg;
      
      if (isReasoningModel) {
        // 创建推理模型的消息，包含思考过程和最终答案
        aiMsg = reactive({ 
          reasoningContent: '',  // 思考过程
          reasoningComplete: false, // 标记思考过程是否完成
          tempContent: '',       // 临时存储动态显示的最终答案
          content: '',          // 最终完整答案
          contentStarted: false, // 标记是否开始接收答案内容
          isUser: false,
          model: currentModel.value,
          isReasoningModel: true
        });
      } else {
        // 创建普通模型的消息
        aiMsg = reactive({ 
          content: '', 
          isUser: false,
          model: currentModel.value
        });
      }
      
      if (isMounted.value) {
        messages.value.push(aiMsg);
      }

      // 调用AI API并传入流式回调和中止信号
      const result = await sendMessageToAI(userMsg.content, (chunk) => {
        if (isMounted.value) {
          if (isReasoningModel) {
            // 处理推理模型的响应
            if (chunk.type === 'reasoning') {
              // 思考过程内容
              aiMsg.reasoningContent += chunk.content;
            } else if (chunk.type === 'content') {
              // 实时显示最终回答内容
              aiMsg.tempContent += chunk.content;
            } else if (chunk.type === 'content_started') {
              // 标记已开始接收答案内容
              aiMsg.contentStarted = true;
            } else if (chunk.type === 'reasoning_complete') {
              // 标记思考过程已完成
              aiMsg.reasoningComplete = true;
            }
          } else {
            // 处理普通模型的响应
            aiMsg.content += chunk.content;
          }
        }
      }, controller.value.signal);

      // 最终处理，确保设置了reasoningComplete和保存最终内容
      if (isReasoningModel && isMounted.value) {
        // 标记思考过程完成
        aiMsg.reasoningComplete = true;
        // 确保将临时存储的内容全部转移到最终内容，用于保存
        aiMsg.content = aiMsg.tempContent;
      }

      // 保存完整历史 (包括思考过程)
      const historyMessages = messages.value.map(msg => {
        // 复制消息，保留所有属性，包括思考过程
        if (msg.isReasoningModel) {
          return {
            content: msg.content || msg.tempContent, // 确保保存有内容的字段
            reasoningContent: msg.reasoningContent, // 保存思考过程
            isUser: msg.isUser,
            model: msg.model,
            isReasoningModel: true,
            reasoningComplete: true
          };
        } else {
          return {...msg};
        }
      });
      localStorage.setItem('chatHistory', JSON.stringify(historyMessages));
    } catch (error) {
      if (error.name !== 'AbortError') {
        // 更新AI消息为错误内容
        const aiMsg = messages.value[messages.value.length - 1];
        if (aiMsg.isReasoningModel) {
          aiMsg.content = `错误: ${error.message || '请求失败，请检查API密钥或网络连接'}`;
        } else {
          aiMsg.content = `错误: ${error.message || '请求失败，请检查API密钥或网络连接'}`;
        }
      } else if (isMounted.value) {
        // 请求中止时移除未完成的AI消息
        messages.value.pop();
      }
    }
  };

  return { handleSendMessage, handleModelChange, messages, isMounted, currentModel };
}