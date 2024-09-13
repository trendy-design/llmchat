import { TChatState } from "@/lib/types/chat";
import { create } from "zustand";

const initialState = {
  session: undefined,
  messages: [],
  currentMessage: undefined,
  currentTools: [],
  context: undefined,
  editor: undefined,
  isGenerating: false,
  abortController: undefined,
};

export const createChatStore = () =>
  create<TChatState>((set, get) => ({
    ...initialState,
    setSession: (session) => set({ session }),
    setMessages: (messages) => set({ messages }),
    updateCurrentMessage: (message) => {
      const { currentMessage } = get();
      if (currentMessage) {
        const newMessage = { ...currentMessage, ...message };
        set({ currentMessage: { ...currentMessage, ...newMessage } });
      }
    },
    removeLastMessage: () => {
      const { messages } = get();
      set({ messages: messages.slice(0, -1) });
    },
    setTools: (tools) => set({ currentTools: tools }),
    addTool: (tool) => {
      const { currentMessage } = get();
      if (!currentMessage?.id) return;
      const exisitingTool = currentMessage?.tools?.find(
        (t) => t.toolName === tool?.toolName,
      );

      const updatedTools = exisitingTool
        ? currentMessage?.tools?.map((t) =>
            t.toolName === tool.toolName ? { ...t, ...tool } : t,
          )
        : [...(currentMessage?.tools || []), tool];
      set({
        currentMessage: {
          ...currentMessage,
          tools: updatedTools || [],
        },
      });
    },
    setCurrentMessage: (message) => set({ currentMessage: message }),
    setIsGenerating: (isGenerating) => {
      set({ isGenerating });
    },
    setEditor: (editor) => set({ editor }),
    resetState: () =>
      set({
        currentMessage: undefined,
        currentTools: [],
        isGenerating: false,
        context: undefined,
        abortController: undefined,
      }),
    setAbortController: (abortController) => set({ abortController }),
    stopGeneration: () => {
      const { abortController } = get();
      abortController?.abort("cancel");
    },
    addMessage: (message) => {
      const { messages } = get();
      const messageExists = messages.some((m) => m.id === message.id);

      const updatedMessages = messages.map((m) =>
        m.id === message.id ? { ...m, ...message } : m,
      );

      set({
        messages: messageExists ? updatedMessages : [...messages, message],
      });
    },
    setContext: (context) => set({ context }),
  }));
