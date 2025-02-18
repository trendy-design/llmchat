import { Block, useChatStore } from '@/libs/store/chat.store';
import type { CompletionRequestType } from '@repo/ai';
import { useEffect, useState } from 'react';

export const useAgentStream = () => {
  const updateThreadItem = useChatStore((state) => state.updateThreadItem);
  const [pendingUpdate, setPendingUpdate] = useState<{
    threadItemId: string;
    parentThreadItemId?: string;
    threadId: string;
    content: Block[];
    status?: 'pending' | 'completed' | 'error';
    updatedAt?: Date;
  } | null>(null);

  useEffect(() => {
    if (!pendingUpdate) return;

    const timeoutId = setTimeout(() => {
      updateThreadItem({
        id: pendingUpdate.threadItemId,
        role: 'assistant' as const,
        content: pendingUpdate.content,
        status: pendingUpdate.status,
        parentId: pendingUpdate.parentThreadItemId,
        threadId: pendingUpdate.threadId,
        updatedAt: pendingUpdate.updatedAt,
      });
      setPendingUpdate(null);
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [pendingUpdate, updateThreadItem]);

  const runAgent = async (body: CompletionRequestType) => {
    const nodes = new Map<string, Block>();

    const response = await fetch('/agent2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body),
      credentials: 'include',
      cache: 'no-store'
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
              nodes.set(data.nodeId, {
                id: data.nodeId,
                nodeKey: data.nodeKey,
                content: data.content,
                toolCalls: data.toolCalls,
                toolCallResults: data.toolCallResults,
                nodeStatus: data.nodeStatus,
                tokenUsage: data.tokenUsage,
                nodeInput: data.nodeInput,
                nodeModel: data.nodeModel,
                nodeReasoning: data.nodeReasoning 
              });
              setPendingUpdate({
                threadItemId: data.threadItemId,
                parentThreadItemId: data.parentThreadItemId,
                threadId: data.threadId,
                content: Array.from(nodes.values()),
                status: data.status as 'pending' | 'completed' | 'error',
                updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined
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
