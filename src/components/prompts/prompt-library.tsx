import { useChatContext } from "@/context/chat/context";
import { TPrompt } from "@/hooks/use-prompts";
import { BookBookmark, FolderSimple, Plus } from "@phosphor-icons/react";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

export type TPromptLibrary = {
  open: boolean;
  onPromptSelect: (prompt: TPrompt) => void;
  tab: "public" | "local";
  publicPrompts: TPrompt[];
  localPrompts: TPrompt[];
  onTabChange: (tab: "public" | "local") => void;
  onCreate: () => void;
};

export const PromptLibrary = ({
  open,
  onPromptSelect,
  tab,
  localPrompts,
  publicPrompts,
  onCreate,
  onTabChange,
}: TPromptLibrary) => {
  const { editor } = useChatContext();

  return (
    <Command>
      <div className="w-full p-1">
        <CommandInput placeholder="Search Prompts" />
      </div>

      <div className="flex flex-col w-full mt-60 md:mt-0 border-t border-zinc-500/20 relative h-full">
        <div className="w-full flex flex-row justify-between px-3 pt-3 pb-3">
          <div className="flex flex-row gap-2 items-center">
            <Button
              size="sm"
              variant={tab === "public" ? "secondary" : "ghost"}
              onClick={() => {
                onTabChange("public");
              }}
            >
              <BookBookmark size={16} weight="bold" /> Prompt Library
            </Button>

            <Button
              size="sm"
              variant={tab === "local" ? "secondary" : "ghost"}
              onClick={() => {
                onTabChange("local");
              }}
            >
              <FolderSimple size={16} weight="bold" /> Your prompts
            </Button>
          </div>
          <Button size="sm" onClick={onCreate}>
            <Plus size={16} weight="bold" /> Create Prompt
          </Button>
        </div>
        <CommandEmpty className="text-sm text-zinc-500 w-full flex flex-col items-center justify-center gap-2 p-4">
          No prompts found{" "}
          <Button variant="outline" size="sm" onClick={onCreate}>
            Create new prompt
          </Button>
        </CommandEmpty>
        <CommandList className="px-2 py-2">
          {(tab === "local" ? localPrompts : publicPrompts)?.map((prompt) => (
            <CommandItem value={prompt.name} key={prompt.id} className="w-full">
              <div className="flex flex-row gap-2 p-1 items-center justify-start w-full overflow-hidden">
                <div className="flex flex-col items-start gap-0 py-2 w-full">
                  <p className="text-base font-medium">{prompt.name}</p>
                  <p className="text-xs text-zinc-500 w-full line-clamp-2">
                    {prompt.content}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onPromptSelect(prompt);
                  }}
                >
                  Use this
                </Button>
              </div>
            </CommandItem>
          ))}
        </CommandList>
      </div>
    </Command>
  );
};
