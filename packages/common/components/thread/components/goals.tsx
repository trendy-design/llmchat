import { StepRenderer, StepStatus, ToolCallStep, ToolResultStep } from '@repo/common/components';
import { useAppStore } from '@repo/common/store';
import { ChatMode } from '@repo/shared/config';
import { Step, ThreadItem, ToolCall, ToolResult } from '@repo/shared/types';
import { Badge } from '@repo/ui';
import {
    IconAtom,
    IconChecklist,
    IconChevronRight,
    IconLoader2,
    IconNorthStar,
} from '@tabler/icons-react';
import { memo, useEffect, useMemo } from 'react';
const getTitle = (threadItem: ThreadItem) => {
    if (threadItem.mode === ChatMode.Deep) {
        return 'Research';
    }
    if ([ChatMode.DEEPSEEK_R1].includes(threadItem.mode)) {
        return 'Thinking';
    }
    if (threadItem.mode === ChatMode.Pro) {
        return 'Pro Search';
    }
    return 'Steps';
};

const getIcon = (threadItem: ThreadItem) => {
    if (threadItem.mode === ChatMode.Deep) {
        return <IconAtom size={16} strokeWidth={2} className="text-emerald-800" />;
    }
    if (threadItem.mode === ChatMode.Pro) {
        return <IconNorthStar size={16} strokeWidth={2} className="text-emerald-800" />;
    }
    return <IconChecklist size={16} strokeWidth={2} className="text-emerald-800" />;
};

const getNote = (threadItem: ThreadItem) => {
    if (threadItem.mode === ChatMode.Deep) {
        return 'This process takes approximately 15 minutes. Please keep the tab open during this time.';
    }
    if (threadItem.mode === ChatMode.Pro) {
        return 'This process takes approximately 5 minutes. Please keep the tab open during this time.';
    }
    return '';
};

type ReasoningStepProps = {
    step: string;
};

type ToolStepProps = {
    toolCall?: ToolCall;
    toolResult?: ToolResult;
};

const ToolStep = memo(({ toolCall, toolResult }: ToolStepProps) => (
    <div className="flex w-full flex-row items-stretch justify-start gap-2">
        <div className="flex min-h-full flex-col items-center justify-start px-2">
            <div className="bg-border/50 h-1.5 shrink-0" />
            <div className="bg-background z-10">
                <StepStatus status="COMPLETED" />
            </div>
            <div className="bg-border/50 min-h-full w-[1px] flex-1" />
        </div>
        <div className="flex w-full flex-1 flex-col gap-2 overflow-hidden pb-2">
            <p className="text-sm">Using the following tool</p>
            {toolCall && <ToolCallStep toolCall={toolCall} />}
            {toolResult && <ToolResultStep toolResult={toolResult} />}
        </div>
    </div>
));

export const Steps = ({ steps, threadItem }: { steps: Step[]; threadItem: ThreadItem }) => {
    const openSideDrawer = useAppStore(state => state.openSideDrawer);
    const dismissSideDrawer = useAppStore(state => state.dismissSideDrawer);
    const updateSideDrawer = useAppStore(state => state.updateSideDrawer);

    const isStopped = threadItem.status === 'ABORTED' || threadItem.status === 'ERROR';

    const isLoading = steps.some(step => step.status === 'PENDING') && !isStopped;
    const hasAnswer =
        !!threadItem?.answer?.text &&
        (threadItem.status === 'COMPLETED' ||
            threadItem.status === 'ABORTED' ||
            threadItem.status === 'ERROR');

    console.log('hasAnswer', hasAnswer);

    useEffect(() => {
        if (hasAnswer) {
            console.log('dismissing side drawer');
            dismissSideDrawer();
        }
    }, [hasAnswer]);

    useEffect(() => {
        if (steps[0]?.status === 'PENDING') {
            handleClick();
        }
    }, [steps[0]]);

    const toolCallAndResults = useMemo(() => {
        return Object.entries(threadItem?.toolCalls || {}).map(([key, toolCall]) => {
            const toolResult = threadItem?.toolResults?.[key];
            return {
                toolCall,
                toolResult,
            };
        });
    }, [threadItem?.toolCalls, threadItem?.toolResults]);

    const stepCounts = steps.length;

    useEffect(() => {
        if (steps.length > 0) {
            updateSideDrawer({
                renderContent: () => (
                    <div className="flex w-full flex-1 flex-col px-2 py-4">
                        {steps.map((step, index) => (
                            <StepRenderer key={index} step={step} />
                        ))}
                    </div>
                ),
                badge: stepCounts,
                title: () => renderTitle(false),
            });
        }
    }, [steps, threadItem?.status]);

    const handleClick = () => {
        dismissSideDrawer();

        openSideDrawer({
            badge: stepCounts,
            title: () => renderTitle(false),
            renderContent: () => (
                <div className="flex w-full flex-1 flex-col px-2 py-4">
                    {steps.map((step, index) => (
                        <StepRenderer key={index} step={step} />
                    ))}
                    {/* {toolCallAndResults.map(({ toolCall, toolResult }) => (
                        <ToolStep toolCall={toolCall} toolResult={toolResult} />
                    ))} */}
                </div>
            ),
        });
    };

    const renderTitle = (useNote = true) => {
        return (
            <div className="flex flex-row items-start gap-2">
                <div className="mt-0.5">
                    {isLoading ? (
                        <IconLoader2
                            size={16}
                            strokeWidth={2}
                            className=" animate-spin text-emerald-800"
                        />
                    ) : (
                        getIcon(threadItem)
                    )}
                </div>
                <div className="flex flex-col">
                    <p className="text-sm font-medium">{getTitle(threadItem)}</p>
                    {useNote && !hasAnswer && (
                        <p className="text-muted-foreground text-xs">{getNote(threadItem)}</p>
                    )}
                </div>
            </div>
        );
    };

    if (steps.length === 0 && !toolCallAndResults.length) {
        return null;
    }

    return (
        <>
            <div
                className="bg-tertiary hover:bg-quaternary flex w-full cursor-pointer flex-row items-center gap-2 rounded-md px-3 py-2.5"
                onClick={() => {
                    handleClick();
                }}
            >
                {renderTitle()}
                <div className="flex-1" />

                <Badge variant="default" size="sm">
                    {stepCounts} {stepCounts === 1 ? 'Step' : 'Steps'}
                </Badge>
                <IconChevronRight size={14} strokeWidth={2} />
            </div>
        </>
    );
};
