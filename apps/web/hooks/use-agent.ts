import { Block, useChatStore } from '@/libs/store/chat.store';
import type { CompletionRequestType } from '@repo/ai';

export const useAgentStream = () => {
  const updateThreadItem = useChatStore(state => state.updateThreadItem);
  const chatMode = useChatStore(state => state.chatMode);

  const runAgent = async (body: CompletionRequestType) => {
    const nodes = new Map<string, Block>();
    const contentBuffer = new Map<string, string>();

    const modeEndpoint = chatMode === 'deep' ? '/deep' : '/fast';
    
    const response = await fetch(`${modeEndpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body received');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.trim() === '') continue;
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (!!data.nodeId) {
                const existingNode = nodes.get(data.nodeId);
                if (!existingNode) {
                  contentBuffer.clear();
                }
                
                const existingContent = contentBuffer.get(data.nodeId) || '';
                const mergedContent = existingContent + (data.content || '');
                contentBuffer.set(data.nodeId, mergedContent);

                nodes.set(data.nodeId, {
                  ...data,
                  content: mergedContent,
                });
              }
              updateThreadItem({
                id: data.threadItemId,
                parentId: data.parentThreadItemId,
                threadId: data.threadId,
                content: Array.from(nodes.values()),
                status: data.status as 'pending' | 'completed' | 'error',
                updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
              });
            } catch (e) {
              console.error('Error parsing SSE data:', e, 'Line:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  return { runAgent };
};
