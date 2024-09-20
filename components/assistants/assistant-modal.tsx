import { usePreferenceContext } from "@/lib/context";
import { useAssistantUtils } from "@/lib/hooks";
import { cn } from "@/lib/utils/clsx";
import {
  Button,
  Command,
  CommandEmpty,
  CommandInput,
  CommandList,
  Flex,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Type,
} from "@/ui";
import { CreateAssistant } from "./create-assistant";

import { defaultPreferences } from "@/config";
import { useAuth } from "@/lib/context";
import { TAssistant } from "@/lib/types";
import { Dialog, DialogContent, DialogOverlay, DialogPortal } from "@/ui";
import { CommandGroup } from "cmdk";
import { ChevronDown, Plus } from "lucide-react";
import { FC, useEffect, useRef, useState } from "react";
import { AssistantItem } from "./assistant-item";

export type TAssitantModal = {
  selectedAssistantKey: string;
  onAssistantchange: (assistantKey: string) => void;
};
export const AssistantModal: FC<TAssitantModal> = ({
  selectedAssistantKey,
  onAssistantchange,
}) => {
  const { getAssistantByKey, getAssistantIcon } = useAssistantUtils();
  const { preferences, updatePreferences } = usePreferenceContext();
  const { user, open: openSignIn } = useAuth();
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

  const selectedAssistant = getAssistantByKey(selectedAssistantKey);

  // useEffect(() => {
  //   if (open && searchRef?.current) {
  //     searchRef?.current?.focus();
  //   }
  // }, [open]);

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
            if (!user && assistant.baseModel === "llmchat") {
              openSignIn();
            }
            onAssistantchange(assistant.key);
            // onOpenChange(false);
          }}
        />
      );
    });
  };

  const renderEmptyState = () => {
    return (
      <Flex
        direction="col"
        items="center"
        justify="center"
        className="w-full px-4"
        gap="md"
      >
        <Type size="sm" textColor="tertiary">
          No assistants found.
        </Type>
        <Button
          size="sm"
          className="w-full"
          variant="outlined"
          onClick={() => setOpenCreateAssistant(true)}
        >
          Create Custom Assistant
        </Button>
      </Flex>
    );
  };

  const [activeTab, setActiveTab] = useState<"assistants" | "models">("models");

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="bordered" size="sm" className="gap-1 pl-1.5 pr-3">
            {selectedAssistant?.assistant?.key &&
              getAssistantIcon(selectedAssistant?.assistant?.key, "sm")}
            {selectedAssistant?.assistant?.name}
            <ChevronDown size={14} strokeWidth="2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="mr-8 w-[380px] rounded-xl p-0 dark:bg-zinc-700"
          side="bottom"
          align="start"
        >
          <Command className="relative h-full max-h-[450px] overflow-hidden rounded-xl dark:bg-zinc-700">
            <div className="h-11 w-full border-b border-zinc-500/20 px-2">
              <CommandInput
                placeholder="Search assistants..."
                className="h-11"
                ref={searchRef}
              />
            </div>

            <Flex className="px-3 py-2" gap="xs">
              <Button
                variant={activeTab === "models" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("models")}
              >
                Models
              </Button>
              <Button
                variant={activeTab === "assistants" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("assistants")}
              >
                Assistants
              </Button>
            </Flex>

            <CommandEmpty>{renderEmptyState()}</CommandEmpty>

            <CommandList className="h-full !max-h-[50vh] overflow-y-auto pb-2">
              {activeTab === "assistants" && (
                <CommandGroup className="w-full px-2.5">
                  {!!customAssistants?.length && (
                    <Flex direction="col" className="w-full p-2">
                      <Button
                        size="sm"
                        className="w-full"
                        variant="outlined"
                        onClick={() => setOpenCreateAssistant(true)}
                      >
                        <Plus size={14} strokeWidth="2" /> Create Custom
                        Assistant
                      </Button>
                    </Flex>
                  )}
                  <Flex direction="col" className="w-full">
                    {renderAssistants(customAssistants)}
                  </Flex>
                </CommandGroup>
              )}

              {activeTab === "models" && (
                <CommandGroup>
                  <Flex direction="col" className="w-full px-2.5">
                    {renderAssistants(baseAssistants)}
                  </Flex>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <Dialog
        modal={true}
        open={openCreateAssistant}
        onOpenChange={setOpenCreateAssistant}
      >
        <DialogPortal>
          <DialogOverlay className="fixed inset-0 z-[600] bg-zinc-500/50 dark:bg-zinc-900/50" />
          <DialogContent
            ariaTitle="Create Assistant"
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
            className={cn(
              "z-[605] mx-auto flex max-h-[550px] flex-col items-center p-0 outline-none",
              `w-full md:w-[540px]`,
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
                    // Log this error
                  },
                });
              }}
              onCancel={() => {
                setOpenCreateAssistant(false);
                setUpdateAssistant(undefined);
              }}
            />
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
};
