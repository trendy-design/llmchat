import { StepRenderer, StepStatus, ToolCallStep, ToolResultStep } from '@repo/common/components';
import { GoalWithSteps, Reasoning, ThreadItem, ToolCall, ToolResult } from '@repo/common/store';
import { ChatMode } from '@repo/shared/config';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
    Alert,
    AlertDescription,
} from '@repo/ui';
import { IconChecklist, IconInfoCircle, IconLoader2 } from '@tabler/icons-react';
import { memo, useEffect, useMemo, useState } from 'react';

type GoalStepProps = {
    goal: GoalWithSteps;
};

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

const getNote = (threadItem: ThreadItem) => {
    if (threadItem.mode === ChatMode.Deep) {
        return "This may take some time around 15 minutes. Don't refresh the page. or Close the tab.";
    }
    if (threadItem.mode === ChatMode.Pro) {
        return "This may take some time around 5 minutes. Don't refresh the page. or Close the tab.";
    }
    return '';
};

const GoalStep = memo(({ goal }: GoalStepProps) => (
    <div className="flex w-full flex-row items-stretch justify-start gap-2">
        <div className="flex min-h-full shrink-0 flex-col items-center justify-start px-2">
            <div className="bg-border/50 h-1.5 shrink-0" />
            <div className="bg-background z-10">
                <StepStatus status={goal.status || 'PENDING'} />
            </div>
            <div className="border-border min-h-full w-[1px] flex-1 border-l border-dashed" />
        </div>
        <div className="flex w-full flex-1 flex-col gap-2 overflow-hidden pb-2 pr-2">
            {!!goal.text && <p>{goal.text}</p>}
            {goal.steps?.map((step, index) => <StepRenderer key={index} step={step} />)}
        </div>
    </div>
));

type ReasoningStepProps = {
    step: string;
};

const ReasoningStep = memo(({ step }: ReasoningStepProps) => (
    <div className="flex w-full flex-row items-stretch justify-start gap-2">
        <div className="flex min-h-full flex-col items-center justify-start px-2">
            <div className="bg-border/50 h-1.5 shrink-0" />
            <div className="bg-background z-10">
                <StepStatus status="COMPLETED" />
            </div>
            <div className="border-border min-h-full w-[1px] flex-1 border-l border-dashed" />
        </div>
        <div className="flex w-full flex-1 flex-col overflow-hidden pb-4 pr-2">
            <p className="text-sm">{step}</p>
        </div>
    </div>
));

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
            <p className="text-sm">I'll use the following tool</p>
            {toolCall && <ToolCallStep toolCall={toolCall} />}
            {toolResult && <ToolResultStep toolResult={toolResult} />}
        </div>
    </div>
));

export const GoalsRenderer = ({
    goals,
    reasoning,
    threadItem,
}: {
    goals: GoalWithSteps[];
    reasoning?: Reasoning;
    threadItem: ThreadItem;
}) => {
    const [value, setValue] = useState<string | undefined>(undefined);

    const reasoningSteps = useMemo(() => {
        return reasoning?.text?.split('\n\n').map(line => line.trim()) ?? [];
    }, [reasoning]);

    const isLoading = goals.some(goal => goal.status === 'PENDING');
    const allCompleted = goals.every(goal => goal.status === 'COMPLETED');
    const hasAnswer = !!threadItem?.answer?.text;

    useEffect(() => {
        if (allCompleted || hasAnswer) {
            setValue(undefined);
        }
    }, [allCompleted, hasAnswer]);

    useEffect(() => {
        if (goals[0]?.status === 'PENDING') {
            setValue('workflow');
        }
    }, [goals[0]]);

    useEffect(() => {
        if (reasoningSteps[0]) {
            setValue('workflow');
        }
    }, [reasoningSteps[0]]);

    const toolCallAndResults = useMemo(() => {
        return Object.entries(threadItem?.toolCalls || {}).map(([key, toolCall]) => {
            const toolResult = threadItem?.toolResults?.[key];
            return {
                toolCall,
                toolResult,
            };
        });
    }, [threadItem?.toolCalls, threadItem?.toolResults]);

    const stepCounts = toolCallAndResults.length + reasoningSteps.length + goals.length;

    if (goals.length === 0 && !reasoning?.text && !toolCallAndResults.length) {
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
                    className="border-border overflow-hidden rounded-xl border p-0"
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
                                <IconChecklist
                                    size={18}
                                    strokeWidth={2}
                                    className="text-muted-foreground"
                                />
                            )}
                            <p className="text-sm font-medium">{getTitle(threadItem)}</p>
                            <div className="flex-1" />
                            <p className="text-muted-foreground !text-xs">
                                {stepCounts} {stepCounts === 1 ? 'Step' : 'Steps'}
                            </p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-background p-0">
                        {getNote(threadItem) && (
                            <Alert variant="default" className="rounded-none">
                                <AlertDescription className="text-muted-foreground/70 font-normal">
                                    <IconInfoCircle
                                        size={16}
                                        strokeWidth={2}
                                        className="text-muted-foreground/70 font-normal"
                                    />
                                    {getNote(threadItem)}
                                </AlertDescription>
                            </Alert>
                        )}
                        <div className="flex w-full flex-col overflow-hidden px-4 py-4">
                            {goals.map((goal, index) => (
                                <GoalStep key={index} goal={goal} />
                            ))}
                            {reasoningSteps.map((step, index) => (
                                <ReasoningStep key={index} step={step} />
                            ))}
                            {toolCallAndResults.map(({ toolCall, toolResult }) => (
                                <ToolStep toolCall={toolCall} toolResult={toolResult} />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    );
};
