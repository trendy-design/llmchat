import { GoalWithSteps } from '@/libs/store/chat.store';
import { getHost } from '@/utils/url';
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

    if (sources.length === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-4 gap-2 pb-6 pt-3">
            {sources.slice(0, 3).map((source, index) => (
                <div
                    key={index}
                    onClick={() => {
                        window?.open(source?.link, '_blank');
                    }}
                    className="bg-tertiary/80 hover:bg-tertiary flex cursor-pointer flex-col justify-between rounded-lg p-2"
                >
                    {source?.link && (
                        <div className="flex flex-row items-center gap-1 pb-1">
                            <LinkFavicon link={source?.link} size="sm" />
                            <p className="text-muted-foreground text-xs">{getHost(source?.link)}</p>
                        </div>
                    )}
                    <p className="line-clamp-2 text-xs font-medium">{source?.title}</p>
                </div>
            ))}
            {sources.length > 3 && (
                <div
                    key={4}
                    className="bg-tertiary/80 hover:bg-tertiary flex cursor-pointer flex-col items-start gap-1 rounded-xl p-2"
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
                        +{sources.length - 3} Sources
                    </p>
                </div>
            )}
        </div>
    );
};
