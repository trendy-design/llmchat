"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TPrompt, usePrompts } from "@/hooks/use-prompts";
import {
  ArrowLeft,
  BookBookmark,
  FolderSimple,
  Plus,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Highlight from "@tiptap/extension-highlight";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import axios from "axios";
import { CommandList } from "cmdk";
import { useEffect, useState } from "react";
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
  const [localPrompts, setLocalPrompts] = useState<TPrompt[]>([]);
  const [promptTitle, setPromptTitle] = useState("");
  const [showLocalPrompts, setShowLocalPrompts] = useState(false);
  const { setPrompt, getPrompts } = usePrompts();

  useEffect(() => {
    getPrompts().then((prompts) => {
      setLocalPrompts(prompts);
    });
  }, [showCreatePrompt]);

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: "Enter prompt here...",
      }),
      HardBreak,
      Highlight.configure({
        HTMLAttributes: {
          class: "prompt-highlight",
        },
      }),
    ],
    content: ``,
    autofocus: true,

    onTransaction(props) {
      const { editor } = props;
      const text = editor.getText();
      const html = editor.getHTML();

      console.log(text);
      const newHTML = html.replace(
        /{{{{(.*?)}}}}/g,
        ` <mark class="prompt-highlight">$1</mark> `
      );

      if (newHTML !== html) {
        editor.commands.setContent(newHTML, true, {
          preserveWhitespace: true,
        });
      }
    },
    parseOptions: {
      preserveWhitespace: true,
    },
  });

  const clearPrompt = () => {
    setPromptTitle("");
    editor?.commands.setContent("");
  };

  const query = useQuery<{ prompts: TPrompt[] }>({
    queryKey: ["prompts"],
    queryFn: async () => axios.get("/api/prompts").then((res) => res.data),
  });

  const open = (key?: string) => {
    setIsPromptOpen(true);
  };

  const savePrompt = async () => {
    const content = editor?.getText();
    if (!content) {
      return;
    }
    await setPrompt({ name: promptTitle, content });
    clearPrompt();
    setShowCreatePrompt(false);
    setShowLocalPrompts(true);
  };

  const dismiss = () => setIsPromptOpen(false);

  const renderCreatePrompt = () => {
    return (
      <div className="flex flex-col items-start  w-full">
        <div className="w-full px-2 py-2 border-b border-zinc-500/20 flex flex-row gap-3 items-center">
          <Button
            size="iconSm"
            variant="ghost"
            onClick={() => {
              setShowCreatePrompt(false);
            }}
          >
            <ArrowLeft size={16} weight="bold" />
          </Button>
          <p className="text-base font-medium">Create New Prompt</p>
        </div>
        <div className="flex flex-col w-full flex-1 p-2">
          <Input
            type="text"
            placeholder="Prompt Title"
            variant="ghost"
            value={promptTitle}
            onChange={(e) => setPromptTitle(e.target.value)}
            className="w-full bg-transparent"
          />
          <EditorContent
            editor={editor}
            autoFocus
            className="w-full min-h-24 p-3 [&>*]:leading-7 text-sm md:text-base h-full outline-none focus:outline-none  [&>*]:outline-none no-scrollbar [&>*]:no-scrollbar  wysiwyg cursor-text"
          />
          <p className="text-xs text-zinc-500 py-2 px-3 flex flex-row gap-2 items-center">
            Use <Badge>{`{{{{ input }}}}`}</Badge> for user input
          </p>
        </div>
        <div className="w-full px-2 py-2 border-t border-zinc-500/20 flex flex-row gap-3 items-center">
          <Button
            size="sm"
            variant="default"
            onClick={() => {
              savePrompt();
            }}
          >
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowCreatePrompt(false);
            }}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  };

  return (
    <PromptsContext.Provider value={{ open, dismiss }}>
      {children}

      <Dialog open={isPromptOpen} onOpenChange={setIsPromptOpen}>
        <DialogContent className="w-[96dvw] max-h-[80dvh] rounded-2xl md:min-w-[600px] gap-0 md:max-h-[600px] flex flex-col overflow-hidden border border-white/5 p-0">
          {showCreatePrompt ? (
            renderCreatePrompt()
          ) : (
            <Command>
              <div className="w-full p-1">
                <CommandInput placeholder="Search Prompts" />
              </div>

              <div className="flex flex-col w-full mt-60 md:mt-0 border-t border-zinc-500/20 relative h-full">
                <div className="w-full flex flex-row justify-between px-3 pt-3 pb-3">
                  <div className="flex flex-row gap-2 items-center">
                    <Button
                      size="sm"
                      variant={showLocalPrompts ? "ghost" : "secondary"}
                      onClick={() => {
                        setShowLocalPrompts(false);
                      }}
                    >
                      <BookBookmark size={16} weight="bold" /> Prompt Library
                    </Button>

                    <Button
                      size="sm"
                      variant={showLocalPrompts ? "secondary" : "ghost"}
                      onClick={() => {
                        setShowLocalPrompts(true);
                      }}
                    >
                      <FolderSimple size={16} weight="bold" /> Your prompts
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setShowCreatePrompt(true);
                    }}
                  >
                    <Plus size={16} weight="bold" /> Create Prompt
                  </Button>
                </div>
                <CommandEmpty className="text-sm text-zinc-500 w-full flex flex-col items-center justify-center gap-2 p-4">
                  No prompts found{" "}
                  <Button variant="outline" size="sm">
                    Create new prompt
                  </Button>
                </CommandEmpty>
                <CommandList className="px-2 py-2">
                  {(showLocalPrompts
                    ? localPrompts
                    : query?.data?.prompts
                  )?.map((prompt) => (
                    <CommandItem
                      value={prompt.name}
                      key={prompt.id}
                      className="w-full"
                    >
                      <div className="flex flex-col items-start gap-0 py-2 w-full">
                        <p className="text-base font-medium">{prompt.name}</p>
                        <p className="text-xs text-zinc-500 truncate overflow-hidden w-full whitespace-nowrap">
                          {prompt.content}
                        </p>
                      </div>
                    </CommandItem>
                  ))}
                </CommandList>
              </div>
            </Command>
          )}
        </DialogContent>
      </Dialog>
    </PromptsContext.Provider>
  );
};
