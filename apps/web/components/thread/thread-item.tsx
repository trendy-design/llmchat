import { GoalWithSteps, ThreadItem as ThreadItemType, useChatStore } from '@/libs/store/chat.store';
import { Alert, AlertDescription } from '@repo/ui';
import { IconAlertCircle, IconBook } from '@tabler/icons-react';
import { memo, useEffect, useMemo, useRef } from 'react';
import { CitationProvider } from './citation-provider';
import { GoalsRenderer } from './components/goals';
import { MarkdownContent } from './components/markdown-content';
import { Message } from './components/message';
import { MessageActions } from './components/message-actions';
import { QuestionPrompt } from './components/question-prompt';
import { SourceGrid } from './components/source-grid';

export const ThreadItem = memo(
    ({ threadItem }: { isAnimated: boolean; threadItem: ThreadItemType }) => {
        const setCurrentSources = useChatStore(state => state.setCurrentSources);
        const messageRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const sources =
                threadItem.steps
                    ?.filter(step => step.type === 'read')
                    .flatMap(step => step.results?.map(result => result.link))
                    .filter((link): link is string => link !== undefined) || [];
            return setCurrentSources(sources);
        }, [threadItem]);

        const goalsWithSteps: GoalWithSteps[] = useMemo(() => {
            return (
                threadItem.goals?.map(goal => ({
                    ...goal,
                    steps: threadItem.steps?.filter(step => step.goalId === goal.id) || [],
                })) || []
            );
        }, [threadItem.goals, threadItem.steps]);

        const hasAnswer = useMemo(() => {
            return threadItem.answer?.text && threadItem.answer?.text.length > 0;
        }, [threadItem.answer]);

        const allSources = useMemo(() => {
            const sourceMatches =
                threadItem.answer?.text?.match(/<Source>([^]*?)<\/Source>/g) || [];

            return sourceMatches.map(match => {
                const content = match.replace(/<Source>([^]*?)<\/Source>/, '$1').trim();
                return content;
            });
        }, [threadItem.answer?.text]);

        return (
            <CitationProvider sources={allSources}>
                <>
                    {threadItem.query && <Message message={threadItem.query} />}

                    <div className="flex w-full flex-col items-start gap-4 pt-8">
                        <GoalsRenderer
                            goals={goalsWithSteps || []}
                            reasoning={threadItem?.reasoning}
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
                                    <SourceGrid goals={goalsWithSteps || []} />

                                    <MarkdownContent
                                        content={threadItem.answer?.text || ''}
                                        key={`answer-${threadItem.id}`}
                                    />
                                </div>
                            )}
                        </div>
                        <QuestionPrompt threadItem={threadItem} />
                        {threadItem.error && (
                            <Alert variant="destructive">
                                <AlertDescription>
                                    <IconAlertCircle className="mt-0.5 size-3.5" />
                                    Something went wrong while processing your request. Please try
                                    again.
                                </AlertDescription>
                            </Alert>
                        )}
                        {(threadItem.answer?.final ||
                            threadItem.status === 'ABORTED' ||
                            threadItem.status === 'ERROR') && (
                            <MessageActions threadItem={threadItem} />
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
