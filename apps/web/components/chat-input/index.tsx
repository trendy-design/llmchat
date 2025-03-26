import { useAgentStream } from '@/hooks/agent-provider';
import { useChatEditor } from '@/lib/hooks';
import { useChatStore } from '@/libs/store/chat.store';
import { useAuth, useClerk } from '@clerk/nextjs';
import { cn, Flex } from '@repo/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useShallow } from 'zustand/react/shallow';
import { ExamplePrompts } from '../exmaple-prompts';
import { MessagesRemainingBadge } from '../messages-remaining-badge';
import {
    ChatModeButton,
    GeneratingStatus,
    NewLineIndicator,
    SendStopButton,
    WebSearchButton,
} from './chat-actions';
import { ChatEditor } from './chat-editor';
export const ChatInput = ({
    showGreeting = true,
    showBottomBar = true,
    isFollowUp = false,
}: {
    showGreeting?: boolean;
    showBottomBar?: boolean;
    isFollowUp?: boolean;
}) => {
    const { threadId: currentThreadId } = useParams();
    const { editor } = useChatEditor();
    const { actor, isSignedIn } = useAuth();
    const { openSignIn } = useClerk();
    const getThreadItems = useChatStore(state => state.getThreadItems);
    const threadItemsLength = useChatStore(useShallow(state => state.threadItems.length));
    const { handleSubmit } = useAgentStream();
    const createThread = useChatStore(state => state.createThread);
    const useWebSearch = useChatStore(state => state.useWebSearch);
    const isGenerating = useChatStore(state => state.isGenerating);
    const isChatPage = usePathname().startsWith('/chat');
    const stopGeneration = useChatStore(state => state.stopGeneration);
    const hasTextInput = !!editor?.getText();

    const router = useRouter();
    const sendMessage = async () => {
        if (!editor?.getText()) {
            return;
        }

        let threadId = currentThreadId?.toString();

        if (!threadId) {
            const optimisticId = uuidv4();
            router.prefetch(`/c/${optimisticId}`);
            const newThread = await createThread(optimisticId, {
                title: editor?.getText(),
            });
            threadId = newThread.id;
        }

        // First submit the message
        const formData = new FormData();
        formData.append('query', editor.getText());
        const threadItems = currentThreadId ? await getThreadItems(currentThreadId.toString()) : [];
        if (!isSignedIn) {
            openSignIn();
            return;
        }
        handleSubmit({
            formData,
            newThreadId: threadId,
            messages: threadItems,
            useWebSearch,
        });
        editor.commands.clearContent();
        if (currentThreadId !== threadId) {
            router.push(`/c/${threadId}`);
        }
    };

    const renderChatInput = () => (
        <AnimatePresence>
            <motion.div
                className="w-full"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                <Flex
                    direction="col"
                    className="bg-background border-border hover:border-hard relative z-10 w-full rounded-2xl border"
                >
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.15 }}
                        className="flex w-full flex-shrink-0 overflow-hidden rounded-xl"
                    >
                        {editor?.isEditable ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.15, ease: 'easeOut' }}
                                className="w-full"
                            >
                                <Flex className="flex w-full flex-row items-end gap-0">
                                    <ChatEditor sendMessage={sendMessage} editor={editor} />
                                </Flex>

                                <Flex
                                    className="w-full gap-0 px-2 py-2"
                                    gap="none"
                                    items="center"
                                    justify="between"
                                >
                                    {isGenerating && !isChatPage ? (
                                        <GeneratingStatus />
                                    ) : (
                                        <Flex gap="xs" items="center" className="shrink-0">
                                            <ChatModeButton />
                                            {/* <AttachmentButton /> */}
                                            <WebSearchButton />
                                            {/* <ToolsMenu /> */}
                                        </Flex>
                                    )}

                                    <Flex gap="md" items="center">
                                        <NewLineIndicator />
                                        <SendStopButton
                                            isGenerating={isGenerating}
                                            isChatPage={isChatPage}
                                            stopGeneration={stopGeneration}
                                            hasTextInput={hasTextInput}
                                            sendMessage={sendMessage}
                                        />
                                    </Flex>
                                </Flex>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="flex h-24 w-full items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <div className="animate-pulse">Loading editor...</div>
                            </motion.div>
                        )}
                    </motion.div>
                </Flex>
                {showBottomBar && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="mx-1.5 -mt-2 flex h-10 flex-row items-center gap-2 rounded-b-2xl border-x border-b border-yellow-900/20 bg-yellow-700/5 px-2 pt-2"
                    >
                        <span className="px-2 text-xs font-light">
                            <MessagesRemainingBadge />
                        </span>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );

    const renderChatBottom = () => (
        <>
            <Flex items="center" justify="center" gap="sm">
                {/* <ScrollToBottomButton /> */}
            </Flex>
            {renderChatInput()}
        </>
    );

    return (
        <div
            className={cn(
                'flex w-full flex-col items-start',
                !threadItemsLength && 'justify-start'
            )}
        >
            <Flex
                items="start"
                justify="start"
                direction="col"
                className={cn('w-full pb-4', threadItemsLength > 0 ? 'mb-0' : 'h-full')}
            >
                {showGreeting && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className="mb-6 flex w-full flex-col items-center gap-0"
                    >
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ duration: 0.3, delay: 0.1 }}
                            className="font-cabinet text-foreground/70 text-4xl font-medium tracking-tight"
                        >
                            Good morning ,
                        </motion.h1>
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="font-cabinet text-4xl font-medium tracking-tight text-yellow-950"
                        >
                            How can i help you?
                        </motion.h1>
                    </motion.div>
                )}

                {renderChatBottom()}
                {showGreeting && <ExamplePrompts />}

                {/* <ChatFooter /> */}
            </Flex>
        </div>
    );
};
