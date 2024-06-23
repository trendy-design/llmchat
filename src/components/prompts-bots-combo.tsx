import { usePromptsContext } from "@/context";
import { TPrompt } from "@/hooks/use-prompts";
import { Plus } from "@phosphor-icons/react";
import { useState } from "react";
import {
  Command as CMDKCommand,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import { Popover, PopoverAnchor, PopoverContent } from "./ui/popover";

export type TPromptsBotsCombo = {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPromptSelect: (prompt: TPrompt) => void;

  onBack: () => void;
};
export const PromptsBotsCombo = ({
  open,
  children,
  onOpenChange,
  onBack,
  onPromptSelect,
}: TPromptsBotsCombo) => {
  const [commandInput, setCommandInput] = useState("");
  const { open: openPrompts, allPrompts } = usePromptsContext();

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverAnchor className="w-full">{children}</PopoverAnchor>
      <PopoverContent
        side="top"
        sideOffset={4}
        className="min-w-[96vw] md:min-w-[700px] lg:min-w-[720px] p-0 rounded-2xl overflow-hidden"
      >
        <CMDKCommand>
          <CommandInput
            placeholder="Search..."
            className="h-10"
            value={commandInput}
            onValueChange={setCommandInput}
            onKeyDown={(e) => {
              if (
                (e.key === "Delete" || e.key === "Backspace") &&
                !commandInput
              ) {
                onOpenChange(false);
                onBack();
              }
            }}
          />
          <CommandEmpty>No Prompts found.</CommandEmpty>
          <CommandList className="p-2 max-h-[160px]">
            <CommandItem
              onSelect={() => {
                openPrompts("create");
              }}
            >
              <Plus size={14} weight="bold" className="flex-shrink-0" /> Create
              New Prompt
            </CommandItem>

            {!!allPrompts?.length && (
              <CommandGroup heading="Prompts">
                {allPrompts?.map((prompt, index) => (
                  <CommandItem
                    key={index}
                    onSelect={() => {
                      onPromptSelect(prompt);
                    }}
                  >
                    {prompt.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </CMDKCommand>
      </PopoverContent>
    </Popover>
  );
};
