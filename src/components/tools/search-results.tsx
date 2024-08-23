"use client";
import { Search01Icon } from "@hugeicons/react";
import { Flex, Type } from "../ui";
import { SearchFavicon } from "./search-favicon";
import { ToolBadge } from "./tool-badge";

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
      {query && <ToolBadge icon={Search01Icon} text={query} />}

      {Array.isArray(searchResults) && (
        <Flex
          gap="sm"
          className="no-scrollbar mb-4 w-full overflow-x-auto"
          items="stretch"
        >
          {searchResults?.map((result) => (
            <Flex
              className="min-w-[200px] cursor-pointer rounded-md border bg-zinc-500/5 p-2.5 hover:bg-zinc-500/10"
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
                <Type size="xs" textColor="secondary" className="line-clamp-1">
                  {new URL(result.link).host}
                </Type>
              </Flex>
              <Type size="sm" className="line-clamp-2">
                {result.title}
              </Type>
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );
};
