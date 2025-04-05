import { useChatStore } from '@repo/common/store';
import { cn, Flex } from '@repo/ui';
import { Editor, EditorContent } from '@tiptap/react';
import { FC } from 'react';

export type TChatEditor = {
    sendMessage: (message: string) => void;
    editor: Editor | null;
    maxHeight?: string;
    className?: string;
    placeholder?: string;
};

export const ChatEditor: FC<TChatEditor> = ({
    sendMessage,
    editor,
    placeholder,
    maxHeight = '200px',
    className,
}) => {
    const isGenerating = useChatStore(state => state.isGenerating);

    if (!editor) return null;

    const editorContainerClass =
        'no-scrollbar [&>*]:no-scrollbar wysiwyg min-h-[60px] w-full cursor-text overflow-y-auto p-1 text-base outline-none focus:outline-none [&>*]:leading-6 [&>*]:outline-none [&>*]:break-all [&>*]:word-break-break-word [&>*]:whitespace-pre-wrap';

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (isGenerating) return;
        if (e.key === 'Enter' && !e.shiftKey) {
            sendMessage(editor.getText());
        }
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            e.currentTarget.scrollTop = e.currentTarget.scrollHeight;
        }
    };

    return (
        <Flex className="flex-1">
            <EditorContent
                editor={editor}
                autoFocus
                style={{
                    maxHeight,
                }}
                disabled={isGenerating}
                onKeyDown={handleKeyDown}
                className={cn(editorContainerClass, className)}
            />
        </Flex>
    );
};
