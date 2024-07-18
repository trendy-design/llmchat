import { TPrompt } from "@/hooks/use-prompts";
import { ArrowLeft } from "@phosphor-icons/react";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Highlight from "@tiptap/extension-highlight";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type TCreatePrompt = {
  prompt?: TPrompt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePrompt: (prompt: Omit<TPrompt, "id">) => void;
  onUpdatePrompt: (prompt: TPrompt) => void;
};

export const CreatePrompt = ({
  prompt,
  open,
  onOpenChange,
  onCreatePrompt,
  onUpdatePrompt,
}: TCreatePrompt) => {
  const [promptTitle, setPromptTitle] = useState(prompt?.name);
  const promptTitleRef = useRef<HTMLInputElement | null>(null);
  const [rawPrompt, setRawPrompt] = useState("");

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
    content: prompt?.content || "",
    autofocus: true,

    onTransaction(props) {
      // const { editor } = props;
      // const text = editor.getText();
      // setRawPrompt(text);
      // const html = editor.getHTML();
      // const newHTML = html.replace(
      //   /{{{{(.*?)}}}}/g,
      //   ` <mark class="prompt-highlight">$1</mark> `
      // );
      // if (newHTML !== html) {
      //   editor.commands.setContent(newHTML, true, {
      //     preserveWhitespace: true,
      //   });
      // }
    },
    parseOptions: {
      preserveWhitespace: true,
    },
  });

  useEffect(() => {
    promptTitleRef?.current?.focus();
  }, [open]);

  const clearPrompt = () => {
    setPromptTitle("");
    editor?.commands.setContent("");
  };

  const savePrompt = async () => {
    const content = editor?.getText();
    if (!content) {
      return;
    }
    if (!promptTitle) {
      return;
    }

    if (prompt) {
      onUpdatePrompt({ ...prompt, name: promptTitle, content });
    } else {
      onCreatePrompt({ name: promptTitle, content });
    }

    clearPrompt();
    onOpenChange(false);
  };

  return (
    <div className="flex flex-col items-start  w-full h-full relative overflow-hidden">
      <div className="w-full px-2 py-2 border-b border-zinc-500/20 flex flex-row gap-3 items-center">
        <Button
          size="iconSm"
          variant="ghost"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          <ArrowLeft size={16} weight="bold" />
        </Button>
        <p className="text-base font-medium">
          {prompt ? "Edit Prompt" : "Create New Prompt"}
        </p>
      </div>
      <div className="flex flex-col w-full flex-1 p-2 overflow-y-auto h-full pb-[80px] no-scrollbar">
        <Input
          type="text"
          placeholder="Prompt Title"
          variant="ghost"
          value={promptTitle}
          ref={promptTitleRef}
          onChange={(e) => setPromptTitle(e.target.value)}
          className="w-full bg-transparent"
        />
        <EditorContent
          editor={editor}
          autoFocus
          className="w-full p-3 [&>*]:leading-7 text-sm md:text-base outline-none focus:outline-none  [&>*]:outline-none no-scrollbar [&>*]:no-scrollbar cursor-text"
        />
        <p className="text-xs text-zinc-500 py-2 px-3 flex flex-row gap-2 items-center">
          Use <Badge>{`{{{{ input }}}}`}</Badge> for user input
        </p>
      </div>
      <div className="w-full px-2 py-2 border-t bg-white dark:bg-zinc-800 absolute bottom-0 left-0 right-0 border-zinc-500/20 flex flex-row gap-3 items-center">
        <Button
          variant="default"
          onClick={() => {
            savePrompt();
          }}
        >
          Save
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
