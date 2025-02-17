import { TPrompt } from '@repo/shared/types';
import { Badge, Button, Input } from '@repo/ui';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Highlight from '@tiptap/extension-highlight';
import Paragraph from '@tiptap/extension-paragraph';
import Placeholder from '@tiptap/extension-placeholder';
import Text from '@tiptap/extension-text';
import { EditorContent, useEditor } from '@tiptap/react';
import { ArrowLeft } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export type TCreatePrompt = {
  prompt?: TPrompt;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePrompt: (prompt: Omit<TPrompt, 'id'>) => void;
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

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Placeholder.configure({
        placeholder: 'Enter prompt here...',
      }),
      HardBreak,
      Highlight.configure({
        HTMLAttributes: {
          class: 'prompt-highlight',
        },
      }),
    ],
    content: prompt?.content || '',
    autofocus: true,
    immediatelyRender: false,

    onTransaction(props) {},
    parseOptions: {
      preserveWhitespace: true,
    },
  });

  useEffect(() => {
    promptTitleRef?.current?.focus();
  }, [open]);

  const clearPrompt = () => {
    setPromptTitle('');
    editor?.commands.setContent('');
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
    <div className="relative flex h-full w-full flex-col items-start overflow-hidden">
      <div className="flex w-full flex-row items-center gap-3 border-b border-zinc-500/20 px-2 py-2">
        <Button
          size="icon-sm"
          variant="ghost"
          onClick={() => {
            onOpenChange(false);
          }}
        >
          <ArrowLeft size={16} strokeWidth={2} />
        </Button>
        <p className="text-base font-medium">{prompt ? 'Edit Prompt' : 'Create New Prompt'}</p>
      </div>
      <div className="no-scrollbar flex h-full w-full flex-1 flex-col overflow-y-auto p-2 pb-[80px]">
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
          className="no-scrollbar [&>*]:no-scrollbar w-full cursor-text p-3 text-sm outline-none focus:outline-none md:text-base [&>*]:leading-7 [&>*]:outline-none"
        />
        <p className="flex flex-row items-center gap-2 px-3 py-2 text-xs text-zinc-500">
          Use <Badge>{'::input::'}</Badge> for user input
        </p>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex w-full flex-row items-center gap-3 border-t border-zinc-500/20 bg-white px-2 py-2 dark:bg-zinc-800">
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
