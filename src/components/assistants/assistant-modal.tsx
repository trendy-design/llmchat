import { CreateAssistant } from "@/components/assistants/create-assistant";
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
import { usePreferenceContext } from "@/context";
import { cn } from "@/helper/clsx";
import { useAssistantUtils } from "@/hooks";

import { defaultPreferences } from "@/config";
import { TAssistant, TAssistantType } from "@/types";
import { CommandGroup } from "cmdk";
import { FC, useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { AssistantItem } from "./assistant-item";

export type TAssitantModal = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedAssistantKey: string;
  onAssistantchange: (assistantKey: string) => void;
};
export const AssistantModal: FC<TAssitantModal> = ({
  open,
  onOpenChange,
  selectedAssistantKey,
  onAssistantchange,
}) => {
  const { preferences, updatePreferences } = usePreferenceContext();

  const {
    assistants,
    createAssistantMutation,
    deleteAssistantMutation,
    updateAssistantMutation,
  } = useAssistantUtils();

  const searchRef = useRef<HTMLInputElement>(null);
  const [openCreateAssistant, setOpenCreateAssistant] = useState(false);
  const [updateAssistant, setUpdateAssistant] = useState<TAssistant>();

  useEffect(() => {
    if (open && searchRef?.current) {
      searchRef?.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    onAssistantchange(preferences.defaultAssistant);
  }, [preferences]);

  const renderAssistants = (type: TAssistantType) => {
    return assistants
      ?.filter((a) => a.type === type)
      ?.map((assistant) => {
        return (
          <AssistantItem
            key={assistant.key}
            onDelete={(assistant) => {
              deleteAssistantMutation?.mutate(assistant.key, {
                onSuccess: () => {
                  updatePreferences({
                    defaultAssistant: defaultPreferences.defaultAssistant,
                  });
                },
              });
            }}
            onEdit={(assistant) => {
              setOpenCreateAssistant(true);
              setUpdateAssistant(assistant);
            }}
            assistant={assistant}
            onSelect={(assistant) => {
              onAssistantchange(assistant.key);
              onOpenChange(false);
            }}
          />
        );
      });
  };

  return (
    <Drawer.Root
      direction="bottom"
      shouldScaleBackground
      open={open}
      onOpenChange={onOpenChange}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[400] bg-zinc-500/70 dark:bg-zinc-900/70 backdrop-blur-sm" />
        <Drawer.Content
          className={cn(
            "flex flex-col items-center outline-none max-h-[430px] mt-24 fixed z-[500] md:bottom-4 mx-auto md:left-[50%] left-0 bottom-0 right-0",
            `md:ml-[-200px] md:w-[400px] w-full`
          )}
        >
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
                    className="w-full px-3 py-2"
                  >
                    <Flex direction="col">
                      <Type weight="medium" size="base">
                        Assistants
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
                            "flex flex-col items-center outline-none  max-h-[450px] mt-24 fixed z-[605] md:bottom-6 mx-auto md:left-[50%] left-0 bottom-0 right-0",
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
                  <Type weight="medium" size="base" className="px-3 py-2">
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
  );
};
