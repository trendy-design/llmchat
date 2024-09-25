import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TPrompt } from "@/lib/types";
import { Flex } from "@/ui";
import { Album, Bookmark, Ellipsis, Pencil, Trash } from "lucide-react";

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
      <CommandInput placeholder="Search Prompts" className="h-12" />
      <CommandSeparator />
      <div className="relative flex h-full w-full flex-col">
        <CommandEmpty className="flex w-full flex-col items-center justify-center gap-2 p-4 text-sm text-zinc-500">
          No prompts found
          <Button variant="outlined" size="sm" onClick={onCreate}>
            Create new prompt
          </Button>
        </CommandEmpty>

        <CommandList className="px-2 pb-2">
          <CommandItem
            value={"Create prompt"}
            className="w-full"
            onSelect={onCreate}
          >
            <Pencil size={16} strokeWidth="2" />
            Create Prompt
          </CommandItem>
          {!!localPrompts?.length && (
            <CommandGroup heading="Local Prompts">
              {localPrompts.map((prompt) => (
                <CommandItem
                  value={prompt.name}
                  key={prompt.id}
                  className="w-full"
                  onSelect={() => onPromptSelect(prompt)}
                >
                  <Album size={20} strokeWidth="2" />
                  {prompt.name}
                  <Flex className="flex-1" />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm">
                        <Ellipsis size={16} strokeWidth={2} />
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
                        <Pencil size={14} strokeWidth={2} />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          onDelete(prompt);
                          e.stopPropagation();
                        }}
                      >
                        <Trash size={14} strokeWidth={2} />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="Public Prompts">
            {publicPrompts.map((prompt) => (
              <CommandItem
                value={prompt.name}
                key={prompt.id}
                className="w-full"
                onSelect={() => onPromptSelect(prompt)}
              >
                <Bookmark size={20} strokeWidth="2" />
                {prompt.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </div>
    </Command>
  );
};
