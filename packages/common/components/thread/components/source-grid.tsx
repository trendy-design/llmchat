import { LinkFavicon, SourceList } from '@repo/common/components';
import { Source } from '@repo/common/store';
import { getHost } from '@repo/shared/utils';

type SourceGridProps = {
    sources: Source[];
};

export const SourceGrid = ({ sources }: SourceGridProps) => {
    if (!sources || !Array.isArray(sources) || sources?.length === 0) {
        return null;
    }

    const sortedSources = [...sources].sort((a, b) => a?.index - b?.index);

    return (
        <div className="grid grid-cols-4 gap-2 pb-6 pt-3">
            {sortedSources.slice(0, 3).map((source, index) => (
                <div
                    key={index}
                    onClick={() => {
                        window?.open(source?.link, '_blank');
                    }}
                    className="bg-quaternary/80 hover:bg-quaternary flex cursor-pointer flex-col justify-between rounded-md p-2"
                >
                    {source?.link && (
                        <div className="flex flex-row items-center gap-1 pb-1">
                            <LinkFavicon link={source?.link} size="sm" />
                            <p className="text-muted-foreground line-clamp-1 text-xs">
                                {getHost(source?.link)}
                            </p>
                        </div>
                    )}
                    <p className="line-clamp-2 text-xs font-medium">{source?.title}</p>
                </div>
            ))}
            {sources.length > 3 && (
                <SourceList sources={sources}>
                    <div
                        key={4}
                        className="bg-quaternary/80 hover:bg-quaternary flex cursor-pointer flex-col items-start gap-1 rounded-md p-2"
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
                </SourceList>
            )}
        </div>
    );
};
