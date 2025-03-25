import { Step } from '@/libs/store/chat.store';
import { Badge } from '@repo/ui';
import { IconSearch } from '@tabler/icons-react';
import { SearchResultsList } from '../search-results';
import { DotSpinner } from './step-status';
export type StepRendererType = {
    step: Step;
};
export const StepRenderer = ({ step }: StepRendererType) => {
    if (step.type === 'search') {
        return (
            <div className="my-2 flex flex-col gap-1">
                <div className="flex flex-col gap-2">
                    <p className="text-muted-foreground text-xs">
                        {step.final ? (
                            'Searched'
                        ) : (
                            <span>
                                <DotSpinner /> Searching
                            </span>
                        )}
                    </p>

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
            <div className="my-2 flex flex-col gap-2">
                <p className="text-muted-foreground text-xs">
                    {step.final ? (
                        'Read'
                    ) : (
                        <span>
                            <DotSpinner /> Reading
                        </span>
                    )}
                </p>
                <SearchResultsList results={step.results || []} />
            </div>
        );
    }

    return null;
};
