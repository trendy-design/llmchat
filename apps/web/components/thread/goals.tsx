import { GoalWithSteps, Reasoning } from '@/libs/store/chat.store';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui';
import { Fragment, memo, useEffect, useMemo, useState } from 'react';
import { StepRenderer } from './step-renderer';
import { StepStatus } from './step-status';

type GoalStepProps = {
    goal: GoalWithSteps;
};

const GoalStep = memo(({ goal }: GoalStepProps) => (
    <div className="flex w-full flex-row items-stretch justify-start gap-2">
        <div className="flex min-h-full shrink-0 flex-col items-center justify-start px-2">
            <div className="bg-border/50 h-1.5 shrink-0" />
            <div className="bg-secondary z-10">
                <StepStatus status={goal.status || 'PENDING'} />
            </div>
            <div className="bg-border/50 min-h-full w-[1px] flex-1" />
        </div>
        <div className="flex w-full flex-1 flex-col overflow-hidden pb-2">
            <Fragment>
                {!!goal.text && <p>{goal.text}</p>}
                {goal.steps?.map((step, index) => <StepRenderer key={index} step={step} />)}
            </Fragment>
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
            <div className="bg-secondary z-10">
                <StepStatus status="COMPLETED" />
            </div>
            <div className="bg-border/50 min-h-full w-[1px] flex-1" />
        </div>
        <div className="flex w-full flex-1 flex-col overflow-hidden pb-4">
            <p>{step}</p>
        </div>
    </div>
));

export const GoalsRenderer = ({
    goals,
    reasoning,
}: {
    goals: GoalWithSteps[];
    reasoning?: Reasoning;
}) => {
    const [value, setValue] = useState<string | undefined>(undefined);
    if (goals.length === 0 && !reasoning?.text) {
        return null;
    }

    const reasoningSteps = useMemo(() => {
        return reasoning?.text?.split('\n\n').map(line => line.trim()) ?? [];
    }, [reasoning]);

    const isLoading = goals.some(goal => goal.status === 'PENDING');
    const allCompleted = goals.every(goal => goal.status === 'COMPLETED');

    useEffect(() => {
        if (allCompleted) {
            setValue(undefined);
        }
    }, [allCompleted]);

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
                        <div className="flex flex-row items-center gap-2">
                            <p className="text-sm font-medium">Workflow</p>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="bg-background p-0">
                        <div className="flex w-full flex-col overflow-hidden px-4 py-4">
                            {goals.map((goal, index) => (
                                <GoalStep key={index} goal={goal} />
                            ))}
                            {reasoningSteps.map((step, index) => (
                                <ReasoningStep key={index} step={step} />
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </>
    );
};
