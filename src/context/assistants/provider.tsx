"use client";

import { CreateAssistant } from "@/components/bots/create-bot";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Flex } from "@/components/ui/flex";
import { Type } from "@/components/ui/text";
import { TAssistant, TAssistantType } from "@/hooks/use-chat-session";
import { TModel, useModelList } from "@/hooks/use-model-list";
import { cn } from "@/lib/utils";
import { CommandGroup } from "cmdk";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { usePreferenceContext } from "../preferences/provider";
import { AssistantItem } from "./assistant-item";

export type TAssistantsProvider = {
  children: React.ReactNode;
};

export type TAssistantMenuItem = {
  name: string;
  key: string;
  icon: () => React.ReactNode;
  component: React.ReactNode;
};

export type TAssistantsContext = {
  open: () => void;
  dismiss: () => void;
  assistants: TAssistant[];
  selectedAssistant?: {
    assistant: TAssistant;
    model: TModel;
  };
};
export const AssistantsContext = createContext<undefined | TAssistantsContext>(
  undefined
);

export const useAssistantContext = () => {
  const context = useContext(AssistantsContext);
  if (context === undefined) {
    throw new Error("useAssistants must be used within a AssistantssProvider");
  }
  return context;
};

export const AssistantsProvider = ({ children }: TAssistantsProvider) => {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [openCreateAssistant, setOpenCreateAssistant] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const {
    assistants,
    getAssistantByKey,
    createAssistantMutation,
    updateAssistantMutation,
    deleteAssistantMutation,
  } = useModelList();
  const [updateAssistant, setUpdateAssistant] = useState<TAssistant>();
  const [selectedAssistant, setSelectedAssistant] = useState<string>("");
  const { updatePreferences, preferences } = usePreferenceContext();

  const open = () => {
    setIsAssistantOpen(true);
  };

  useEffect(() => {
    if (isAssistantOpen && searchRef?.current) {
      searchRef?.current?.focus();
    }
  }, [isAssistantOpen]);

  useEffect(() => {
    setSelectedAssistant(preferences.defaultAssistant);
  }, [preferences]);

  const dismiss = () => setIsAssistantOpen(false);

  const renderAssistants = (type: TAssistantType) => {
    return assistants
      ?.filter((a) => a.type === type)
      ?.map((assistant) => {
        return (
          <AssistantItem
            key={assistant.key}
            onDelete={(assistant) => {
              deleteAssistantMutation?.mutate(assistant.key);
            }}
            onEdit={(assistant) => {
              setOpenCreateAssistant(true);
              setUpdateAssistant(assistant);
            }}
            assistant={assistant}
            onSelect={(assistant) => {
              setSelectedAssistant(assistant.key);
              setIsAssistantOpen(false);
            }}
          />
        );
      });
  };

  return (
    <AssistantsContext.Provider
      value={{
        open,
        dismiss,
        assistants,
        selectedAssistant: getAssistantByKey(selectedAssistant),
      }}
    >
      {children}

      <Drawer.Root
        direction="bottom"
        shouldScaleBackground
        open={isAssistantOpen}
        onOpenChange={setIsAssistantOpen}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[400] bg-zinc-500/70 dark:bg-zinc-900/70 backdrop-blur-sm" />
          <Drawer.Content
            className={cn(
              "flex flex-col items-center outline-none max-h-[430px] mt-24 fixed z-[500] md:bottom-4 mx-auto md:left-[50%] left-0 bottom-0 right-0",
              `md:ml-[-200px] md:w-[400px] w-full`
            )}
          >
            <div className="h-1 w-6 flex-shrink-0 rounded-full bg-white/50 mb-2" />

            <Command className="rounded-2xl relative dark:border-white/10 dark:border">
              <CommandInput
                placeholder="Search..."
                className="h-12"
                ref={searchRef}
              />

              <CommandList className="border-t border-zinc-500/20">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  <Flex direction="col" className="p-2 w-full">
                    <Flex
                      items="start"
                      justify="between"
                      gap="lg"
                      className="w-full p-2"
                    >
                      <Flex direction="col">
                        <Type weight="medium" size="sm">
                          Custom Assistants
                        </Type>
                        <Type size="xs" textColor="tertiary">
                          Experience the advanced capabilities of AI with Custom
                          Assistants
                        </Type>
                      </Flex>
                      <Drawer.NestedRoot
                        open={openCreateAssistant}
                        onOpenChange={setOpenCreateAssistant}
                      >
                        <Drawer.Trigger asChild>
                          <Button
                            size="sm"
                            onClick={() => {
                              setOpenCreateAssistant(true);
                            }}
                          >
                            Add New
                          </Button>
                        </Drawer.Trigger>
                        <Drawer.Portal>
                          <Drawer.Overlay className="fixed inset-0 z-[600] bg-zinc-500/70 dark:bg-zinc-900/70 backdrop-blur-sm" />
                          <Drawer.Content
                            className={cn(
                              "flex flex-col items-center outline-none max-h-[450px] mt-24 fixed z-[700] md:bottom-6 mx-auto md:left-[50%] left-0 bottom-0 right-0",
                              `md:ml-[-220px] md:w-[440px] w-full`
                            )}
                          >
                            <CreateAssistant
                              assistant={updateAssistant}
                              onUpdateAssistant={(assistant) => {
                                updateAssistantMutation.mutate(
                                  {
                                    assistantKey: assistant.key,
                                    newAssistant: assistant,
                                  },
                                  {
                                    onSettled: () => {
                                      setOpenCreateAssistant(false);
                                      setUpdateAssistant(undefined);
                                    },
                                  }
                                );
                              }}
                              onCreateAssistant={(assistant) => {
                                createAssistantMutation.mutate(assistant, {
                                  onSettled: () => {
                                    setOpenCreateAssistant(false);
                                  },
                                });
                              }}
                              onCancel={() => {
                                setOpenCreateAssistant(false);
                                setUpdateAssistant(undefined);
                              }}
                            />
                          </Drawer.Content>
                        </Drawer.Portal>
                      </Drawer.NestedRoot>
                    </Flex>
                    {renderAssistants("custom")}
                  </Flex>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup>
                  <Flex direction="col" className="p-2 w-full">
                    <Type weight="medium" size="sm" className="p-2">
                      Models
                    </Type>
                    {renderAssistants("base")}
                  </Flex>
                </CommandGroup>
              </CommandList>
            </Command>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </AssistantsContext.Provider>
  );
};
