import { CompletionRequestType } from '@/app/completion/route';
import { ApiKeys, useApiKeysStore } from '@/libs/store/api-keys.store';
import { ChatMode, Goal, Step, ThreadItem, useChatStore } from '@/libs/store/chat.store';
import { useMcpToolsStore } from '@/libs/store/mcp-tools.store';
import { useWorkflowWorker } from '@repo/ai/worker';
import { nanoid } from 'nanoid';
import { useParams, useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext } from 'react';

type AgentContextType = {
  runAgent: (body: CompletionRequestType) => Promise<void>;
  handleSubmit: ({ formData, newThreadId, existingThreadItemId, newChatMode, messages }: { formData: FormData, newThreadId?: string, existingThreadItemId?: string, newChatMode?: string, messages?: ThreadItem[] }) => Promise<void>;
  updateContext: (threadId: string, data: any) => void;
};

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export const AgentProvider = ({ children }: { children: ReactNode }) => {
  const { threadId: currentThreadId } = useParams();
  const updateThreadItem = useChatStore(state => state.updateThreadItem);
  const setIsGenerating = useChatStore(state => state.setIsGenerating);
  const setAbortController = useChatStore(state => state.setAbortController);
  const createThreadItem = useChatStore(state => state.createThreadItem);
  const setCurrentThreadItem = useChatStore(state => state.setCurrentThreadItem);
  const setCurrentSources = useChatStore(state => state.setCurrentSources);
  const updateThread = useChatStore(state => state.updateThread);
  const chatMode = useChatStore(state => state.chatMode);
  const getSelectedMCP = useMcpToolsStore(state => state.getSelectedMCP);
  const apiKeys = useApiKeysStore(state => state.getAllKeys);
  const fetchRemainingMessages = useChatStore(state => state.fetchRemainingMessages);

  const router = useRouter();
  const { startWorkflow, abortWorkflow } = useWorkflowWorker((data) => {
    if (data.type === "message" && data?.threadId && data?.threadItemId) {
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
    if (data.type === "done") {
      setIsGenerating(false);
    }
  });

  const runAgent = async (body: CompletionRequestType) => {
    const abortController = new AbortController();
    setAbortController(abortController);
    if (!abortController) {
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

  const handleSubmit = async ({ formData, newThreadId, existingThreadItemId, newChatMode, messages }: { formData: FormData, newThreadId?: string, existingThreadItemId?: string, newChatMode?: string, messages?: ThreadItem[] }) => {
    let threadId = currentThreadId?.toString() || newThreadId;

    if (threadId) {
      console.log("updating thread")
      updateThread({
        id: threadId,
        title: formData.get('query') as string,
      });
    }

    if (!threadId) {
      return;
    }

    console.log("threadId", threadId)

    const optimisticAiThreadItemId = existingThreadItemId ?? nanoid();

    const aiThreadItem: ThreadItem = {
      id: optimisticAiThreadItemId,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'PENDING' as const,
      threadId,
      query: formData.get('query') as string,
      mode: newChatMode ?? chatMode as any,
    };

    createThreadItem(aiThreadItem);
    setCurrentThreadItem(aiThreadItem);
    setIsGenerating(true);
    setCurrentSources([]);


    const localApiKeys = apiKeys();

    const coreMessages =  [
      ...(messages?.flatMap(item => [{
        role: "user" as const,
        content: item.query || ""
      }, {
        role: "assistant" as const,
        content: item.answer?.text || ""
      }]) || []),
      {
        role: "user" as const,
        content: formData.get('query') as string || ""
      }
    ]

    if (hasApiKey(localApiKeys, newChatMode ?? chatMode as any)) {
      startWorkflow({
        mode: newChatMode ?? chatMode as any,
        question: formData.get('query') as string,
        threadId,
        messages: coreMessages,
        mcpConfig: getSelectedMCP(),
        threadItemId: optimisticAiThreadItemId,
        parentThreadItemId: "",
        apiKeys: localApiKeys
      });
    } else {
      runAgent({
        mode: newChatMode ?? chatMode as any,
        prompt: formData.get('query') as string,
        threadId,
        messages: coreMessages,
        mcpConfig: getSelectedMCP(),
        threadItemId: optimisticAiThreadItemId,
        parentThreadItemId: "",
      });
    }

    fetchRemainingMessages();


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

  const value = {
    runAgent,
    handleSubmit,
    updateContext
  }


  return (
    <AgentContext.Provider value={value}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgentStream = (): AgentContextType => {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgentStream must be used within an AgentProvider');
  }
  return context;
};


const hasApiKey = (apiKeys: ApiKeys, chatMode: ChatMode) => {
  switch (chatMode) {
    case ChatMode.O3_Mini:
    case ChatMode.GPT_4o_Mini:
      return !!apiKeys['OPENAI_API_KEY']
    case ChatMode.GEMINI_2_FLASH:
      return !!apiKeys['GEMINI_API_KEY']
    case ChatMode.CLAUDE_3_5_SONNET:
    case ChatMode.CLAUDE_3_7_SONNET:
      return !!apiKeys['ANTHROPIC_API_KEY']
    case ChatMode.DEEPSEEK_R1:
      return !!apiKeys['FIREWORKS_API_KEY']
    default:
      return false;
  }
}
