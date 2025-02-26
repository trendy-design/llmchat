'use client';
import { Flex, Type } from '@repo/ui';
import { SearchFavicon } from './search-favicon';

export type TSearchResult = {
  title: string;
  snippet: string;
  link: string;
};
export type TSearchResults = {
  searchResults: TSearchResult[];
};

export const SearchResults = ({ searchResults }: TSearchResults) => {
  if (!Array.isArray(searchResults)) {
    return null;
  }

  const getHostname = (url: string) => {
    try {
      const hostname = new URL(url).hostname.split('.')[0];
      if (hostname === 'www') {
        return new URL(url).hostname.split('.')[1];
      }
      return hostname;
    } catch (error) {
      return url;
    }
  };

  const uniqueResults = searchResults.filter(
    (result, index, self) =>
      index === self.findIndex(t => new URL(t.link).hostname === new URL(result.link).hostname)
  );

  const visibleResults = uniqueResults.slice(0, 4);
  const remainingCount = uniqueResults.length - 4;

  return (
    <Flex direction="col" gap="md" className="w-full">
      {Array.isArray(searchResults) && (
        <Flex gap="xs" className="mb-4 w-full flex-wrap overflow-x-hidden" items="stretch">
          {visibleResults.map(result => (
            <Flex
              className="bg-secondary max-w-[300px] shrink-0 cursor-pointer rounded-md p-1 px-2 hover:opacity-80"
              direction="col"
              key={result.link}
              justify="between"
              onClick={() => {
                window?.open(result?.link, '_blank');
              }}
              gap="sm"
            >
              <Flex direction="row" items="center" gap="sm">
                <SearchFavicon link={new URL(result.link).host} />
                <Type size="xs" className="w-full" textColor="secondary">
                  {getHostname(result.link)}
                </Type>
              </Flex>
            </Flex>
          ))}
          {remainingCount > 0 && (
            <Flex
              className="bg-secondary max-w-[300px] shrink-0 cursor-pointer rounded-md p-1 px-2"
              direction="col"
              justify="center"
              items="center"
            >
              <Type size="xs" textColor="secondary">
                +{remainingCount}
              </Type>
            </Flex>
          )}
        </Flex>
      )}
    </Flex>
  );
};
