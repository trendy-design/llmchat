import { ThreadItem } from '@repo/common/components';
import { useChatStore } from '@repo/common/store';
import { Button } from '@repo/ui';
import { IconHelpHexagon } from '@tabler/icons-react';
import { Editor } from '@tiptap/react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function Thread() {
    const { threadId } = useParams();
    const currentThreadId = threadId?.toString() ?? '';
    const previousThreadItems = useChatStore(
        useShallow(state => state.getPreviousThreadItems(currentThreadId))
    );
    const currentThreadItem = useChatStore(
        useShallow(state => state.getCurrentThreadItem(currentThreadId))
    );
    const isGenerating = useChatStore(useShallow(state => state.isGenerating));
    const memoizedPreviousThreadItems = useMemo(() => {
        return previousThreadItems.map(threadItem => (
            <div key={threadItem.id}>
                <ThreadItem
                    key={threadItem.id}
                    threadItem={threadItem}
                    isAnimated={false}
                    isGenerating={false}
                    isLast={false}
                />
            </div>
        ));
    }, [previousThreadItems]);

    return (
        <div className="relative" id="thread-container">
            <div className="flex min-w-full flex-col gap-8 px-2 py-4">
                {memoizedPreviousThreadItems}
                {currentThreadItem && (
                    <div key={currentThreadItem.id} className="min-h-[calc(100dvh-16rem)]">
                        <ThreadItem
                            key={currentThreadItem.id}
                            threadItem={currentThreadItem}
                            isAnimated={true}
                            isGenerating={isGenerating}
                            isLast={true}
                        />
                        <FollowupSuggestions suggestions={currentThreadItem.suggestions || []} />
                    </div>
                )}
            </div>
        </div>
    );
}

export const FollowupSuggestions = ({ suggestions }: { suggestions: string[] }) => {
    const editor: Editor | undefined = useChatStore(useShallow(state => state.editor));

    if (!suggestions || suggestions.length === 0) {
        return null;
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="border-border my-4 flex flex-col items-start gap-2 border-t border-dashed py-4"
        >
            <div className="text-muted-foreground flex flex-row items-center gap-1.5 py-2 text-xs font-medium">
                <IconHelpHexagon size={16} strokeWidth={2} className="text-muted-foreground" /> Ask
                Followup
            </div>
            <motion.div
                variants={{
                    show: {
                        transition: {
                            staggerChildren: 0.1,
                        },
                    },
                }}
                initial="hidden"
                animate="show"
                className="flex flex-col gap-1.5"
            >
                {suggestions.map(suggestion => (
                    <motion.div
                        key={suggestion}
                        variants={{
                            hidden: { opacity: 0, y: 10 },
                            show: { opacity: 1, y: 0 },
                        }}
                    >
                        <Button
                            variant="bordered"
                            size="default"
                            rounded="default"
                            className="hover:bg-tertiary group cursor-pointer hover:border-yellow-900/20"
                            onClick={() => {
                                editor?.commands.clearContent();
                                editor?.commands.insertContent(suggestion);
                            }}
                        >
                            {suggestion}{' '}
                        </Button>
                    </motion.div>
                ))}
            </motion.div>
        </motion.div>
    );
};
