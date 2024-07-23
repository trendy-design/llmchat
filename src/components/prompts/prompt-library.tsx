import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TPrompt } from "@/hooks/use-prompts";
import { Edit02Icon, NoteIcon } from "@hugeicons/react";
import { DotsThree, Pencil, TrashSimple } from "@phosphor-icons/react";
import { Flex } from "../ui";

export type TPromptLibrary = {
  onPromptSelect: (prompt: TPrompt) => void;
  publicPrompts: TPrompt[];
  localPrompts: TPrompt[];
  onEdit: (prompt: TPrompt) => void;
  onDelete: (prompt: TPrompt) => void;
  onCreate: () => void;
};

export const PromptLibrary = ({
  onPromptSelect,
  localPrompts,
  publicPrompts,
  onCreate,
  onEdit,
  onDelete,
}: TPromptLibrary) => {
  return (
    <Command>
      <div className="w-full p-1">
        <CommandInput placeholder="Search Prompts" />
      </div>

      <div className="flex flex-col w-full relative h-full">
        <CommandEmpty className="text-sm text-zinc-500 w-full flex flex-col items-center justify-center gap-2 p-4">
          No prompts found
          <Button variant="outline" size="sm" onClick={onCreate}>
            Create new prompt
          </Button>
        </CommandEmpty>

        <CommandList className="px-2 pb-2">
          <CommandItem
            value={"Create prompt"}
            className="w-full"
            onSelect={onCreate}
          >
            <Edit02Icon size={18} variant="stroke" strokeWidth="2" />
            Create Prompt
          </CommandItem>
          <CommandGroup heading="Local Prompts">
            {localPrompts.map((prompt) => (
              <CommandItem
                value={prompt.name}
                key={prompt.id}
                className="w-full"
                onSelect={() => onPromptSelect(prompt)}
              >
                <NoteIcon size={20} variant="stroke" strokeWidth="2" />
                {prompt.name}
                <Flex className="flex-1" />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="iconSm">
                      <DotsThree size={24} weight="bold" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="min-w-[200px] text-sm md:text-base"
                    align="end"
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        onEdit(prompt);
                        e.stopPropagation();
                      }}
                    >
                      <Pencil size={14} weight="bold" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        onDelete(prompt);
                        e.stopPropagation();
                      }}
                    >
                      <TrashSimple size={14} weight="bold" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Public Prompts">
            {publicPrompts.map((prompt) => (
              <CommandItem
                value={prompt.name}
                key={prompt.id}
                className="w-full"
                onSelect={() => onPromptSelect(prompt)}
              >
                <NoteIcon size={20} variant="stroke" strokeWidth="2" />
                {prompt.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </div>
    </Command>
  );
};
