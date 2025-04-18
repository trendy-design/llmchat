import {
    CitationProvider,
    CodeBlock,
    FollowupSuggestions,
    MarkdownContent,
    Message,
    MessageActions,
    MotionSkeleton,
    QuestionPrompt,
    SourceGrid,
    Steps,
    ToolCallIcon,
} from '@repo/common/components';
import { useAgentStream, useAnimatedText } from '@repo/common/hooks';
import { useChatStore } from '@repo/common/store';
import { AnswerMessage, ThreadItem as ThreadItemType } from '@repo/shared/types';
import { Alert, AlertDescription, Button, cn } from '@repo/ui';
import {
    IconAlertCircle,
    IconBook,
    IconCheck,
    IconChevronUp,
    IconLoader,
} from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
export const ThreadItem = memo(
    ({
        threadItem,
        isGenerating,
        isLast,
    }: {
        isAnimated: boolean;
        threadItem: ThreadItemType;
        isGenerating: boolean;
        isLast: boolean;
    }) => {
        const { isAnimationComplete, text: animatedText } = useAnimatedText(
            threadItem.answer?.text || '',
            isLast && isGenerating
        );
        const setCurrentSources = useChatStore(state => state.setCurrentSources);
        const messageRef = useRef<HTMLDivElement>(null);

        const { ref: inViewRef, inView } = useInView({});

        useEffect(() => {
            if (inView && threadItem.id) {
                useChatStore.getState().setActiveThreadItemView(threadItem.id);
            }
        }, [inView, threadItem.id]);

        useEffect(() => {
            const sources =
                Object.values(threadItem.steps || {})
                    ?.filter(
                        step =>
                            step.steps && 'read' in step?.steps && !!step.steps?.read?.data?.length
                    )
                    .flatMap(step => step.steps?.read?.data?.map((result: any) => result.link))
                    .filter((link): link is string => link !== undefined) || [];
            return setCurrentSources(sources);
        }, [threadItem]);

        const hasAnswer = useMemo(() => {
            return threadItem.answer?.text && threadItem.answer?.text.length > 0;
        }, [threadItem.answer]);

        const hasResponse = useMemo(() => {
            return (
                !!threadItem?.steps ||
                !!threadItem?.answer?.text ||
                !!threadItem?.object ||
                !!threadItem?.error ||
                !!threadItem?.answer?.messages?.length ||
                threadItem?.status === 'COMPLETED' ||
                threadItem?.status === 'ABORTED' ||
                threadItem?.status === 'ERROR'
            );
        }, [threadItem]);
        return (
            <CitationProvider sources={threadItem.sources || []}>
                <div className="w-full" ref={inViewRef} id={`thread-item-${threadItem.id}`}>
                    <div className={cn('flex w-full flex-col items-start gap-3 pt-4')}>
                        {threadItem.query && (
                            <Message
                                message={threadItem.query}
                                imageAttachment={threadItem?.imageAttachment}
                                threadItem={threadItem}
                            />
                        )}

                        <div className="text-muted-foreground flex flex-row items-center gap-1.5 text-xs font-medium">
                            <IconBook size={16} strokeWidth={2} />
                            Answer
                        </div>

                        {threadItem.steps && (
                            <Steps
                                steps={Object.values(threadItem?.steps || {})}
                                threadItem={threadItem}
                            />
                        )}

                        <ToolCallUI
                            message={threadItem.answer?.messages || []}
                            threadItem={threadItem}
                        />

                        <div ref={messageRef} className="w-full">
                            {hasAnswer && threadItem.answer?.text && (
                                <div className="flex flex-col">
                                    <SourceGrid sources={threadItem.sources || []} />

                                    <MarkdownContent
                                        content={animatedText || ''}
                                        key={`answer-${threadItem.id}`}
                                        isCompleted={['COMPLETED', 'ERROR', 'ABORTED'].includes(
                                            threadItem.status || ''
                                        )}
                                        shouldAnimate={
                                            !['COMPLETED', 'ERROR', 'ABORTED'].includes(
                                                threadItem.status || ''
                                            )
                                        }
                                        isLast={isLast}
                                    />
                                </div>
                            )}
                        </div>
                        <QuestionPrompt threadItem={threadItem} />
                        {threadItem.error && (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    <IconAlertCircle className="mt-0.5 size-3.5" />
                                    {typeof threadItem.error === 'string'
                                        ? threadItem.error
                                        : 'Something went wrong while processing your request. Please try again.'}
                                </AlertDescription>
                            </Alert>
                        )}

                        {threadItem.status === 'ABORTED' && (
                            <Alert variant="warning">
                                <AlertDescription>
                                    <IconAlertCircle className="mt-0.5 size-3.5" />
                                    {threadItem.error ?? 'Generation stopped'}
                                </AlertDescription>
                            </Alert>
                        )}
                        {!hasResponse && (
                            <div className="flex w-full flex-col items-start gap-2 opacity-10">
                                <MotionSkeleton className="bg-muted-foreground/40 mb-2 h-4 !w-[100px] rounded-sm" />
                                <MotionSkeleton className="w-full bg-gradient-to-r" />
                                <MotionSkeleton className="w-[70%] bg-gradient-to-r" />
                                <MotionSkeleton className="w-[50%] bg-gradient-to-r" />
                            </div>
                        )}

                        {isAnimationComplete &&
                            (threadItem.status === 'COMPLETED' ||
                                threadItem.status === 'ABORTED' ||
                                threadItem.status === 'ERROR' ||
                                !isGenerating) && (
                                <MessageActions
                                    threadItem={threadItem}
                                    ref={messageRef}
                                    isLast={isLast}
                                />
                            )}
                        {isAnimationComplete && isLast && (
                            <FollowupSuggestions suggestions={threadItem.suggestions || []} />
                        )}
                    </div>
                </div>
            </CitationProvider>
        );
    },
    (prevProps, nextProps) => {
        return JSON.stringify(prevProps.threadItem) === JSON.stringify(nextProps.threadItem);
    }
);

