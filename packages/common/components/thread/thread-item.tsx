import {
    CitationProvider,
    MarkdownContent,
    Message,
    MessageActions,
    QuestionPrompt,
    SourceGrid,
    Steps,
} from '@repo/common/components';
import { ThreadItem as ThreadItemType, useChatStore } from '@repo/common/store';
import { Alert, AlertDescription, cn, Skeleton } from '@repo/ui';
import { IconAlertCircle, IconBook } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { memo, useEffect, useMemo, useRef } from 'react';

export const ThreadItem = memo(
    ({
        threadItem,
        isGenerating,
    }: {
        isAnimated: boolean;
        threadItem: ThreadItemType;
        isGenerating: boolean;
    }) => {
        const setCurrentSources = useChatStore(state => state.setCurrentSources);
        const messageRef = useRef<HTMLDivElement>(null);

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

        return (
            <CitationProvider sources={threadItem.sources || []}>
                <>
                    {/* <CodeBlock code={JSON.stringify(threadItem, null, 2)} lang="json" /> */}
                    <div className={cn('flex w-full flex-col items-start gap-6 pt-4')}>
                        {threadItem.query && <Message message={threadItem.query} />}

                        {threadItem.status === 'QUEUED' && (
                            <div className="flex w-full flex-col items-start gap-2 opacity-10">
                                <MotionSkeleton className="bg-muted-foreground/40 mb-2 h-4 !w-[100px] rounded-md" />
                                <MotionSkeleton className="w-full bg-gradient-to-r" />
                                <MotionSkeleton className="w-[70%] bg-gradient-to-r" />
                                <MotionSkeleton className="w-[50%] bg-gradient-to-r" />
                            </div>
                        )}
                        <Steps
                            steps={Object.values(threadItem?.steps || {})}
                            threadItem={threadItem}
                        />

                        <div ref={messageRef} className="w-full">
                            {hasAnswer && threadItem.answer?.text && (
                                <div className="flex flex-col">
                                    <div className="text-muted-foreground flex flex-row items-center gap-1.5 py-2 text-xs font-medium">
                                        <IconBook
                                            size={16}
                                            strokeWidth={2}
                                            className="text-muted-foreground"
                                        />
                                        Answer
                                    </div>
                                    <SourceGrid sources={threadItem.sources || []} />

                                    <MarkdownContent
                                        content={threadItem.answer?.text || ''}
                                        key={`answer-${threadItem.id}`}
                                        shouldAnimate={
                                            !['COMPLETED', 'ERROR', 'ABORTED'].includes(
                                                threadItem.status || ''
                                            )
                                        }
                                    />
                                </div>
                            )}
                        </div>
                        <QuestionPrompt threadItem={threadItem} />
                        {threadItem.error && (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    <IconAlertCircle className="mt-0.5 size-3.5" />
                                    {threadItem.error ??
                                        'Something went wrong while processing your request. Please try again.'}
                                </AlertDescription>
                            </Alert>
                        )}
                        {(threadItem.status === 'COMPLETED' ||
                            threadItem.status === 'ABORTED' ||
                            threadItem.status === 'ERROR' ||
                            !isGenerating) && (
                            <MessageActions threadItem={threadItem} ref={messageRef} />
                        )}
                    </div>
                </>
            </CitationProvider>
        );
    },
    (prevProps, nextProps) => {
        return (
            prevProps.threadItem.id === nextProps.threadItem.id &&
            nextProps.threadItem.status === 'COMPLETED' &&
            nextProps.threadItem.answer === prevProps.threadItem.answer
        );
    }
);

ThreadItem.displayName = 'ThreadItem';

export const MotionSkeleton = ({ className }: { className?: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, width: '0%' }}
            animate={{ opacity: 1, width: '100%' }}
            exit={{ opacity: 0, width: '0%' }}
            transition={{ duration: 2, ease: 'easeInOut', damping: 50, stiffness: 20 }}
        >
            <Skeleton
                className={cn(
                    'from-muted-foreground/50 via-muted-foreground/30 to-muted-foreground/10 h-5 w-full bg-gradient-to-r',
                    className
                )}
            />
        </motion.div>
    );
};
