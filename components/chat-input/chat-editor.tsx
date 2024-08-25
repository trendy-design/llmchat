import { useChatContext } from "@/lib/context";
import { Flex } from "@/ui";
import { EditorContent } from "@tiptap/react";
import { FC } from "react";

export type TChatEditor = {
  sendMessage: (message: string) => void;
};

export const ChatEditor: FC<TChatEditor> = ({ sendMessage }) => {
  const { store } = useChatContext();
  const editor = store((state) => state.editor);
  const isGenerating = store((state) => state.isGenerating);

  if (!editor) return null;

  const editorContainerClass =
    "no-scrollbar [&>*]:no-scrollbar wysiwyg max-h-[120px] min-h-8 w-full cursor-text overflow-y-auto p-1 text-sm outline-none focus:outline-none [&>*]:leading-6 [&>*]:outline-none";

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isGenerating) return;
    if (e.key === "Enter" && !e.shiftKey) {
      sendMessage(editor.getText());
    }
    if (e.key === "Enter" && e.shiftKey) {
      e.preventDefault();
      e.currentTarget.scrollTop = e.currentTarget.scrollHeight;
    }
  };

  return (
    <Flex className="flex-1">
      <EditorContent
        editor={editor}
        autoFocus
        disabled={isGenerating}
        onKeyDown={handleKeyDown}
        className={editorContainerClass}
      />
    </Flex>
  );
};
