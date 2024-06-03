import { usePrompts } from "@/hooks/use-prompts";
import { ArrowLeft } from "@phosphor-icons/react";
import Document from "@tiptap/extension-document";
import HardBreak from "@tiptap/extension-hard-break";
import Highlight from "@tiptap/extension-highlight";
import Paragraph from "@tiptap/extension-paragraph";
import Placeholder from "@tiptap/extension-placeholder";
import Text from "@tiptap/extension-text";
import { EditorContent, useEditor } from "@tiptap/react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

export type TCreatePrompt = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export const CreatePrompt = ({ open, onOpenChange }: TCreatePrompt) => {
  const [promptTitle, setPromptTitle] = useState("");
  const { setPrompt, getPrompts } = usePrompts();
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
    content: ``,
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
    await setPrompt({ name: promptTitle, content });
    clearPrompt();

    onOpenChange(false);
  };

  return (
    <div className="flex flex-col items-start  w-full">
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
        <p className="text-base font-medium">Create New Prompt</p>
      </div>
      <div className="flex flex-col w-full flex-1 p-2">
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
            onOpenChange(false);
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};
