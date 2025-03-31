import { StepRenderer, StepStatus, ToolCallStep, ToolResultStep } from '@repo/common/components';
import { Step, ThreadItem, ToolCall, ToolResult } from '@repo/common/store';
import { ChatMode } from '@repo/shared/config';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Alert,
    AlertDescription,
} from '@repo/ui';
import {
    IconAtom,
    IconChecklist,
    IconInfoCircle,
    IconLoader2,
    IconNorthStar,
} from '@tabler/icons-react';
import { memo, useEffect, useMemo, useState } from 'react';

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
        return <IconAtom size={16} strokeWidth={2} className="text-muted-foreground" />;
    }
    if (threadItem.mode === ChatMode.Pro) {
        return <IconNorthStar size={16} strokeWidth={2} className="text-muted-foreground" />;
    }
    return <IconChecklist size={16} strokeWidth={2} className="text-muted-foreground" />;
};

const getNote = (threadItem: ThreadItem) => {
    if (threadItem.mode === ChatMode.Deep) {
        return 'This process takes approximately 15 minutes. Please keep the page open during this time.';
    }
    if (threadItem.mode === ChatMode.Pro) {
        return 'This process takes approximately 5 minutes. Please keep the page open during this time.';
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
    const [value, setValue] = useState<string | undefined>(undefined);

    const isStopped = threadItem.status === 'ABORTED' || threadItem.status === 'ERROR';

    const isLoading = steps.some(step => step.status === 'PENDING') && !isStopped;
    const hasAnswer = !!threadItem?.answer?.text;

    useEffect(() => {
        if (hasAnswer) {
            setValue(undefined);
        }
    }, [hasAnswer]);

    useEffect(() => {
        if (steps[0]?.status === 'PENDING') {
            setValue('workflow');
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

    if (steps.length === 0 && !toolCallAndResults.length) {
        return null;
    }

    return (
        <>
            <Accordion
                type="single"
                value={value}
                collapsible
                className="w-full"
                onValueChange={setValue}
            >
                <AccordionItem
                    value="workflow"
                    className="border-border overflow-hidden rounded-lg border p-0"
                >
                    <AccordionTrigger className="bg-background flex flex-row items-center gap-2 px-4 py-2.5">
                        <div className="flex w-full flex-row items-center gap-2">
                            {isLoading ? (
                                <IconLoader2
                                    size={16}
                                    strokeWidth={2}
                                    className="text-muted-foreground animate-spin"
                                />
                            ) : (
                                getIcon(threadItem)
                            )}
                            <p className="text-sm font-medium">{getTitle(threadItem)}</p>

                            <p className="!text-xs text-teal-600">
                                {stepCounts} {stepCounts === 1 ? 'Step' : 'Steps'}
                            </p>
                            <div className="flex-1" />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-background p-0">
                        {getNote(threadItem) && (
                            <Alert variant="default" className="rounded-none bg-yellow-300/10">
                                <AlertDescription className="font-normal text-yellow-700">
                                    <IconInfoCircle
                                        size={16}
                                        strokeWidth={2}
                                        className="font-normal text-yellow-700"
                                    />
                                    {getNote(threadItem)}
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="flex w-full flex-col overflow-hidden px-4 py-4">
                            {steps.map((step, index) => (
                                <StepRenderer key={index} step={step} />
                            ))}
                            {/* {toolCallAndResults.map(({ toolCall, toolResult }) => (
                                <ToolStep toolCall={toolCall} toolResult={toolResult} />
                            ))} */}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    );
};
