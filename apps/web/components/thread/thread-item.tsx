import { useAgentStream } from '@/hooks/agent-provider';
import { useCopyText } from '@/hooks/use-copy-text';
import { mdxComponents } from '@/libs/mdx/mdx-components';
import {
    ChatMode,
    GoalWithSteps,
    ThreadItem as ThreadItemType,
    ToolCall,
    ToolResult,
    useChatStore,
} from '@/libs/store/chat.store';
import { getHost } from '@/utils/url';
import {
    Badge,
    Button,
    cn,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogTitle,
    DialogTrigger,
    DropdownMenu,
    DropdownMenuTrigger,
    RadioGroup,
    RadioGroupItem,
    Textarea,
    WebsitePreview,
} from '@repo/ui';
import {
    IconArrowRight,
    IconCaretDownFilled,
    IconCheck,
    IconCopy,
    IconLink,
    IconPencil,
    IconQuestionMark,
    IconRefresh,
    IconSquare,
    IconTrash,
} from '@tabler/icons-react';
import { ChevronRight } from 'lucide-react';
import { MDXRemote } from 'next-mdx-remote';
import { MDXRemoteSerializeResult } from 'next-mdx-remote/rsc';
import { serialize } from 'next-mdx-remote/serialize';
import { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import remarkGfm from 'remark-gfm';
import { ChatModeOptions } from '../chat-input/chat-actions';
import { CodeBlock } from '../code-block/code-block';
import { ToolIcon, ToolResultIcon } from '../icons';
import { LinkFavicon } from '../link-favicon';
import { CitationProvider, CitationProviderContext } from './citation-provider';
import { GoalsRenderer } from './goals';

export const AIThreadItem = ({ content, className }: { content: string; className?: string }) => {
    const animatedText = content ?? '';
    const [serializedMdx, setSerializedMdx] = useState<MDXRemoteSerializeResult | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const mdx = await serialize(animatedText, {
                    mdxOptions: { remarkPlugins: [remarkGfm] },
                });
                setSerializedMdx(mdx);
            } catch (error) {
                console.error('Error serializing MDX:', error);
            }
        })();
    }, [animatedText]);

    if (!serializedMdx) {
        return null;
    }

    return (
        <>
            <div
                className={cn(
                    'animate-fade-in prose prose-sm prose-p:font-light prose-p:tracking-[0.01em] prose-headings:tracking-[0.005em] prose-prosetheme prose-headings:text-base prose-headings:font-medium prose-strong:font-medium prose-th:font-medium prose-code:font-mono prose-code:text-sm prose-code:font-normal prose-code:bg-secondary prose-code:border-border prose-code:border prose-code:rounded-lg prose-code:p-0.5 min-w-full',
                    className
                )}
            >
                <MDXRemote {...serializedMdx} components={mdxComponents} />
            </div>
        </>
    );
};

const MemoizedMdxChunk = memo(({ source }: { source: MDXRemoteSerializeResult }) => {
    if (!source) {
        return null;
    }
    return <MDXRemote {...source} components={mdxComponents} />;
});

MemoizedMdxChunk.displayName = 'MemoizedMdxChunk';

