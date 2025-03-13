import { CompletionRequestType } from '@/app/completion/route';
import { Goal, Step, useChatStore } from '@/libs/store/chat.store';

export const useAgentStream = () => {
  const updateThreadItem = useChatStore(state => state.updateThreadItem);
  const setIsGenerating = useChatStore(state => state.setIsGenerating);
  const setAbortController = useChatStore(state => state.setAbortController);

  const runAgent = async (body: CompletionRequestType) => {

    const abortController = new AbortController();
    setAbortController(abortController);
    if(!abortController) {
      return
    }
    setIsGenerating(true);
  
    const response = await fetch(`/completion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      credentials: 'include',
      cache: 'no-store',
      signal: abortController?.signal,
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

              if (data.type === "message") {

                console.log("data", data)
                // Convert goals and steps from objects to arrays for the store
                const goalsArray = data.goals ? Object.values(data.goals) : [];
                const stepsArray = data.steps ? Object.values(data.steps) : [];
                
                updateThreadItem({
                  id: data?.threadItemId,
                  parentId: data?.parentThreadItemId,
                  threadId: data?.threadId,
                  goals: goalsArray as Goal[],
                  steps: stepsArray as Step[],
                  answer: data?.answer,
                  final: data?.final,
                  status: data?.status,
                  query: data?.query
                });
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e, 'Line:', line);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
      setIsGenerating(false);
    }
  };


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
