"use client";
import { Flex, Type } from "@repo/ui";
import { SearchFavicon } from "./search-favicon";

export type TSearchResult = {
  title: string;
  snippet: string;
  link: string;
};
export type TSearchResults = {
  query: string;
  searchResults: TSearchResult[];
};

export const SearchResults = ({ searchResults, query }: TSearchResults) => {
  if (!Array.isArray(searchResults)) {
    return null;
  }

  return (
    <Flex direction="col" gap="md" className="w-full">
      {Array.isArray(searchResults) && (
        <Flex
          gap="sm"
          className="no-scrollbar mb-4 w-full overflow-x-auto"
          items="stretch"
        >
          {searchResults?.map((result) => (
            <Flex
              className="min-w-[200px] cursor-pointer rounded-md bg-zinc-500/10 p-2.5 hover:opacity-80"
              direction="col"
              key={result.link}
              justify="between"
              onClick={() => {
                window?.open(result?.link, "_blank");
              }}
              gap="sm"
            >
              <Flex direction="row" items="center" gap="sm">
                <SearchFavicon link={new URL(result.link).host} />
                <Type size="xs" className="line-clamp-1 w-full" weight="medium">
                  {new URL(result.link).host}
                </Type>
              </Flex>
              <Type size="xs" className="line-clamp-2" textColor="secondary">
                {result.title}
              </Type>
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );
};
