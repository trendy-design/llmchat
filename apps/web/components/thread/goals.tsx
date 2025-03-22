import { GoalWithSteps, Reasoning } from '@/libs/store/chat.store';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@repo/ui';
import { Fragment, memo, useMemo } from 'react';
import { StepRenderer } from './step-renderer';
import { StepStatus } from './step-status';

type GoalStepProps = {
  goal: GoalWithSteps
}

const GoalStep = memo(({ goal }: GoalStepProps) => (
  <div className="flex flex-row items-stretch justify-start gap-2 w-full">
    <div className="flex min-h-full flex-col items-center justify-start shrink-0 px-2">
      <div className="bg-border/50 h-1.5 shrink-0" />
      <div className="z-10 bg-secondary">
        <StepStatus status={goal.status || 'PENDING'} />
      </div>
      <div className="bg-border/50 min-h-full w-[1px] flex-1" />
    </div>
    <div className="flex flex-col pb-4 w-full flex-1 overflow-hidden">
      <Fragment>
        {goal.text && <p>{goal.text}</p>}
        {goal.steps?.map((step, index) => (
          <StepRenderer key={index} step={step} />
        ))}
      </Fragment>
    </div>
  </div>
))

type ReasoningStepProps = {
  step: string
}

const ReasoningStep = memo(({ step }: ReasoningStepProps) => (
  <div className="flex flex-row items-stretch justify-start gap-2 w-full">
    <div className="flex min-h-full flex-col items-center justify-start px-2">
      <div className="bg-border/50 h-1.5 shrink-0" />
      <div className="z-10 bg-secondary">
        <StepStatus status="COMPLETED" />
      </div>
      <div className="bg-border/50 min-h-full w-[1px] flex-1" />
    </div>
    <div className="flex flex-col pb-4 w-full flex-1 overflow-hidden">
      <p>{step}</p>
    </div>
  </div>
))

export const GoalsRenderer = ({ goals, reasoning }: { goals: GoalWithSteps[], reasoning?: Reasoning }) => {

  if(goals.length === 0 && !reasoning?.text) {
    return null;
  }

  const reasoningSteps = useMemo(() => {
    return reasoning?.text?.split('\n\n').map((line) => line.trim()) ?? [];
  }, [reasoning]);

  const isLoading = goals.some(goal => goal.status === 'PENDING');
  return (
    <>
    {/* <Button variant="bordered" size="xs" className="p-0" onClick={() => setDebugMode(!debugMode)}>
      {debugMode ? 'Hide Workflow' : 'Show Workflow'}
    </Button> */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="workflow" className="rounded-xl overflow-hidden border border-border p-0">
          <AccordionTrigger className="flex flex-row bg-background items-center gap-2 py-2.5 px-4">
            <div className="flex flex-row items-center gap-2">
              <p className="text-sm font-medium">Reasoning</p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-0 bg-background">
            <div className="flex flex-col py-4 px-4 w-full overflow-hidden">
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
