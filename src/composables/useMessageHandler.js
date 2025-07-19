import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { sendMessageToAI, availableModels } from '../utils/api';
import { ElMessage } from 'element-plus';
import { v4 as uuidv4 } from 'uuid';

export function useMessageHandler() {
  // 所有聊天会话
  const chatSessions = ref([]);
  // 当前活动的聊天会话ID
  const currentChatId = ref('');
  
  const isMounted = ref(true);
  const controller = ref(new AbortController());
  const currentModel = ref('');

  // 获取当前聊天会话的消息
  const messages = computed(() => {
    const currentChat = chatSessions.value.find(chat => chat.id === currentChatId.value);
    return currentChat ? currentChat.messages : [];
  });

  // 获取模型显示名称的函数
  const getModelDisplayName = (modelId) => {
    const model = availableModels.find(m => m.value === modelId);
    return model ? model.label : modelId;
  };

  // 创建新的聊天会话
  const createNewChat = () => {
    const newChatId = uuidv4();
    const newChat = {
      id: newChatId,
      title: '新的聊天',
      messages: [],
      createdAt: Date.now(),
      lastUpdated: Date.now()
    };
    
    chatSessions.value.unshift(newChat); // 添加到列表开头
    currentChatId.value = newChatId; // 切换到新会话
    
    // 保存会话列表
    saveChatSessions();
    
    return newChatId;
  };

  // 选择聊天会话
  const selectChat = (chatId) => {
    currentChatId.value = chatId;
  };

  // 保存所有聊天会话
  const saveChatSessions = () => {
    localStorage.setItem('chatSessions', JSON.stringify(chatSessions.value));
  };

  // 更新会话标题（根据第一条消息内容）
  const updateChatTitle = (chatId, message) => {
    const chat = chatSessions.value.find(chat => chat.id === chatId);
    if (chat) {
      // 使用用户第一条消息的前15个字符作为标题
      if (chat.title === '新的聊天' && message.isUser) {
        const title = message.content.substring(0, 15);
        chat.title = title + (title.length >= 15 ? '...' : '');
      }
      
      // 更新时间戳
      chat.lastUpdated = Date.now();
      
      // 保存会话列表
      saveChatSessions();
    }
  };

  onMounted(() => {
    // 加载会话列表
    try {
      const savedSessions = localStorage.getItem('chatSessions');
      if (savedSessions) {
        chatSessions.value = JSON.parse(savedSessions);
        
        // 确保加载的历史消息能正确显示思考过程
        chatSessions.value.forEach(chat => {
          chat.messages = chat.messages.map(msg => {
            // 对于带有思考过程的消息，确保设置正确的标志位
            if (msg.reasoningContent && msg.isReasoningModel) {
              return {
                ...msg,
                reasoningComplete: true // 确保历史记录中的消息显示为思考完成状态
              };
            }
            return msg;
          });
        });
        
        // 如果有会话，选择最近更新的一个
        if (chatSessions.value.length > 0) {
          // 按最后更新时间排序
          chatSessions.value.sort((a, b) => b.lastUpdated - a.lastUpdated);
          currentChatId.value = chatSessions.value[0].id;
        } else {
          // 没有会话就创建一个新的
          createNewChat();
        }
      } else {
        // 没有保存的会话，创建新会话
        createNewChat();
      }
    } catch (error) {
      console.error('Failed to parse chat sessions:', error);
      localStorage.removeItem('chatSessions'); // 清除损坏的数据
      createNewChat(); // 创建新会话
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
    if (isMounted.value && currentChatId.value) {
      const systemMsg = { 
        content: `*系统: 已切换到 ${currentModel.value} 模型*`, 
        isUser: false,
        isSystem: true
      };
      
      // 找到当前会话并添加消息
      const currentChat = chatSessions.value.find(chat => chat.id === currentChatId.value);
      if (currentChat) {
        currentChat.messages.push(systemMsg);
        currentChat.lastUpdated = Date.now();
        
        // 保存会话
        saveChatSessions();
      }
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // 更新当前模型信息
    updateCurrentModel();
    
    // 如果没有当前会话ID或者会话不存在，创建一个新的
    if (!currentChatId.value || !chatSessions.value.find(chat => chat.id === currentChatId.value)) {
      createNewChat();
    }
    
    // 找到当前会话
    const currentChat = chatSessions.value.find(chat => chat.id === currentChatId.value);
    if (!currentChat) return;
    
    // 添加用户消息
    const userMsg = { content: message, isUser: true };
    if (isMounted.value) {
      currentChat.messages.push(userMsg);
      
      // 更新会话标题（如果是第一条消息）
      updateChatTitle(currentChatId.value, userMsg);
    }

    // 保存消息到本地存储
    saveChatSessions();

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
        currentChat.messages.push(aiMsg);
        currentChat.lastUpdated = Date.now();
        saveChatSessions();
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
          
          // 每收到新内容就保存
          saveChatSessions();
        }
      }, controller.value.signal);

      // 最终处理，确保设置了reasoningComplete和保存最终内容
      if (isReasoningModel && isMounted.value) {
        // 标记思考过程完成
        aiMsg.reasoningComplete = true;
        // 确保将临时存储的内容全部转移到最终内容，用于保存
        aiMsg.content = aiMsg.tempContent;
      }

      // 更新会话的最后更新时间并保存
      if (currentChat) {
        currentChat.lastUpdated = Date.now();
        saveChatSessions();
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // 更新AI消息为错误内容
        const currentChat = chatSessions.value.find(chat => chat.id === currentChatId.value);
        if (currentChat && currentChat.messages.length > 0) {
          const aiMsg = currentChat.messages[currentChat.messages.length - 1];
          if (!aiMsg.isUser) {
            if (aiMsg.isReasoningModel) {
              aiMsg.content = `错误: ${error.message || '请求失败，请检查API密钥或网络连接'}`;
            } else {
              aiMsg.content = `错误: ${error.message || '请求失败，请检查API密钥或网络连接'}`;
            }
            saveChatSessions();
          }
        }
      } else if (isMounted.value) {
        // 请求中止时移除未完成的AI消息
        const currentChat = chatSessions.value.find(chat => chat.id === currentChatId.value);
        if (currentChat && currentChat.messages.length > 0 && !currentChat.messages[currentChat.messages.length - 1].isUser) {
          currentChat.messages.pop();
          saveChatSessions();
        }
      }
    }
  };

  return { 
    handleSendMessage, 
    handleModelChange, 
    messages, 
    isMounted, 
    currentModel,
    chatSessions,
    currentChatId,
    createNewChat,
    selectChat
  };
}