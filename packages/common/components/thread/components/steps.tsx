import { StepRenderer } from '@repo/common/components';
import { Step, ThreadItem } from '@repo/shared/types';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@repo/ui/src/components/accordion';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

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
