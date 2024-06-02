"use client";
import { CreatePrompt } from "@/components/prompts/create-prompt";
import { PromptLibrary } from "@/components/prompts/prompt-library";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState } from "react";
import { PromptsContext } from "./context";

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
  const [tab, setTab] = useState<"public" | "local">("public");

  const open = (action?: "public" | "local" | "create") => {
    if (action === "create") {
      setShowCreatePrompt(true);
    } else {
      action && setTab(action);
    }
    setIsPromptOpen(true);
  };

  const dismiss = () => setIsPromptOpen(false);

  return (
    <PromptsContext.Provider value={{ open, dismiss }}>
      {children}

      <Dialog open={isPromptOpen} onOpenChange={setIsPromptOpen}>
        <DialogContent className="w-[96dvw] max-h-[80dvh] rounded-2xl md:min-w-[600px] gap-0 md:max-h-[600px] flex flex-col overflow-hidden border border-white/5 p-0">
          {showCreatePrompt ? (
            <CreatePrompt
              open={showCreatePrompt}
              onOpenChange={(isOpen) => {
                setShowCreatePrompt(isOpen);
                if (!isOpen) {
                  setTab("local");
                }
              }}
            />
          ) : (
            <PromptLibrary
              open={!showCreatePrompt}
              tab={tab}
              onTabChange={setTab}
              onCreate={() => setShowCreatePrompt(true)}
            />
          )}
        </DialogContent>
      </Dialog>
    </PromptsContext.Provider>
  );
};
