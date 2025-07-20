import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import { sendMessageToAI, availableModels } from '@/utils/api';
import { ElMessage } from 'element-plus';
import { v4 as uuidv4 } from 'uuid';
import { 
  initDb, 
  saveChatSession, 
  saveMessage,
  updateMessage, 
  getAllChatSessions, 
  getMessagesForChat,
  deleteChatSession
} from '@/utils/db';

export function useMessageHandler() {
  // 所有聊天会话
  const chatSessions = ref([]);
  // 当前活动的聊天会话ID
  const currentChatId = ref('');
  
  const isMounted = ref(true);
  const controller = ref(new AbortController());
  const currentModel = ref('');
  // 数据库加载状态
  const isDbReady = ref(false);

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
  const createNewChat = async () => {
    const newChatId = uuidv4();
    const newChat = {
      id: newChatId,
      title: '新的聊天', // 默认标题
      messages: [],
      createdAt: Date.now(),
      lastUpdated: Date.now()
    };
    
    chatSessions.value.unshift(newChat); // 添加到列表开头
    currentChatId.value = newChatId; // 切换到新会话
    
    // 保存会话到SQLite数据库
    try {
      await saveChatSession(newChat);
    } catch (error) {
      console.error('创建新聊天会话失败:', error);
      ElMessage.error('创建新聊天失败');
    }
    
    return newChatId;
  };

  // 选择聊天会话
  const selectChat = async (chatId) => {
    // 如果已经是当前会话，不做任何操作
    if (currentChatId.value === chatId) return;
    
    currentChatId.value = chatId;
    
    // 如果该会话还没有加载消息，从数据库加载
    const currentChat = chatSessions.value.find(chat => chat.id === chatId);
    if (currentChat && (!currentChat.messages || currentChat.messages.length === 0)) {
      try {
        const messages = await getMessagesForChat(chatId);
        currentChat.messages = messages;
      } catch (error) {
        console.error('加载会话消息失败:', error);
        ElMessage.error('加载聊天记录失败');
      }
    }
  };
  
  // 删除聊天会话
  const deleteChat = async (chatId) => {
    const index = chatSessions.value.findIndex(chat => chat.id === chatId);
    
    if (index !== -1) {
      // 从列表中移除
      chatSessions.value.splice(index, 1);
      
      // 从数据库中删除
      try {
        await deleteChatSession(chatId);
      } catch (error) {
        console.error('删除聊天会话失败:', error);
        ElMessage.error('删除聊天记录失败');
        return;
      }
      
      // 如果删除的是当前选中的会话
      if (currentChatId.value === chatId) {
        // 如果还有其他会话，选择第一个
        if (chatSessions.value.length > 0) {
          await selectChat(chatSessions.value[0].id);
        } else {
          // 如果没有其他会话，创建一个新的
          await createNewChat();
        }
      }
      
      // 提示删除成功
      ElMessage.success('聊天记录已删除');
    }
  };

  // 添加重命名聊天函数
  const renameChat = async (data) => {
    const { id, title } = data;
    const chat = chatSessions.value.find(chat => chat.id === id);
    
    if (chat && title.trim()) {
      // 更新标题
      chat.title = title.trim();
      chat.lastUpdated = Date.now();
      
      // 保存到数据库
      try {
        await saveChatSession(chat);
      } catch (error) {
        console.error('重命名聊天会话失败:', error);
        ElMessage.error('重命名聊天记录失败');
        return;
      }
      
      // 提示重命名成功
      ElMessage.success('聊天记录已重命名');
    }
  };

  // 更新会话标题（根据第一条消息内容）
  const updateChatTitle = async (chatId, message) => {
    const chat = chatSessions.value.find(chat => chat.id === chatId);
    if (chat) {
      // 使用用户第一条消息的前15个字符作为标题
      if (chat.title === '新的聊天' && message.isUser) {
        const title = message.content.substring(0, 15);
        chat.title = title + (title.length >= 15 ? '...' : '');
      }
      
      // 更新时间戳
      chat.lastUpdated = Date.now();
      
      // 保存到数据库
      try {
        await saveChatSession(chat);
      } catch (error) {
        console.error('更新聊天标题失败:', error);
      }
    }
  };

  onMounted(async () => {
    try {
      // 初始化数据库
      await initDb();
      isDbReady.value = true;

      // 加载所有聊天会话
      chatSessions.value = await getAllChatSessions();
      
      // 如果有会话，选择最近更新的一个
      if (chatSessions.value.length > 0) {
        // 会话已经按最后更新时间排序
        await selectChat(chatSessions.value[0].id);
      } else {
        // 没有会话就创建一个新的
        await createNewChat();
      }
    } catch (error) {
      console.error('初始化失败:', error);
      ElMessage.error('加载聊天记录失败');
      isDbReady.value = false;
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
  const handleModelChange = async (modelId) => {
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
        
        // 保存到数据库
        try {
          await saveChatSession(currentChat);
          await saveMessage(currentChatId.value, systemMsg);
        } catch (error) {
          console.error('保存系统消息失败:', error);
        }
      }
    }
  };

  const handleSendMessage = async (message) => {
    if (!message.trim() || !isDbReady.value) return;

    // 更新当前模型信息
    updateCurrentModel();
    
    // 如果没有当前会话ID或者会话不存在，创建一个新的
    if (!currentChatId.value || !chatSessions.value.find(chat => chat.id === currentChatId.value)) {
      await createNewChat();
    }
    
    // 找到当前会话
    const currentChat = chatSessions.value.find(chat => chat.id === currentChatId.value);
    if (!currentChat) return;
    
    // 添加用户消息
    const userMsg = { content: message, isUser: true };
    if (isMounted.value) {
      currentChat.messages.push(userMsg);
      
      // 更新会话标题（如果是第一条消息）
      await updateChatTitle(currentChatId.value, userMsg);
    }

    // 保存消息到数据库
    try {
      await saveMessage(currentChatId.value, userMsg);
    } catch (error) {
      console.error('保存用户消息失败:', error);
    }

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
        
        // 保存AI消息到数据库
        try {
          await saveMessage(currentChatId.value, aiMsg);
          await saveChatSession(currentChat);
        } catch (error) {
          console.error('保存AI消息失败:', error);
        }
      }

      // 调用AI API并传入流式回调和中止信号
      const result = await sendMessageToAI(userMsg.content, async (chunk) => {
        if (isMounted.value) {
          const messageIndex = currentChat.messages.length - 1; // AI消息的索引
          const updates = {};
          
          if (isReasoningModel) {
            // 处理推理模型的响应
            if (chunk.type === 'reasoning') {
              // 思考过程内容
              aiMsg.reasoningContent += chunk.content;
              updates.reasoningContent = aiMsg.reasoningContent;
            } else if (chunk.type === 'content') {
              // 实时显示最终回答内容
              aiMsg.tempContent += chunk.content;
              aiMsg.content = aiMsg.tempContent; // 更新完整内容
              updates.content = aiMsg.content;
            } else if (chunk.type === 'content_started') {
              // 标记已开始接收答案内容
              aiMsg.contentStarted = true;
            } else if (chunk.type === 'reasoning_complete') {
              // 标记思考过程已完成
              aiMsg.reasoningComplete = true;
              updates.reasoningComplete = true;
            }
          } else {
            // 处理普通模型的响应
            aiMsg.content += chunk.content;
            updates.content = aiMsg.content;
          }
          
          // 每收到一定量的新内容就更新数据库
          // 为了性能，可以考虑节流更新频率，比如每200ms或者每10个字符更新一次
          try {
            await updateMessage(currentChatId.value, messageIndex, updates);
          } catch (error) {
            console.error('更新AI消息失败:', error);
          }
        }
      }, controller.value.signal);

      // 最终处理，确保设置了reasoningComplete和保存最终内容
      if (isReasoningModel && isMounted.value) {
        // 标记思考过程完成
        aiMsg.reasoningComplete = true;
        // 确保将临时存储的内容全部转移到最终内容
        aiMsg.content = aiMsg.tempContent;
        
        // 更新数据库
        try {
          await updateMessage(currentChatId.value, currentChat.messages.length - 1, {
            reasoningComplete: true,
            content: aiMsg.content
          });
        } catch (error) {
          console.error('更新思考完成状态失败:', error);
        }
      }

      // 更新会话的最后更新时间并保存
      if (currentChat) {
        currentChat.lastUpdated = Date.now();
        try {
          await saveChatSession(currentChat);
        } catch (error) {
          console.error('更新会话时间失败:', error);
        }
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // 更新AI消息为错误内容
        const currentChat = chatSessions.value.find(chat => chat.id === currentChatId.value);
        if (currentChat && currentChat.messages.length > 0) {
          const aiMsg = currentChat.messages[currentChat.messages.length - 1];
          if (!aiMsg.isUser) {
            const errorMsg = `错误: ${error.message || '请求失败，请检查API密钥或网络连接'}`;
            if (aiMsg.isReasoningModel) {
              aiMsg.content = errorMsg;
            } else {
              aiMsg.content = errorMsg;
            }
            
            // 更新数据库中的错误消息
            try {
              await updateMessage(currentChatId.value, currentChat.messages.length - 1, {
                content: errorMsg
              });
            } catch (updateError) {
              console.error('更新错误消息失败:', updateError);
            }
          }
        }
      } else if (isMounted.value) {
        // 请求中止时移除未完成的AI消息
        const currentChat = chatSessions.value.find(chat => chat.id === currentChatId.value);
        if (currentChat && currentChat.messages.length > 0 && !currentChat.messages[currentChat.messages.length - 1].isUser) {
          const messageIndex = currentChat.messages.length - 1;
          currentChat.messages.pop();
          
          // 从数据库中删除这条未完成的消息
          try {
            // 注意：这里应该新增一个deleteChatMessage函数，目前暂未实现
            // 可以通过将内容设为"已取消"来标记，而不是直接删除
            await updateMessage(currentChatId.value, messageIndex, {
              content: "用户已取消请求"
            });
          } catch (error) {
            console.error('删除未完成消息失败:', error);
          }
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
    selectChat,
    deleteChat,
    renameChat,
    isDbReady
  };
}