ThreadItem.displayName = 'ThreadItem';
export const ToolCallUI = ({
    message,
    threadItem,
}: {
    message: AnswerMessage[];
    threadItem: ThreadItemType;
}) => {
    const { handleSubmit } = useAgentStream();
    const getThreadItems = useChatStore(state => state.getThreadItems);
    const useWebSearch = useChatStore(state => state.useWebSearch);

    const handleRun = async () => {
        const formData = new FormData();
        formData.append('query', threadItem.query || '');
        const threadItems = await getThreadItems(threadItem.threadId);
        handleSubmit({
            formData,
            existingThreadItemId: threadItem.id,
            newChatMode: threadItem.mode as any,
            messages: threadItems,
            useWebSearch: useWebSearch,
            breakpointId: threadItem.id,
            breakpointData: {},
        });
    };

    const toolResultMap = useMemo(() => {
        const map: Record<string, AnswerMessage & { type: 'tool-result' }> = {};
        message.forEach(m => {
            if (m.type === 'tool-result' && m.toolCallId) {
                map[m.toolCallId] = m as AnswerMessage & { type: 'tool-result' };
            }
        });
        return map;
    }, [message]);

    const filteredMessages = useMemo(() => {
        return message.filter(m => m.type !== 'tool-result');
    }, [message]);

    return (
        <div className="flex w-full flex-col gap-6">
            {filteredMessages.map((m, i) => {
                if (m.type === 'tool-call') {
                    return (
                        <ToolMessage
                            key={m.toolCallId}
                            tool={{
                                toolCall: m as AnswerMessage & { type: 'tool-call' },
                                toolResult: toolResultMap[m.toolCallId],
                            }}
                            handleRun={handleRun}
                        />
                    );
                }
                if (m.type === 'text') {
                    return (
                        <MarkdownContent
                            key={`text-${threadItem.id}-${i}`}
                            content={m.text || ''}
                            isCompleted={['COMPLETED', 'ERROR', 'ABORTED'].includes(
                                threadItem.status || ''
                            )}
                            shouldAnimate={
                                !['COMPLETED', 'ERROR', 'ABORTED'].includes(threadItem.status || '')
                            }
                            isLast={false}
                        />
                    );
                }
                return null;
            })}
        </div>
    );
};

