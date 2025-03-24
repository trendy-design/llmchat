import { GoalWithSteps, ThreadItem as ThreadItemType, useChatStore } from '@/libs/store/chat.store';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui';
import { IconBook } from '@tabler/icons-react';
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

        const hasClarifyingQuestions = useMemo(() => {
            return (
                threadItem.answer?.object?.clarifyingQuestion &&
                threadItem.answer?.objectType === 'clarifyingQuestions'
            );
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
                        {threadItem.error && (
                            <Alert>
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{threadItem.error}</AlertDescription>
                            </Alert>
                        )}
                        {hasClarifyingQuestions && (
                            <QuestionPrompt
                                options={
                                    threadItem.answer?.object?.clarifyingQuestion?.options || []
                                }
                                question={
                                    threadItem.answer?.object?.clarifyingQuestion?.question || ''
                                }
                                type={
                                    threadItem.answer?.object?.clarifyingQuestion?.type || 'single'
                                }
                                threadId={threadItem.threadId}
                            />
                        )}
                        {(threadItem.answer?.final || threadItem.status === 'ABORTED') && (
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
            nextProps.threadItem.status === 'COMPLETED'
        );
    }
);

ThreadItem.displayName = 'ThreadItem';
