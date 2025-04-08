'use client';
import { LinkFavicon, LinkPreviewPopover } from '@repo/common/components';
import { Source } from '@repo/shared/types';
import { getHost, getHostname } from '@repo/shared/utils';
import { Badge, Flex } from '@repo/ui';

export type SearchResultsType = {
    sources: Source[];
};

export const SearchResultsList = ({ sources }: SearchResultsType) => {
    if (!Array.isArray(sources)) {
        return null;
    }

    return (
        <Flex direction="col" gap="md" className="w-full">
            {Array.isArray(sources) && (
                <Flex gap="xs" className="mb-4 w-full flex-wrap overflow-x-hidden" items="stretch">
                    {sources.map((source, index) => (
                        <LinkPreviewPopover source={source} key={`source-${source.link}-${index}`}>
                            <Badge
                                size="md"
                                variant="default"
                                onClick={() => {
                                    window?.open(source?.link, '_blank');
                                }}
                            >
                                <LinkFavicon link={getHost(source.link)} />
                                {getHostname(source.link)}
                            </Badge>
                        </LinkPreviewPopover>
                    ))}
                </Flex>
            )}
        </Flex>
    );
};
