'use client';
import { getHost, getHostname } from '@/utils/url';
import { Flex, Type } from '@repo/ui';
import { LinkFavicon } from './link-favicon';
import { LinkPreviewPopover } from './link-preview';

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



  const uniqueResults = results.filter(
    (result, index, self) =>
      index === self.findIndex(t => new URL(t.link).hostname === new URL(result.link).hostname)
  );

  const visibleResults = uniqueResults.slice(0, 4);
  const remainingCount = uniqueResults.length - 4;

  return (
    <Flex direction="col" gap="md" className="w-full">
      {Array.isArray(results) && (
        <Flex gap="xs" className="mb-4 w-full flex-wrap overflow-x-hidden" items="stretch">
          {visibleResults.map(result => (
            <Flex
              className="bg-tertiary max-w-[300px] shrink-0 cursor-pointer rounded-md p-1 px-1.5 hover:opacity-80"
              direction="col"
              key={result.link}
              justify="between"
              onClick={() => {
                window?.open(result?.link, '_blank');
              }}
              gap="sm"
            >
              <LinkPreviewPopover url={result.link}>
                <Flex direction="row" items="center" gap="sm">
                  <LinkFavicon link={getHost(result.link)} />
                  <Type size="xs" className="w-full text-foreground" >
                    {getHostname(result.link)}
                  </Type>
                </Flex>
              </LinkPreviewPopover>
            </Flex>
          ))}
          {/* {remainingCount > 0 && (
            <Popover>
              <PopoverTrigger>
                <Flex
                  className="bg-tertiary max-w-[300px] shrink-0 cursor-pointer rounded-md p-1 px-1.5"
                  direction="col"
                  justify="center"
                  items="center"
                >
                  <Type size="xs" className="text-foreground">
                    +{remainingCount}
                  </Type>
                </Flex>
              </PopoverTrigger>
              <PopoverContent className='z-20 bg-background w-[160px]'>
                <Flex direction="col" gap="xs">
                  {uniqueResults.slice(4).map(result => (
                    <Flex key={result.link} direction="row" items="center" gap="sm">
                      <LinkFavicon link={getHost(result.link)} />
                      <Type size="xs" className="w-full text-foreground" >
                        {getHostname(result.link)}
                      </Type>
                    </Flex>
                  ))}
                </Flex>
              </PopoverContent>
            </Popover>)} */}
        </Flex>
      )}
    </Flex>
  );
};
