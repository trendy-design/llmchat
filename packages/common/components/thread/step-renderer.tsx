import { SearchResultsList, StepStatus, TextShimmer } from '@repo/common/components';
import { Step } from '@repo/shared/types';
import { Badge } from '@repo/ui';
import { IconSearch } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import React from 'react';

export type StepRendererType = {
    step: Step;
};

export const StepRenderer = ({ step }: StepRendererType) => {
    console.log(step);
    const renderTextStep = () => {
        if (step?.text) {
            return (
                <motion.p
                    className="text-muted-foreground text-sm"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                >
                    {step.text}
                </motion.p>
            );
        }
        return null;
    };

    const renderSearchStep = () => {
        if (step?.steps && 'search' in step?.steps) {
            return (
                <motion.div
                    className="flex flex-col gap-1"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <div className="flex flex-col gap-2">
                        <div className="w-[100px]">
                            <TextShimmer
                                duration={0.7}
                                spread={step.steps?.search?.status === 'COMPLETED' ? 0 : 2}
                                className="text-xs"
                            >
                                Searching
                            </TextShimmer>
                        </div>

                        <div className="flex flex-row flex-wrap gap-1">
                            {Array.isArray(step.steps?.search?.data) &&
                                step.steps?.search?.data?.map((query: string, index: number) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2, delay: 0.1 + index * 0.05 }}
                                    >
                                        <Badge>
                                            <IconSearch size={12} className="opacity-50" />
                                            {query}
                                        </Badge>
                                    </motion.div>
                                ))}
                        </div>
                    </div>
                </motion.div>
            );
        }
    };

    const renderReadStep = () => {
        if (step?.steps && 'read' in step.steps) {
            return (
                <motion.div
                    className="flex flex-col gap-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                >
                    <div className="w-[100px]">
                        <TextShimmer
                            duration={0.7}
                            spread={step.steps?.read?.status === 'COMPLETED' ? 0 : 2}
                            className="text-xs"
                        >
                            Reading
                        </TextShimmer>
                    </div>
                    <SearchResultsList
                        sources={Array.isArray(step.steps?.read?.data) ? step.steps.read.data : []}
                    />
                </motion.div>
            );
        }
        return null;
    };

    const renderReasoningStep = () => {
        if (step?.steps && 'reasoning' in step.steps) {
            const reasoningData =
                typeof step.steps?.reasoning?.data === 'string' ? step.steps.reasoning.data : '';

            return (
                <motion.div
                    className="flex flex-col gap-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                >
                    <div className="w-[100px]">
                        <TextShimmer
                            duration={0.7}
                            spread={step.steps?.reasoning?.status === 'COMPLETED' ? 0 : 2}
                            className="text-xs"
                        >
                            Analyzing
                        </TextShimmer>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        {reasoningData.split('\n\n').map((line: string, index: number) => (
                            <React.Fragment key={index}>
                                <span>{line}</span>
                                <br />
                                <br />
                            </React.Fragment>
                        ))}
                    </p>
                </motion.div>
            );
        }
        return null;
    };

    const renderWrapupStep = () => {
        if (step?.steps && 'wrapup' in step.steps) {
            return (
                <motion.div
                    className="flex flex-col gap-2"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                >
                    <div className="w-[100px]">
                        <TextShimmer
                            duration={0.7}
                            spread={step.steps?.wrapup?.status === 'COMPLETED' ? 0 : 2}
                            className="text-xs"
                        >
                            Wrapping up
                        </TextShimmer>
                    </div>
                    <p>{step.steps?.wrapup?.data || ''}</p>
                </motion.div>
            );
        }
        return null;
    };

    return (
        <div className="flex w-full flex-row items-stretch justify-start gap-2">
            <div className="flex min-h-full shrink-0 flex-col items-center justify-start px-2">
                <div className="bg-border/50 h-1.5 shrink-0" />
                <div className="bg-background z-10">
                    <StepStatus status={step.status} />
                </div>
                <motion.div
                    className="border-border min-h-full w-[1px] flex-1 border-l border-dashed"
                    initial={{ height: 0 }}
                    animate={{ height: '100%' }}
                    transition={{ duration: 0.5 }}
                />
            </div>
            <motion.div
                className="flex w-full flex-1 flex-col gap-4 overflow-hidden pb-2 pr-2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {renderWrapupStep()}
                {renderTextStep()}
                {renderReasoningStep()}
                {renderSearchStep()}
                {renderReadStep()}
            </motion.div>
        </div>
    );
};
