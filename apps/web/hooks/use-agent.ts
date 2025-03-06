import { Block, useChatStore } from '@/libs/store/chat.store';
import type { CompletionRequestType } from '@repo/ai';

export const useAgentStream = () => {
  const updateThreadItem = useChatStore(state => state.updateThreadItem);
  const chatMode = useChatStore(state => state.chatMode);

  const runAgent = async (body: CompletionRequestType) => {
    const nodes = new Map<string, Block>();
    const contentBuffer = new Map<string, string>();

    const modeEndpoint = chatMode === 'deep' ? '/deep' : chatMode === 'gpt-4o-mini' ? '/completion' : '/fast';
    
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

              if (data.type === "event") {
                updateEvent(data, nodes, contentBuffer);
              } else if (data.type === "context") {
                updateContext(data);
              }
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

  const updateEvent = (data: any, nodes: Map<string, Block>, contentBuffer: Map<string, string>) => {
    if (!!data.nodeId) {
      const existingNode = nodes.get(data.nodeId);
      if (!existingNode) {
        contentBuffer.clear();
      }
      
      const existingContent = contentBuffer.get(data.nodeId) || '';
      const mergedContent = existingContent + (data.chunk || '');
      contentBuffer.set(data.nodeId, mergedContent);

      console.log("chunkType",  data.chunkType)

      if (data.chunkType === "text") {
        nodes.set(data.nodeId, {
          ...data,
          content: mergedContent,
        });
      } 
      else if (data.chunkType === "object") {
        try {
          const object = JSON.parse(data.chunk);
          nodes.set(data.nodeId, {
            ...data,
            object: object,
          });
        } catch (e) {
          console.error('Error parsing object:', e, 'Content:', mergedContent);
        }
      }
      else if (data.chunkType === "reasoning") {
        nodes.set(data.nodeId, {
          ...data,
          nodeReasoning: mergedContent,
        });
      }
    }
    updateThreadItem({
      id: data.threadItemId,
      parentId: data.parentThreadItemId,
      threadId: data.threadId,
      content: Array.from(nodes.values()),
      status: data.status as 'pending' | 'completed' | 'error',
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    });
  }

  const updateContext = (data: any) => {
    console.log("updateContext", data)
    updateThreadItem({
      id: data.threadItemId,
      parentId: data.parentThreadItemId,
      threadId: data.threadId,
      metadata: data.context
    });
  }

  return { runAgent };
};
