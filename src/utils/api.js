export const sendMessageToAI = async (message, onChunk, signal) => {
  const apiKey = localStorage.getItem('apiKey');
  if (!apiKey) {
    throw new Error('未设置API密钥，请在设置中配置');
  }

  // 获取用户选择的模型，默认为 deepseek-chat
  const selectedModel = localStorage.getItem('selectedModel') || 'deepseek-chat';

  try {
    const response = await fetch('/api/v1/chat/completions', {
      signal,

      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        model: selectedModel,
        messages: [{ role: 'user', content: message }],
        stream: true
      })
    });

    if (!response.ok) {
      const errorDetails = await response.text();
      console.error(`API错误: ${response.status} - ${errorDetails}`);
      throw new Error(`HTTP错误! status: ${response.status}, 详情: ${errorDetails}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';
    let buffer = '';

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
            const content = json.choices[0]?.delta?.content || '';
            if (content && !signal.aborted) {
              fullContent += content;
              onChunk(content); // 实时推送内容块
            }
          } catch (e) {
            console.error('解析SSE数据失败:', e, '数据:', data);
          }
        }
      }
    }

    return fullContent;
  } catch (error) {
    console.error('API请求错误:', error);
    throw new Error(error.response?.data?.error?.message || '请求失败，请检查API密钥或网络连接');
  }
};

// 添加可用模型列表
export const availableModels = [
  { value: 'deepseek-chat', label: 'DeepSeek Chat' },
  { value: 'deepseek-coder', label: 'DeepSeek Coder' },
  { value: 'deepseek-lite', label: 'DeepSeek Lite' }
];