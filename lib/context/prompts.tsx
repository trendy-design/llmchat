"use client";
import { CreatePrompt } from "@/components/prompts/create-prompt";
import { PromptLibrary } from "@/components/prompts/prompt-library";
import { TPrompt } from "@/lib/types";
import { Dialog, DialogContent } from "@/ui";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { usePromptsQueries } from "../services/prompts";
import { useChatContext } from "./chat";

export type TPromptsContext = {
  open: (create?: boolean) => void;
  dismiss: () => void;
  allPrompts: TPrompt[];
};
export const PromptsContext = createContext<undefined | TPromptsContext>(
  undefined,
);

export const usePromptsContext = () => {
  const context = useContext(PromptsContext);
  if (context === undefined) {
    throw new Error("usePrompts must be used within a PromptssProvider");
  }
  return context;
};

export type TPromptsProvider = {
  children: React.ReactNode;
};

export type TPromptMenuItem = {
  name: string;
  key: string;
  icon: () => React.ReactNode;
  component: React.ReactNode;
};
export const PromptsProvider = ({ children }: TPromptsProvider) => {
  const [isPromptOpen, setIsPromptOpen] = useState(false);
  const [showCreatePrompt, setShowCreatePrompt] = useState(false);
  const [editablePrompt, setEditablePrompt] = useState<TPrompt | undefined>(
    undefined,
  );
  const {
    promptsQuery,
    createPromptMutation,
    deletePromptMutation,
    updatePromptMutation,
  } = usePromptsQueries();
  const { store } = useChatContext();
  const editor = store((state) => state.editor);

  const open = (create?: boolean) => {
    if (create) {
      setShowCreatePrompt(true);
    }
    setIsPromptOpen(true);
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "P" && e.ctrlKey) {
        e.preventDefault();
        setIsPromptOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const dismiss = () => setIsPromptOpen(false);

  const localPromptsQuery = promptsQuery;

  const publicPromptsQuery = useQuery<{ prompts: TPrompt[] }>({
    queryKey: ["Prompts"],
    queryFn: async () => axios.get("/api/prompts").then((res) => res.data),
  });

  const allPrompts = [
    ...(localPromptsQuery.data || []),
    ...(publicPromptsQuery.data?.prompts || []),
  ];

  return (
    <PromptsContext.Provider value={{ open, dismiss, allPrompts }}>
      {children}

      <Dialog open={isPromptOpen} onOpenChange={setIsPromptOpen}>
        <DialogContent
          className="flex max-h-[80dvh] w-[96dvw] flex-col gap-0 overflow-hidden rounded-lg border border-white/5 p-0 md:max-h-[600px] md:w-[600px]"
          ariaTitle="Prompt Library"
        >
          {showCreatePrompt ? (
            <CreatePrompt
              prompt={editablePrompt}
              open={showCreatePrompt}
              onOpenChange={(isOpen) => {
                setShowCreatePrompt(isOpen);
              }}
              onCreatePrompt={(prompt) => {
                createPromptMutation.mutate(prompt);
              }}
              onUpdatePrompt={(prompt) => {
                editablePrompt?.id &&
                  updatePromptMutation.mutate({
                    id: editablePrompt?.id,
                    prompt,
                  });
              }}
            />
          ) : (
            <PromptLibrary
              onPromptSelect={(prompt) => {
                editor?.commands?.clearContent();
                editor?.commands?.setContent(prompt.content);
                editor?.commands?.focus("end");
                dismiss();
              }}
              onEdit={(prompt) => {
                setEditablePrompt(prompt);
                setShowCreatePrompt(true);
              }}
              onDelete={(prompt) => deletePromptMutation.mutate(prompt.id)}
              localPrompts={localPromptsQuery.data || []}
              publicPrompts={publicPromptsQuery.data?.prompts || []}
              onCreate={() => setShowCreatePrompt(true)}
            />
          )}
        </DialogContent>
      </Dialog>
    </PromptsContext.Provider>
  );
};
