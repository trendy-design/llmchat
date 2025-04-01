import { useChatStore } from '@repo/common/store';
import { Flex } from '@repo/ui';
import { Editor, EditorContent } from '@tiptap/react';
import { FC } from 'react';

export type TChatEditor = {
    sendMessage: (message: string) => void;
    editor: Editor | null;
    maxHeight?: string;
};

export const ChatEditor: FC<TChatEditor> = ({ sendMessage, editor, maxHeight = '200px' }) => {
    const isGenerating = useChatStore(state => state.isGenerating);

    if (!editor) return null;

    const editorContainerClass =
        'no-scrollbar [&>*]:no-scrollbar wysiwyg px-4 pt-4 min-h-[50px] w-full cursor-text overflow-y-auto p-1 text-base outline-none focus:outline-none [&>*]:leading-6 [&>*]:outline-none';

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
                className={editorContainerClass}
            />
        </Flex>
    );
};
