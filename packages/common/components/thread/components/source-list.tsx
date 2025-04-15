import { Source } from '@repo/shared/types';
import { WebsitePreview } from '@repo/ui';

export const SourceList = ({ sources }: { sources: Source[] }) => {
    if (!sources || !Array.isArray(sources) || sources?.length === 0) {
        return null;
    }

    const sortedSources = [...sources].sort((a, b) => a?.index - b?.index);

    return (
        <div className="flex min-h-full flex-col gap-6 py-3 pl-2 pr-4">
            {sortedSources.map(source => (
                <div className="flex w-full flex-row items-start gap-4" key={source.link}>
                    <div className="text-brand bg-brand/20 group mx-0.5 my-0.5 inline-flex size-4 shrink-0 flex-row items-center justify-center gap-1 rounded-sm text-[10px] font-medium">
                        {source?.index}
                    </div>

                    <WebsitePreview key={source.link} source={source} />
                </div>
            ))}
        </div>
    );
};
