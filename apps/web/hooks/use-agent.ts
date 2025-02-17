import { Block, useChatStore } from '@/libs/store/chat.store';
import type { CompletionRequestType } from '@repo/ai';



export const useAgentStream = () => {
  const updateThreadItem = useChatStore((state) => state.updateThreadItem);

  const runAgent = async (
    body: CompletionRequestType,
  ) => {

    const response = await fetch('/agent', {
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

    const nodes = new Map<string, Block>();

    try {
      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value);

        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim() === '') continue;

          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));

              console.log('data', data);
              nodes.set(data?.nodeId, {
                id: data?.nodeId,
                nodeKey: data?.nodeKey,
                content: data?.content,
                toolCalls: data?.toolCalls,
                toolCallResults: data?.toolCallResults,
                nodeStatus: data?.nodeStatus,
                tokenUsage: data?.tokenUsage,
                nodeInput: data?.nodeInput,
                nodeModel: data?.nodeModel,
              });
              updateThreadItem({
                id: data.threadItemId,
                role: "assistant" as const,
                content: Array.from(nodes?.values()),
                status: data?.status,
                parentId: data?.parentThreadItemId,
                threadId: data?.threadId,
                updatedAt: data?.updatedAt,
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
