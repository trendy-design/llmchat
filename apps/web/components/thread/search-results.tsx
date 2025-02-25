import { ToolCallResultType, ToolCallType } from "@repo/ai";
import { Badge, Flex } from "@repo/ui";
import { IconSearch } from "@tabler/icons-react";
import { useMemo } from "react";
import { SearchResults } from "../tools/search-results";

export const getSearchToolMeta = (input: ToolCallType, output: ToolCallResultType): { snippet: string, link: string, title: string }[] => {
        return output.result?.map((result: any) => ({
                snippet: result.snippet,
                link: result.link,
                title: result.title,
        }));
};

export const getReaderToolMeta = (input: ToolCallType, output: ToolCallResultType): { url: string } => {
        return {
                url: input.args.url as string,
        };
};


export type SearchAndReadingResultsProps = {
        toolCalls: ToolCallType[];
        toolCallResults: ToolCallResultType[];
}


export const SearchAndReadingResults = ({ toolCalls, toolCallResults }: SearchAndReadingResultsProps) => {
        const toolCallsWithResults = useMemo(() => {
                if (!toolCalls?.length) return [];

                return toolCalls.map(call => ({
                        ...call,
                        output: toolCallResults?.find(result => result?.toolCallId === call.toolCallId) ?? null
                }));
        }, [toolCalls, toolCallResults]);

        const searchToolResults = useMemo(() => {
                return toolCallsWithResults.filter(call => call?.toolName === 'search');
        }, [toolCallsWithResults]);

        const searchResults = useMemo(() => {
                if (!searchToolResults?.length) return [];

                return searchToolResults.flatMap(result => {
                        const outputResults = result?.output?.result;
                        if (!Array.isArray(outputResults)) return [];

                        return outputResults.map((item: any) => ({
                                snippet: item?.snippet ?? '',
                                link: item?.link ?? '',
                                title: item?.title ?? '',
                        }));
                }).filter(result => result.link);
        }, [searchToolResults]);

        const readingToolResults = useMemo(() => {
                return toolCallsWithResults.filter(call => call?.toolName === 'reader');
        }, [toolCallsWithResults]);

        const readingResults = useMemo(() => {
                if (!readingToolResults?.length) return [];

                return readingToolResults
                        .flatMap(result => result?.args?.urls)
                        .filter((url): url is string => typeof url === 'string');
        }, [readingToolResults]);

        const readResults = useMemo(() => {
                if (!searchResults?.length || !readingResults?.length) return [];

                return searchResults.filter(result =>
                        result.link && readingResults.includes(result.link)
                );
        }, [searchResults, readingResults]);

        if (!searchToolResults?.length && !readingToolResults?.length) {
                return null;
        }

        return (
                <Flex direction="col" gap="md" className="w-full">
                        <p className="text-xs text-muted-foreground">Search Queries</p>
                        <div className='flex flex-row gap-2 flex-wrap'>
                                {/* {JSON.stringify(searchToolResults)} */}
                                {searchToolResults?.map((result, index) => (
                                        (result.args.queries as string[] ?? []).map((query, index) =>
                                                <Badge key={index} className="rounded-md px-2 py-1 text-xs font-normal gap-1" variant="default">
                                                        <IconSearch size={12} className="opacity-50" />
                                                        {query}</Badge>)
                                ))}
                        </div>

                        {searchResults?.length > 0 ? <>
                                <p className="text-xs text-muted-foreground">READING SOURCES</p>
                                <SearchResults searchResults={searchResults} />
                        </> : null}
                </Flex>
        );
};
