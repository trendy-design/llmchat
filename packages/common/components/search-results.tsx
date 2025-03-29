'use client';
import { LinkFavicon, LinkPreviewPopover } from '@repo/common/components';
import { getHost, getHostname } from '@repo/shared/utils';
import { Badge, Flex } from '@repo/ui';

export type SearchResultType = {
    title: string;
    link: string;
};
export type SearchResultsType = {
    results: SearchResultType[];
};

export const SearchResultsList = ({ results }: SearchResultsType) => {
    if (!Array.isArray(results)) {
        return null;
    }

    return (
        <Flex direction="col" gap="md" className="w-full">
            {Array.isArray(results) && (
                <Flex gap="xs" className="mb-4 w-full flex-wrap overflow-x-hidden" items="stretch">
                    {results.map(result => (
                        <LinkPreviewPopover url={result.link}>
                            <Badge
                                size="md"
                                variant="default"
                                onClick={() => {
                                    window?.open(result?.link, '_blank');
                                }}
                            >
                                <LinkFavicon link={getHost(result.link)} />
                                {getHostname(result.link)}
                            </Badge>
                        </LinkPreviewPopover>
                    ))}
                </Flex>
            )}
        </Flex>
    );
};
