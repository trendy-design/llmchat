import { GoalWithSteps } from '@/libs/store/chat.store';
import { getHost } from '@/utils/url';
import { Button } from '@repo/ui';
import { IconArrowRight, IconLink } from '@tabler/icons-react';
import { LinkFavicon } from '../../link-favicon';

type SourceGridProps = {
    goals: GoalWithSteps[];
};

export const SourceGrid = ({ goals }: SourceGridProps) => {
    const sources = goals.flatMap(goal =>
        goal.steps
            .filter(step => step.type === 'read')
            .flatMap(step => step.results?.map(result => result))
    );

    return (
        <div className="grid grid-cols-4 gap-2">
            {sources.slice(0, 3).map((source, index) => (
                <div
                    key={index}
                    className="bg-tertiary border-border flex flex-col justify-between gap-1 rounded-lg border p-3"
                >
                    <p className="line-clamp-2 text-xs font-medium">{source?.title}</p>
                    {source?.link && (
                        <div className="flex flex-row items-center gap-1">
                            <LinkFavicon link={source?.link} size="sm" />
                            <p className="text-muted-foreground text-xs">{getHost(source?.link)}</p>
                        </div>
                    )}
                </div>
            ))}
            {sources.length > 3 && (
                <div
                    key={4}
                    className="bg-tertiary border-border flex flex-col items-start gap-1 rounded-lg border p-3"
                >
                    <div className="flex flex-row gap-1">
                        {sources
                            .slice(3)
                            .slice(0, 5)
                            .map((source, index) => (
                                <div key={index} className="flex flex-row items-center gap-1">
                                    <LinkFavicon link={source?.link} size="sm" />
                                </div>
                            ))}
                    </div>
                    <div className="flex-1" />
                    <p className="text-muted-foreground flex flex-row items-center gap-1 text-xs">
                        <IconLink size={14} strokeWidth={2} />+{sources.length - 3} Sources
                    </p>
                    <Button variant="bordered" size="xs" rounded="full" tooltip="View all sources">
                        View all <IconArrowRight size={14} strokeWidth={2} />
                    </Button>
                </div>
            )}
        </div>
    );
};