export const ThreadItem = memo(
    ({ threadItem }: { isAnimated: boolean; threadItem: ThreadItemType }) => {
        const setCurrentSources = useChatStore(state => state.setCurrentSources);
        const messageRef = useRef<HTMLDivElement>(null);
        const { copyToClipboard, status } = useCopyText();
        const [chatMode, setChatMode] = useState<ChatMode>(ChatMode.Deep);
        const { handleSubmit } = useAgentStream();
        const removeThreadItem = useChatStore(state => state.deleteThreadItem);
        const getThreadItems = useChatStore(state => state.getThreadItems);
        const useWebSearch = useChatStore(state => state.useWebSearch);

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

            // Extract only the content between the Source tags
            return sourceMatches.map(match => {
                const content = match.replace(/<Source>([^]*?)<\/Source>/, '$1').trim();
                return content;
            });
        }, [threadItem.answer?.text]);

        const toolCallAndResults = useMemo(() => {
            return Object.entries(threadItem?.toolCalls || {}).map(([key, toolCall]) => {
                const toolResult = threadItem?.toolResults?.[key];
                return {
                    toolCall,
                    toolResult,
                };
            });
        }, [threadItem?.toolCalls, threadItem?.toolResults]);

        return (
            <CitationProvider sources={allSources}>
                <>
                    {threadItem.query && <UserMessage message={threadItem.query} />}

                    <div className="flex w-full flex-col items-start gap-4">
                        <GoalsRenderer
                            goals={goalsWithSteps || []}
                            reasoning={threadItem?.reasoning}
                        />

                        {toolCallAndResults?.map(toolCallAndResult => (
                            <div className="flex flex-col gap-1">
                                <ToolCallRenderer toolCall={toolCallAndResult.toolCall} />
                                {toolCallAndResult.toolResult && (
                                    <ToolResultRenderer toolResult={toolCallAndResult.toolResult} />
                                )}
                            </div>
                        ))}
                        <Sources goals={goalsWithSteps || []} />
                        <SourcesDialog />

                        <div ref={messageRef} className="w-full">
                            {hasAnswer && threadItem.answer?.text && (
                                <AIThreadItem
                                    content={threadItem.answer?.text || ''}
                                    key={`answer-${threadItem.id}`}
                                />
                            )}
                        </div>
                        {hasClarifyingQuestions && (
                            <ClarifyingQuestions
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
                            <div className="flex flex-row items-center gap-2">
                                <Button
                                    variant="secondary"
                                    size="icon-sm"
                                    rounded="full"
                                    onClick={() => {
                                        if (messageRef.current) {
                                            copyToClipboard(messageRef.current);
                                        }
                                    }}
                                    tooltip={status === 'copied' ? 'Copied' : 'Copy'}
                                >
                                    {status === 'copied' ? (
                                        <IconCheck size={16} strokeWidth={2} />
                                    ) : (
                                        <IconCopy size={16} strokeWidth={2} />
                                    )}
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="secondary"
                                            size="icon-sm"
                                            rounded="full"
                                            tooltip="Rewrite"
                                        >
                                            <IconRefresh size={16} strokeWidth={2} />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <ChatModeOptions
                                        chatMode={chatMode}
                                        setChatMode={async mode => {
                                            setChatMode(mode);
                                            const formData = new FormData();
                                            formData.append('query', threadItem.query || '');
                                            const threadItems = await getThreadItems(
                                                threadItem.threadId
                                            );
                                            handleSubmit({
                                                formData,
                                                existingThreadItemId: threadItem.id,
                                                newChatMode: mode as any,
                                                messages: threadItems,
                                                useWebSearch: useWebSearch,
                                            });
                                        }}
                                    />
                                </DropdownMenu>
                                <Button
                                    variant="secondary"
                                    size="icon-sm"
                                    rounded="full"
                                    onClick={() => {
                                        removeThreadItem(threadItem.id);
                                    }}
                                    tooltip="Remove"
                                >
                                    <IconTrash size={16} strokeWidth={2} />
                                </Button>
                                <p className="text-muted-foreground text-xs">{threadItem.mode}</p>
                            </div>
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

type ToolCallRendererProps = {
    toolCall: ToolCall;
};

const ToolCallRenderer = memo(({ toolCall }: ToolCallRendererProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

    return (
        <div className="bg-background border-border flex flex-col items-start rounded-xl border px-2.5 pb-3 pt-3">
            <div
                className="flex w-full cursor-pointer flex-row items-center justify-between gap-2.5"
                onClick={toggleOpen}
            >
                <div className="flex flex-row items-center gap-2.5">
                    <ToolIcon />
                    <Badge>Tool Use</Badge>
                    <p className="text-foreground text-xs font-medium">{toolCall.toolName}</p>
                </div>
                <div className="pr-2">
                    <IconCaretDownFilled
                        size={14}
                        strokeWidth={2}
                        className={cn(
                            'text-muted-foreground transform transition-transform',
                            isOpen && 'rotate-180'
                        )}
                    />
                </div>
            </div>
            {isOpen && (
                <div className="mt-2 flex w-full flex-row items-center gap-2.5">
                    <CodeBlock
                        variant="secondary"
                        showHeader={false}
                        lang="json"
                        code={JSON.stringify(toolCall.args, null, 2)}
                    />
                </div>
            )}
        </div>
    );
});

type ToolResultRendererProps = {
    toolResult: ToolResult;
};

const ToolResultRenderer = memo(({ toolResult }: ToolResultRendererProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

    return (
        <div className="bg-background border-border flex flex-col items-start rounded-xl border px-2.5 pb-3 pt-3">
            <div
                className="flex w-full cursor-pointer flex-row items-center justify-between gap-2.5"
                onClick={toggleOpen}
            >
                <div className="flex flex-row items-center gap-2.5">
                    <ToolResultIcon />
                    <Badge>Tool Result</Badge>
                    <p className="text-foreground text-xs font-medium">{toolResult.toolName}</p>
                </div>
                <div className="pr-2">
                    <IconCaretDownFilled
                        size={14}
                        strokeWidth={2}
                        className={cn(
                            'text-muted-foreground transform transition-transform',
                            isOpen && 'rotate-180'
                        )}
                    />
                </div>
            </div>
            {isOpen && (
                <div className="mt-2 flex w-full flex-row items-center gap-2.5">
                    <CodeBlock
                        variant="secondary"
                        showHeader={false}
                        lang="json"
                        code={JSON.stringify(toolResult.result, null, 2)}
                    />
                </div>
            )}
        </div>
    );
});

type UserMessageProps = {
    message: string;
};

const UserMessage = memo(({ message }: UserMessageProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const messageRef = useRef<HTMLDivElement>(null);
    const [showExpandButton, setShowExpandButton] = useState(false);
    const { copyToClipboard, status } = useCopyText();
    const maxHeight = 200;

    useEffect(() => {
        if (messageRef.current) {
            setShowExpandButton(messageRef.current.scrollHeight > maxHeight);
        }
    }, [message]);

    const handleCopy = useCallback(() => {
        if (messageRef.current) {
            copyToClipboard(messageRef.current);
        }
    }, [copyToClipboard]);

    const toggleExpand = useCallback(() => setIsExpanded(prev => !prev), []);

    return (
        <div className="group flex w-full flex-col items-end gap-2 py-4">
            <div className="text-foreground relative max-w-[90%]">
                <div
                    ref={messageRef}
                    className="bg-background border-border relative overflow-hidden rounded-xl border px-4 py-3 text-base font-normal"
                    style={{
                        maxHeight: isExpanded ? 'none' : maxHeight,
                        transition: 'max-height 0.3s ease-in-out',
                    }}
                >
                    {message}
                    {showExpandButton && (
                        <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-col items-center">
                            <div className="via-background/85 to-background flex h-12 w-full items-center justify-end bg-gradient-to-b from-transparent px-2">
                                <Button
                                    variant="secondary"
                                    size="xs"
                                    rounded="full"
                                    className="pointer-events-auto relative z-10 px-4"
                                    onClick={toggleExpand}
                                >
                                    {isExpanded ? 'Show less' : 'Show more'}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex flex-row gap-2 py-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <Button
                    variant="secondary"
                    size="icon-sm"
                    rounded="full"
                    onClick={handleCopy}
                    tooltip={status === 'copied' ? 'Copied' : 'Copy'}
                >
                    {status === 'copied' ? (
                        <IconCheck size={14} strokeWidth={2} />
                    ) : (
                        <IconCopy size={14} strokeWidth={2} />
                    )}
                </Button>
                <Button variant="secondary" size="icon-sm" rounded="full" tooltip="Edit">
                    <IconPencil size={14} strokeWidth={2} />
                </Button>
            </div>
        </div>
    );
});

export const ClarifyingQuestions = ({
    options,
    question,
    type,
    threadId,
}: {
    options: string[];
    question: string;
    type: 'single' | 'multiple';
    threadId: string;
}) => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const [customOption, setCustomOption] = useState<string>('');
    const [isCustomSelected, setIsCustomSelected] = useState<boolean>(false);
    const { handleSubmit } = useAgentStream();
    const getThreadItems = useChatStore(state => state.getThreadItems);

    const handleOptionChange = (value: string) => {
        setSelectedOption(value);
        setIsCustomSelected(value === 'custom');
    };

    const renderRadioGroup = () => {
        return (
            <RadioGroup
                value={selectedOption || ''}
                onValueChange={handleOptionChange}
                className="flex flex-col gap-2"
            >
                {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={option} id={`option-${index}`} />
                        <p className="text-sm">{option}</p>
                    </div>
                ))}

                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="option-custom" />
                    <p className="text-sm">Custom option</p>
                </div>
            </RadioGroup>
        );
    };

    const renderCheckboxGroup = () => {
        return (
            <div className="flex flex-row flex-wrap gap-2">
                {options.map((option, index) => (
                    <div
                        key={index}
                        className="border-border flex items-center space-x-2 rounded-full border px-3 py-1.5"
                        onClick={() => {
                            if (selectedOptions.includes(option)) {
                                setSelectedOptions(selectedOptions.filter(o => o !== option));
                            } else {
                                setSelectedOptions([...selectedOptions, option]);
                            }
                        }}
                    >
                        {selectedOptions.includes(option) ? (
                            <IconCheck size={16} strokeWidth={2} className="text-brand" />
                        ) : (
                            <IconSquare
                                size={16}
                                strokeWidth={2}
                                className="text-muted-foreground/20"
                            />
                        )}
                        <p className="text-sm">{option}</p>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="border-border bg-background mt-2 flex w-full flex-col items-start gap-4 rounded-2xl border p-4">
            <div className="flex flex-row items-center gap-1">
                <IconQuestionMark size={16} strokeWidth={2} className="text-brand" />
                <p className="text-muted-foreground text-sm">Follow up Question</p>
            </div>

            <p className="text-base">{question}</p>

            {type === 'single' ? renderRadioGroup() : renderCheckboxGroup()}

            <div className="mt-2 w-full">
                <Textarea
                    value={customOption}
                    onChange={e => setCustomOption(e.target.value)}
                    placeholder="Enter additional feedback"
                    className="!border-border h-[100px] w-full rounded-lg !border px-3 py-2"
                />
            </div>

            <Button
                disabled={!selectedOption && !selectedOptions.length && !customOption}
                size="sm"
                rounded="full"
                onClick={async () => {
                    let query = '';
                    if (type === 'single') {
                        query = `${selectedOption} \n\n ${customOption}`;
                    } else {
                        query = `${selectedOptions.join(', ')} \n\n ${customOption}`;
                    }
                    const formData = new FormData();
                    formData.append('query', query);
                    const threadItems = await getThreadItems(threadId);
                    handleSubmit({
                        formData,
                        messages: threadItems,
                    });
                }}
            >
                Submit
            </Button>
        </div>
    );
};

export const SourcesDialog = () => {
    const { citations } = useContext(CitationProviderContext);
    const [isOpen, setIsOpen] = useState(false);
    if (Object.keys(citations).length === 0) {
        return null;
    }
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="bordered"
                    size="sm"
                    rounded="full"
                    tooltip="Sources"
                    className="gap-2"
                >
                    <IconLink size={16} strokeWidth={2} />
                    <div className="flex flex-row gap-1">
                        {Object.values(citations)
                            ?.slice(0, 4)
                            ?.map(citation => <LinkFavicon link={citation.url} size="sm" />)}
                    </div>
                    <ChevronRight size={16} strokeWidth={2} />
                </Button>
            </DialogTrigger>

            <DialogContent ariaTitle="Sources" className="border-none p-0">
                <DialogTitle className="p-4">Sources</DialogTitle>
                <div className="flex max-h-[50vh] flex-col gap-6 overflow-y-auto px-6 pb-6">
                    {Object.entries(citations).map(([url, citation]) => (
                        <div className="flex flex-row items-start gap-2">
                            <div className="text-muted-foreground group inline-flex size-5 shrink-0 flex-row items-center justify-center gap-1 rounded-sm text-xs">
                                {citation?.index}.
                            </div>

                            <WebsitePreview key={url} url={url} />
                        </div>
                    ))}
                </div>
                <DialogFooter className="border-t p-4">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setIsOpen(false);
                        }}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export const Sources = ({ goals }: { goals: GoalWithSteps[] }) => {
    const sources = goals.flatMap(goal =>
        goal.steps
            .filter(step => step.type === 'read')
            .flatMap(step => step.results?.map(result => result))
    );
    return (
        <div className="grid grid-cols-4 gap-2">
            {sources.slice(0, 3).map((source, index) => (
                <div
                    key={index}
                    className="bg-tertiary border-border flex flex-col justify-between gap-1 rounded-lg border p-3"
                >
                    <p className="line-clamp-2 text-xs font-medium">{source?.title}</p>
                    {source?.link && (
                        <div className="flex flex-row items-center gap-1">
                            <LinkFavicon link={source?.link} size="sm" />
                            <p className="text-muted-foreground text-xs">{getHost(source?.link)}</p>
                        </div>
                    )}
                </div>
            ))}
            {sources.length > 3 && (
                <div
                    key={4}
                    className="bg-tertiary border-border flex flex-col items-start gap-1 rounded-lg border p-3"
                >
                    <p className="text-muted-foreground flex flex-row items-center gap-1 text-xs">
                        <IconLink size={14} strokeWidth={2} />+{sources.length - 3} Sources
                    </p>
                    <div className="flex flex-row gap-1">
                        {sources
                            .slice(3)
                            .slice(0, 5)
                            .map((source, index) => (
                                <div key={index} className="flex flex-row items-center gap-1">
                                    <LinkFavicon link={source?.link} size="sm" />
                                </div>
                            ))}
                    </div>
                    <div className="flex-1" />
                    <Button variant="bordered" size="xs" rounded="full" tooltip="View all sources">
                        View all <IconArrowRight size={14} strokeWidth={2} />
                    </Button>
                </div>
            )}
        </div>
    );
};
