'use client';
import { LinkFavicon, LinkPreviewPopover } from '@repo/common/components';
import { Source } from '@repo/shared/types';
import { getHost, getHostname } from '@repo/shared/utils';
import {
    Badge,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    Flex,
} from '@repo/ui';

export type SearchResultsType = {
    sources: Source[];
};

export const SearchResultsList = ({ sources }: SearchResultsType) => {
    if (!Array.isArray(sources)) {
        return null;
    }

    const maxVisible = 4;
    const visibleSources = sources.slice(0, maxVisible);
    const hiddenSources = sources.slice(maxVisible);

    return (
        <Flex direction="col" gap="md" className="w-full">
            <Flex gap="xs" className="mb-4 w-full flex-wrap overflow-x-hidden" items="stretch">
                {visibleSources.map((source, index) => (
                    <LinkPreviewPopover source={source} key={`source-${source.link}-${index}`}>
                        <Badge
                            size="md"
                            variant="default"
                            className="pl-1"
                            onClick={() => {
                                window?.open(source?.link, '_blank');
                            }}
                        >
                            <LinkFavicon link={getHost(source.link)} />
                            {getHostname(source.link)}
                        </Badge>
                    </LinkPreviewPopover>
                ))}
                {hiddenSources.length > 0 && (
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Badge size="md" variant="default" className="cursor-pointer px-2">
                                +{hiddenSources.length} more
                            </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            {hiddenSources.map((source, index) => (
                                <DropdownMenuItem
                                    key={`hidden-source-${source.link}-${index}`}
                                    onClick={() => {
                                        window?.open(source?.link, '_blank');
                                    }}
                                    className="px-2"
                                >
                                    <LinkFavicon link={getHost(source.link)} />
                                    {getHostname(source.link)}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </Flex>
        </Flex>
    );
};
