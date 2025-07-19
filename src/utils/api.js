export const sendMessageToAI = async (message, onChunk, signal) => {
  const apiKey = localStorage.getItem('apiKey');
  if (!apiKey) {
    throw new Error('未设置API密钥，请在设置中配置');
  }

  // 获取用户选择的模型，默认为 deepseek-chat
  const selectedModel = localStorage.getItem('selectedModel') || 'deepseek-chat';

  // 准备请求体
  const requestBody = {
    model: selectedModel,
    messages: [{ role: 'user', content: message }],
    stream: true
  };
  
  // 设置最大token (对于推理模型，默认最大32K，最大可设置64K)
  if (selectedModel === 'deepseek-reasoner') {
    requestBody.max_tokens = 32000; // 根据需要设置
  }

  try {
    const response = await fetch('/api/v1/chat/completions', {
      signal,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error(`API错误: ${response.status} - ${errorDetails}`);
      throw new Error(`HTTP错误! status: ${response.status}, 详情: ${errorDetails}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let reasoningContent = '';
    let finalContent = '';
    let buffer = '';
    
    // 推理模型的流程状态
    let reasoningPhaseComplete = false;
    let contentPhaseStarted = false;
    
    while (true) {
      const { done, value } = await reader.read();
      if (done || signal.aborted) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      console.log('Received SSE lines:', lines);
      buffer = lines.pop() || ''; // 保留不完整的行

      for (const line of lines) {
        if (line.startsWith('data:')) {
          const data = line.slice(5).trim();
          if (data === '[DONE]') break;

          if (signal.aborted) break;
          try {
            const json = JSON.parse(data);
            
            // 处理 deepseek-reasoner 模型
            if (selectedModel === 'deepseek-reasoner') {
              // 处理思维链内容 - 官方API中的reasoning_content字段
              if (json.choices[0]?.delta?.reasoning_content !== undefined) {
                const chunk = json.choices[0].delta.reasoning_content || '';
                reasoningContent += chunk;
                onChunk({
                  type: 'reasoning',
                  content: chunk
                });
              }
              
              // 处理最终答案内容 - 官方API中的content字段
              if (json.choices[0]?.delta?.content !== undefined) {
                // 如果这是首次收到content内容，标记思考阶段结束
                if (!contentPhaseStarted) {
                  contentPhaseStarted = true;
                  reasoningPhaseComplete = true;
                  
                  // 发送思考阶段完成的事件
                  onChunk({
                    type: 'reasoning_complete',
                    content: ''
                  });
                }
                
                const chunk = json.choices[0].delta.content || '';
                finalContent += chunk;
                onChunk({
                  type: 'content',
                  content: chunk
                });
              }
            } else {
              // 处理普通模型
              const content = json.choices[0]?.delta?.content || '';
              if (content) {
                finalContent += content;
                onChunk({
                  type: 'content',
                  content
                });
              }
            }
          } catch (e) {
            console.error('解析SSE数据失败:', e, '数据:', data);
          }
        }
      }
    }

    // 如果还没有触发思考阶段完成事件，在结束时触发
    if (selectedModel === 'deepseek-reasoner' && !reasoningPhaseComplete) {
      onChunk({
        type: 'reasoning_complete',
        content: ''
      });
    }

    // 返回最终内容
    return {
      reasoning: reasoningContent,
      content: finalContent,
      reasoningComplete: true
    };
  } catch (error) {
    console.error('API请求错误:', error);
    throw new Error(error.response?.data?.error?.message || '请求失败，请检查API密钥或网络连接');
  }
};

// 添加可用模型列表
export const availableModels = [
  { value: 'deepseek-chat', label: 'DeepSeek Chat' },
  { value: 'deepseek-coder', label: 'DeepSeek Coder' },
  { value: 'deepseek-lite', label: 'DeepSeek Lite' },
  { value: 'deepseek-reasoner', label: 'DeepSeek Reasoner (带思考链)' }
];