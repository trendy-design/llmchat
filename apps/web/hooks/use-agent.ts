import { CompletionRequestType } from '@/app/completion/route';
import { useApiKeysStore } from '@/libs/store/api-keys.store';
import { Goal, Step, ThreadItem, useChatStore } from '@/libs/store/chat.store';
import { useMcpToolsStore } from '@/libs/store/mcp-tools.store';
import { useWorkflowWorker } from '@repo/ai/worker';
import { nanoid } from 'nanoid';
import { useParams, useRouter } from 'next/navigation';

export const useAgentStream = () => {
  const { threadId:currentThreadId } = useParams();
  const updateThreadItem = useChatStore(state => state.updateThreadItem);
  const setIsGenerating = useChatStore(state => state.setIsGenerating);
  const setAbortController = useChatStore(state => state.setAbortController);
  const thread = useChatStore(state => state.currentThread);
  const threadItems = useChatStore(state => state.threadItems);
  const createThreadItem = useChatStore(state => state.createThreadItem);
  const setCurrentThreadItem = useChatStore(state => state.setCurrentThreadItem);
  const setCurrentSources = useChatStore(state => state.setCurrentSources);
  const updateThread = useChatStore(state => state.updateThread);
  const createThread = useChatStore(state => state.createThread);
  const chatMode = useChatStore(state => state.chatMode);
  const getSelectedMCP = useMcpToolsStore(state => state.getSelectedMCP);
  const apiKeys = useApiKeysStore(state => state.getAllKeys);

  const router = useRouter();
  const { startWorkflow, abortWorkflow } = useWorkflowWorker((data) => {
    if (data.type === "message" && data?.threadId && data?.threadItemId) {
      // Convert goals and steps from objects to arrays for the store
      const goalsArray = data.goals ? Object.values(data.goals) : [];
      const stepsArray = data.steps ? Object.values(data.steps) : [];
      
      updateThreadItem(data?.threadId, {
        id: data?.threadItemId,
        parentId: data?.parentThreadItemId,
        threadId: data?.threadId,
        goals: goalsArray as Goal[],
        steps: stepsArray as Step[],
        answer: data?.answer,
        final: data?.final,
        status: data?.status,
        query: data?.query,
        reasoning: data?.reasoning,
        toolCalls: data?.toolCalls,
        toolResults: data?.toolResults
      });
    }
    if(data.type === "done") {
      setIsGenerating(false);
    }
  });

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
            console.log("line", line)

            try {
              const data = JSON.parse(line.slice(6));

              if (data.type === "message" && data?.threadId && data?.threadItemId) {

                console.log("reasoning", data.reasoning)
                // Convert goals and steps from objects to arrays for the store
                const goalsArray = data.goals ? Object.values(data.goals) : [];
                const stepsArray = data.steps ? Object.values(data.steps) : [];

                console.log("toolCalls frontend", data?.toolCalls)
                console.log("toolResults frontend", data?.toolResults)
                
                updateThreadItem(data?.threadId, {
                  id: data?.threadItemId,
                  parentId: data?.parentThreadItemId,
                  threadId: data?.threadId,
                  goals: goalsArray as Goal[],
                  steps: stepsArray as Step[],
                  answer: data?.answer,
                  final: data?.final,
                  status: data?.status,
                  query: data?.query,
                  reasoning: data?.reasoning,
                  toolCalls: data?.toolCalls,
                  toolResults: data?.toolResults
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

  const handleSubmit = async (formData: FormData) => {
    let threadId = currentThreadId?.toString();
    const query = formData.get('query') as string;


    if(threadId) {
      updateThread({
        id: threadId,
        title: formData.get('query') as string,
      });
    }

    if(!threadId) {
        const newThread = await createThread({
          title: query
        });
        router.push(`/c/${newThread.id}`);
        threadId = newThread.id;
    }

    if(!threadId) {
      return;
    }

    console.log("threadId", threadId)

    const optimisticUserThreadItemId = nanoid();
    const optimisticAiThreadItemId = nanoid();

    // Clear previous nodes for this thread item




    const aiThreadItem: ThreadItem = {
      id: optimisticAiThreadItemId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'PENDING' as const,
      threadId,
      query: formData.get('query') as string,
    };

    createThreadItem(aiThreadItem);
    setCurrentThreadItem(aiThreadItem);
    setIsGenerating(true);
    setCurrentSources([]);

    console.log("formData", formData)

    startWorkflow({
      mode: chatMode as any,
      question: formData.get('query') as string,
      threadId,
      messages: [...(threadItems?.flatMap(item => [{
        role:"user" as const,
        content: item.query || ""
      },{
        role:"assistant" as const,
        content:item.answer?.text || ""
      }])), {
        role:"user" as const,
        content: formData.get('query') as string || ""
      }],
      mcpConfig: getSelectedMCP(),
      threadItemId: optimisticAiThreadItemId,
      parentThreadItemId: optimisticUserThreadItemId,
      apiKeys: apiKeys()
    });


    // runAgent({
    //   messages: [...(threadItems?.flatMap(item => [{
    //     role:"user" as const,
    //     content: item.query || ""
    //   },{
    //     role:"assistant" as const,
    //     content:item.answer?.text || ""
    //   }])), {
    //     role:"user" as const,
    //     content: formData.get('query') as string || ""
    //   }],
    //   prompt: formData.get('query') as string,
    //   threadId,
    //   threadItemId: optimisticAiThreadItemId,
    //   parentThreadItemId: optimisticUserThreadItemId,
    //   mode: chatMode as any
    // });
  };



  const updateContext = (threadId: string, data: any) => {
    console.log("updateContext", data)
    updateThreadItem(threadId, {
      id: data.threadItemId,
      parentId: data.parentThreadItemId,
      threadId: data.threadId,
      metadata: data.context
    });
  }

  return { runAgent, handleSubmit, updateContext };
};
