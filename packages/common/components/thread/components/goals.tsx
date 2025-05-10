import { StepRenderer, StepStatus, ToolCallStep, ToolResultStep } from '@repo/common/components';
import { ChatMode } from '@repo/shared/config';
import { Step, ThreadItem, ToolCall, ToolResult } from '@repo/shared/types';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@repo/ui/src/components/accordion';
import { IconAtom, IconChecklist, IconNorthStar } from '@tabler/icons-react';
import { ChevronDown } from 'lucide-react';
import { memo, useEffect, useState } from 'react';
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

export const Steps = ({
    steps,
    threadItem,
    isCompleted,
}: {
    steps: Step[];
    threadItem: ThreadItem;
    isCompleted: boolean;
}) => {
    const hasAnswer =
        !!threadItem?.answer?.text &&
        (threadItem.status === 'COMPLETED' ||
            threadItem.status === 'ABORTED' ||
            threadItem.status === 'ERROR');

    console.log('hasAnswer', hasAnswer);

    useEffect(() => {
        if (hasAnswer) {
            console.log('dismissing side drawer');
        }
    }, [hasAnswer]);

    const [open, setOpen] = useState<string | undefined>(
        steps.length > 0 && !isCompleted ? 'steps' : undefined
    );

    useEffect(() => {
        if (steps.length > 0 && !isCompleted) {
            setOpen('steps');
        } else if (isCompleted) {
            setOpen(undefined);
        }
    }, [steps.length, isCompleted]);

    if (steps.length === 0) {
        return null;
    }

    return (
        <>
            <Accordion
                type="single"
                collapsible
                className="w-full"
                value={open}
                onValueChange={setOpen}
            >
                <AccordionItem value="steps" className="border-none px-0">
                    <AccordionTrigger showChevron={false} className="flex-none gap-1">
                        Steps{' '}
                        <ChevronDown
                            size={16}
                            strokeWidth={2}
                            className="!text-muted-foreground/50"
                        />
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="mb-16 flex w-full flex-1 flex-col">
                            {steps.map((step, index) => (
                                <StepRenderer
                                    key={index}
                                    step={step}
                                    isLastStep={index === steps.length - 1}
                                />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    );
};
