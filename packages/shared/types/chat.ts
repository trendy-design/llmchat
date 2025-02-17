import { useEditor } from '@tiptap/react';

export type TChatState = {
  isGenerating: boolean;
  editor?: ReturnType<typeof useEditor>;
  context?: string;
  setEditor: (editor: ReturnType<typeof useEditor>) => void;
  setContext: (context: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  abortController?: AbortController;
  setAbortController: (abortController: AbortController) => void;
  stopGeneration: () => void;
};
