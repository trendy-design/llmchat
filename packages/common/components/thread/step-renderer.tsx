import { SearchResultsList, TextShimmer } from '@repo/common/components';
import { Step } from '@repo/common/store';
import { Badge } from '@repo/ui';
import { IconSearch } from '@tabler/icons-react';
export type StepRendererType = {
    step: Step;
};
export const StepRenderer = ({ step }: StepRendererType) => {
    if (step.type === 'search') {
        return (
            <div className="flex flex-col gap-1">
                <div className="flex flex-col gap-2">
                    <div className="w-[100px]">
                        <TextShimmer duration={0.7} spread={step.final ? 0 : 2} className="text-xs">
                            Searching
                        </TextShimmer>
                    </div>

                    <div className="flex flex-row flex-wrap gap-1">
                        {step.queries?.map((query, index) => (
                            <Badge key={index}>
                                <IconSearch size={12} className="opacity-50" />
                                {query}
                            </Badge>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (step.type === 'read') {
        return (
            <div className="flex flex-col gap-2">
                <div className="w-[100px]">
                    <TextShimmer duration={0.7} spread={step.final ? 0 : 2} className="text-xs">
                        Reading
                    </TextShimmer>
                </div>
                <SearchResultsList results={step.results || []} />
            </div>
        );
    }

    return null;
};