export const ToolMessage = ({
    tool,
    handleRun,
}: {
    tool: {
        toolCall?: AnswerMessage & {
            type: 'tool-call';
        };
        toolResult?: AnswerMessage & {
            type: 'tool-result';
        };
    };
    handleRun: () => void;
}) => {
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div
            key={tool.toolCall?.toolCallId}
            className="bg-tertiary border-hard flex w-full flex-col rounded-xl border p-1"
        >
            <div className="flex h-8 flex-row items-center justify-between px-1.5">
                <div
                    className="flex flex-row items-center gap-2"
                    onClick={() => setIsOpen(prev => !prev)}
                >
                    <IconChevronUp
                        size={14}
                        strokeWidth={2}
                        className={cn(
                            'text-muted-foreground/50 transition-transform duration-300',
                            isOpen ? 'rotate-180' : 'rotate-90'
                        )}
                    />

                    <div className="flex flex-row items-center gap-1">
                        <ToolCallIcon />
                        <p className="flex flex-row items-center gap-1 text-xs font-medium">
                            {tool.toolCall?.toolName}
                        </p>
                    </div>
                </div>

                {tool.toolCall?.approvalStatus === 'RUNNING' && (
                    <div className="text-muted-foreground flex flex-row items-center gap-1.5 text-xs font-medium ">
                        <IconLoader size={14} strokeWidth={2} className="animate-spin" />
                        Running
                    </div>
                )}

                {tool.toolCall?.approvalStatus === 'AUTO_APPROVED' && (
                    <div className="text-muted-foreground flex flex-row items-center gap-1.5 text-xs font-medium ">
                        <IconCheck size={14} strokeWidth={2} className="text-muted-foreground/50" />{' '}
                        Auto
                    </div>
                )}
                {tool.toolCall?.approvalStatus === 'PENDING' && (
                    <div className="flex flex-row gap-1">
                        <Button
                            variant="bordered"
                            size="xs"
                            onClick={() => {
                                console.log('reject');
                            }}
                        >
                            Reject
                        </Button>
                        <Button
                            variant="default"
                            size="xs"
                            onClick={() => {
                                setIsSubmitted(true);
                                handleRun();
                            }}
                        >
                            {isSubmitted && (
                                <IconLoader size={14} strokeWidth={2} className="animate-spin" />
                            )}
                            {isSubmitted ? 'Running...' : 'Run Tool'}
                        </Button>
                    </div>
                )}
                {tool.toolCall?.approvalStatus === 'APPROVED' && (
                    <div className="text-muted-foreground flex flex-row items-center gap-1.5 text-xs font-medium ">
                        <IconCheck size={14} strokeWidth={2} className="text-muted-foreground/50" />
                    </div>
                )}
            </div>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: isOpen ? 1 : 0, height: isOpen ? 'auto' : 0 }}
                transition={{ duration: 0.1 }}
                className={cn('flex flex-col gap-1', isOpen ? 'pt-1' : 'pt-0')}
            >
                <CodeBlock
                    code={JSON.stringify(tool.toolCall?.args, null, 2)}
                    lang="json"
                    showHeader={false}
                    className="my-0"
                />

                {/* Show tool result directly below if it exists */}
                {tool.toolResult && (
                    <CodeBlock
                        code={JSON.stringify(tool.toolResult.result, null, 2)}
                        lang="json"
                        showHeader={false}
                        className="my-0"
                    />
                )}
            </motion.div>
        </div>
    );
};
