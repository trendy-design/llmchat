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





  return (
    <Flex direction="col" gap="md" className="w-full">
      {Array.isArray(results) && (
        <Flex gap="xs" className="mb-4 w-full flex-wrap overflow-x-hidden" items="stretch">
          {results.map(result => (
            <Flex
              className="bg-tertiary max-w-[300px] shrink-0 font-mono cursor-pointer rounded-full p-0.5 pl-1.5 pr-2.5 hover:opacity-80"
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
        </Flex>
      )}
    </Flex>
  );
};
