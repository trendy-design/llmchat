import { StepRenderer, StepStatus, ToolCallStep, ToolResultStep } from '@repo/common/components';
import { useAppStore } from '@repo/common/store';
import { ChatMode } from '@repo/shared/config';
import { Step, ThreadItem, ToolCall, ToolResult } from '@repo/shared/types';
import { Button } from '@repo/ui';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@repo/ui/src/components/accordion';
import { IconAtom, IconChecklist, IconNorthStar } from '@tabler/icons-react';
import { ChevronDown } from 'lucide-react';
import { memo, useEffect } from 'react';
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

    // useEffect(() => {
    //     if (steps[0]?.status === 'PENDING') {
    //         handleClick();
    //     }
    // }, [steps[0]]);

    const stepCounts = steps.length;

    // useEffect(() => {
    //     if (steps.length > 0) {
    //         updateSideDrawer({
    //             renderContent: () => (
    //                 <div className="flex w-full flex-1 flex-col px-2 py-4">
    //                     {steps.map((step, index) => (
    //                         <StepRenderer
    //                             key={index}
    //                             step={step}
    //                             isLastStep={index === steps.length - 1}
    //                         />
    //                     ))}
    //                 </div>
    //             ),
    //             badge: stepCounts,
    //             title: () => renderTitle(false),
    //         });
    //     }
    // }, [steps, threadItem?.status]);

    // const handleClick = () => {
    //     dismissSideDrawer();

    //     openSideDrawer({
    //         badge: stepCounts,
    //         title: () => renderTitle(false),
    //         renderContent: () => (
    //             <div className="flex w-full flex-1 flex-col px-2 py-4">
    //                 {steps.map((step, index) => (
    //                     <StepRenderer key={index} step={step} />
    //                 ))}
    //                 {/* {toolCallAndResults.map(({ toolCall, toolResult }) => (
    //                     <ToolStep toolCall={toolCall} toolResult={toolResult} />
    //                 ))} */}
    //             </div>
    //         ),
    //     });
    // };

    // const renderTitle = (useNote = true) => {
    //     return (
    //         <div className="flex flex-row items-start gap-2">
    //             <div className="mt-0.5">
    //                 {isLoading ? (
    //                     <IconLoader2
    //                         size={16}
    //                         strokeWidth={2}
    //                         className=" text-muted-foreground animate-spin"
    //                     />
    //                 ) : (
    //                     getIcon(threadItem)
    //                 )}
    //             </div>
    //             <div className="flex flex-col">
    //                 <p className="text-sm font-medium">{getTitle(threadItem)}</p>
    //                 {useNote && !hasAnswer && (
    //                     <p className="text-muted-foreground/70 text-xs">{getNote(threadItem)}</p>
    //                 )}
    //             </div>
    //         </div>
    //     );
    // };

    if (steps.length === 0) {
        return null;
    }

    return (
        <>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="steps" className="border-none px-0">
                    <AccordionTrigger>
                        <Button variant="ghost" size="sm" className="gap-2">
                            Steps <ChevronDown size={16} strokeWidth={2} />
                        </Button>
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
