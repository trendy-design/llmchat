import { useAgentStream } from '@/hooks/agent-provider';
import { useChatEditor, useImageAttachment } from '@/lib/hooks';
import { useChatStore } from '@/libs/store/chat.store';
import { cn, slideUpVariant } from '@repo/shared/utils';
import { Flex } from '@repo/ui';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useShallow } from 'zustand/react/shallow';
import { MessagesRemainingBadge } from '../messages-remaining-badge';
import { ChatActions } from './chat-actions';
import { ChatEditor } from './chat-editor';
import { ImageAttachment } from './image-attachment';
import { ImageDropzoneRoot } from './image-dropzone-root';
export const ChatInput = ({
    showGreeting = true,
    showBottomBar = true,
}: {
    showGreeting?: boolean;
    showBottomBar?: boolean;
}) => {
    const { threadId: currentThreadId } = useParams();
    const { editor } = useChatEditor();
    const { attachment, clearAttachment, handleImageUpload, dropzonProps } = useImageAttachment();
    const getThreadItems = useChatStore(state => state.getThreadItems);
    const threadItemsLength = useChatStore(useShallow(state => state.threadItems.length));
    const { handleSubmit } = useAgentStream();
    const createThread = useChatStore(state => state.createThread);
    const useWebSearch = useChatStore(state => state.useWebSearch);

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
        <div className="w-full">
            <Flex
                direction="col"
                className="bg-background border-hard relative z-10 w-full rounded-2xl border"
            >
                <motion.div
                    variants={slideUpVariant}
                    initial="initial"
                    animate={editor?.isEditable ? 'animate' : 'initial'}
                    className="flex w-full flex-shrink-0 overflow-hidden rounded-xl"
                >
                    <ImageDropzoneRoot dropzoneProps={dropzonProps}>
                        <Flex direction="col" className="w-full">
                            <ImageAttachment
                                attachment={attachment}
                                clearAttachment={clearAttachment}
                            />
                            <Flex className="flex w-full flex-row items-end gap-0 p-3 md:pl-3">
                                <ChatEditor sendMessage={sendMessage} editor={editor} />
                            </Flex>
                            <ChatActions
                                sendMessage={sendMessage}
                                handleImageUpload={handleImageUpload}
                            />
                        </Flex>
                    </ImageDropzoneRoot>
                </motion.div>
            </Flex>
            {showBottomBar && (
                <div className="mx-1.5 -mt-2 flex h-10 flex-row items-center gap-2 rounded-b-2xl border-x border-b border-yellow-900/20 bg-yellow-700/5 px-2 pt-2">
                    <span className="px-2 text-xs font-light">
                        <MessagesRemainingBadge />
                    </span>
                </div>
            )}
        </div>
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
                    <div className="mb-8 flex w-full flex-col items-center gap-1">
                        <h1 className="font-sg text-foreground/50 text-3xl font-medium tracking-tight">
                            Good morning,
                        </h1>
                        <h1 className="font-sg text-foreground text-3xl font-medium tracking-tight">
                            How can i help you?
                        </h1>
                    </div>
                )}

                {renderChatBottom()}

                {/* <ChatFooter /> */}
            </Flex>
        </div>
    );
};
