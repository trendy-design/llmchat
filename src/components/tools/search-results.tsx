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
    <Flex direction="col" gap="sm" className="w-full">
      {query && <ToolBadge icon={Search01Icon} text={query} />}

      {Array.isArray(searchResults) && (
        <Flex
          gap="sm"
          className="no-scrollbar mb-4 w-full overflow-x-auto"
          items="stretch"
        >
          {searchResults?.map((result) => (
            <Flex
              className="min-w-[200px] cursor-pointer rounded-lg bg-zinc-500/10 p-2 hover:bg-zinc-500/20"
              direction="col"
              key={result.link}
              justify="between"
              onClick={() => {
                window?.open(result?.link, "_blank");
              }}
              gap="xs"
            >
              <Type size="sm" className="line-clamp-2">
                {result.title}
              </Type>
              <Flex direction="row" items="center" gap="sm">
                <SearchFavicon link={new URL(result.link).host} />
                <Type size="xs" textColor="secondary">
                  {new URL(result.link).host}
                </Type>
              </Flex>
            </Flex>
          ))}
        </Flex>
      )}
    </Flex>
  );
};
