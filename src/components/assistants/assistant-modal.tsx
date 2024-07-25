import { CreateAssistant } from "@/components/assistants/create-assistant";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { Flex } from "@/components/ui/flex";
import { Type } from "@/components/ui/text";
import { usePreferenceContext } from "@/context";
import { cn } from "@/helper/clsx";
import { useAssistantUtils } from "@/hooks";

import { defaultPreferences } from "@/config";
import { TAssistant } from "@/types";
import { CommandGroup } from "cmdk";
import { FC, useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { AssistantBanner } from "./assistant-banner";
import { AssistantHeader } from "./assistant-header";
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

  const customAssistants = assistants?.filter((a) => a.type === "custom");
  const baseAssistants = assistants?.filter((a) => a.type === "base");

  useEffect(() => {
    if (open && searchRef?.current) {
      searchRef?.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    onAssistantchange(preferences.defaultAssistant);
  }, [preferences]);

  const renderAssistants = (assistants: TAssistant[]) => {
    return assistants?.map((assistant) => {
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

  const renderEmptyState = () => {
    return (
      <Flex direction="col" items="center" justify="center" className="w-full">
        <Type size="sm" textColor="tertiary">
          No assistants found.
        </Type>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpenCreateAssistant(true)}
        >
          Create New
        </Button>
      </Flex>
    );
  };

  return (
    <Drawer.Root
      direction="bottom"
      shouldScaleBackground
      open={open}
      onOpenChange={onOpenChange}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[400] bg-zinc-500/70 backdrop-blur-sm dark:bg-zinc-900/70" />
        <Drawer.Content
          className={cn(
            "fixed bottom-0 left-0 right-0 z-[500] mx-auto mt-24 flex max-h-[430px] flex-col items-center outline-none md:bottom-4 md:left-[50%]",
            `w-full md:ml-[-200px] md:w-[400px]`,
          )}
        >
          <Command className="relative rounded-2xl dark:border dark:border-white/10">
            <CommandInput
              placeholder="Search assistants..."
              className="h-12"
              ref={searchRef}
            />
            <CommandEmpty>{renderEmptyState()}</CommandEmpty>

            <CommandList className="border-t border-zinc-500/20">
              <CommandGroup>
                <Flex direction="col" className="w-full p-2">
                  {!!customAssistants?.length ? (
                    <AssistantHeader
                      openCreateAssistant={openCreateAssistant}
                      setOpenCreateAssistant={setOpenCreateAssistant}
                    />
                  ) : (
                    <AssistantBanner
                      openCreateAssistant={openCreateAssistant}
                      setOpenCreateAssistant={setOpenCreateAssistant}
                    />
                  )}
                  <Drawer.NestedRoot
                    open={openCreateAssistant}
                    onOpenChange={setOpenCreateAssistant}
                  >
                    <Drawer.Portal>
                      <Drawer.Overlay className="fixed inset-0 z-[600] bg-zinc-500/70 backdrop-blur-sm dark:bg-zinc-900/70" />
                      <Drawer.Content
                        className={cn(
                          "fixed bottom-0 left-0 right-0 z-[605] mx-auto mt-24 flex max-h-[450px] flex-col items-center outline-none md:bottom-6 md:left-[50%]",
                          `w-full md:ml-[-220px] md:w-[440px]`,
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
                              },
                            );
                          }}
                          onCreateAssistant={(assistant) => {
                            createAssistantMutation.mutate(assistant, {
                              onSettled: () => {
                                setOpenCreateAssistant(false);
                              },
                              onError: (error) => {
                                console.log("error", error);
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

                  {renderAssistants(customAssistants)}
                </Flex>
              </CommandGroup>
              <CommandGroup>
                <Flex direction="col" className="w-full p-2">
                  <Type weight="medium" size="base" className="px-3 py-2">
                    Models
                  </Type>
                  {renderAssistants(baseAssistants)}
                </Flex>
              </CommandGroup>
            </CommandList>
          </Command>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
