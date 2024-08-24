"use client";

import { AssistantModal } from "@/components/assistants/assistant-modal";
import { useAssistantUtils } from "@/lib/hooks";
import { TAssistantsContext, TAssistantsProvider } from "@/lib/types";
import { FC, createContext, useContext, useState } from "react";

export const AssistantsContext = createContext<undefined | TAssistantsContext>(
  undefined,
);

export const AssistantsProvider: FC<TAssistantsProvider> = ({ children }) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const { assistants, getAssistantByKey } = useAssistantUtils();
  const [selectedAssistantKey, setSelectedAssistantKey] = useState<string>("");

  const open = () => {
    setIsAssistantOpen(true);
  };

  const dismiss = () => setIsAssistantOpen(false);

  return (
    <AssistantsContext.Provider
      value={{
        open,
        dismiss,
        assistants,
        selectedAssistant: getAssistantByKey(selectedAssistantKey),
      }}
    >
      {children}
      <AssistantModal
        selectedAssistantKey={selectedAssistantKey}
        onAssistantchange={setSelectedAssistantKey}
        open={isAssistantOpen}
        onOpenChange={setIsAssistantOpen}
      />
    </AssistantsContext.Provider>
  );
};

export const useAssistants = () => {
  const context = useContext(AssistantsContext);
  if (context === undefined) {
    throw new Error("useAssistants must be used within a AssistantssProvider");
  }
  return context;
};
