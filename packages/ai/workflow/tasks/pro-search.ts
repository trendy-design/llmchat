import { createTask } from '@repo/orchestrator';
import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import {
    ChunkBuffer,
    generateObject,
    generateText,
    getHumanizedDate,
    getSERPResults,
    handleError,
    processWebPages,
} from '../utils';

type SearchResult = {
    title: string;
    link: string;
    snippet?: string;
    content?: string;
    index?: number;
};

const getAnalysisPrompt = (question: string, webPageContent: SearchResult[]): string => {
    return `
Today is ${getHumanizedDate()}.

You are a Web Research Assistant helping users quickly understand search findings related to "${question}".

## Research Materials

<research_findings>
${webPageContent
    ?.map(
        (s, index) => `

## Finding ${index + 1}

<title>${s.title || 'No title available'}</title>
<content>${s.content || 'No content available'}</content>
<link>${s.link || 'No link available'}</link>

`
    )
    .join('\n\n\n')}
</research_findings>

## Output Requirements:

1. Content Organization:
   - Organize information in a highly scannable format with clear headings and subheadings
   - Use bullet points for key facts and findings
   - Bold important data points, statistics, and conclusions
   - Group related information from different sources together

2. Information Hierarchy:
   - Start with the most relevant and important findings first
   - Include specific details, numbers, and technical information when available
   - Highlight contradictory information or different perspectives on the same topic
   - Ensure each point adds unique value without unnecessary repetition

3. Context & Relevance:
   - Maintain focus on directly answering the user's question
   - Provide enough context for each point to be understood independently
   - Include temporal information (dates, timelines) when relevant
   - Summarize complex concepts in accessible language

4. Citations:
   - Use inline citations like [1] to reference sources
   - When information appears in multiple findings, cite all relevant sources: [1][3]
   - Make it clear when different sources have conflicting information

5. Visual Structure:
   - Use clear visual separation between different sections
   - Keep paragraphs short (3-4 lines maximum)
   - Include a brief "Key Takeaways" section at the beginning for ultra-quick consumption
   - End with any important context or limitations of the findings

Your goal is to help the user quickly understand and extract value from these search results without missing any important details.
`;
};

export const proSearchTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'pro-search',
    execute: async ({ events, context, signal }) => {
        try {
            const question = context?.get('question');
            if (!question) {
                throw new Error('No question provided for search');
            }

            const messages =
                context
                    ?.get('messages')
                    ?.filter(
                        message =>
                            (message.role === 'user' || message.role === 'assistant') &&
                            !!message.content
                    ) || [];

            // Step 1: Generate search query
            let query;
            try {
                query = await generateObject({
                    prompt: `Today is ${getHumanizedDate()}.
                    ${context?.get('gl')?.country ? `You are in ${context?.get('gl')?.country}\n\n` : ''}
                    
                    Generate a query to search the web for information make sure query is not too broad and be specific for recent information`,
                    model: ModelEnum.GPT_4o_Mini,
                    messages,
                    schema: z.object({
                        query: z.string().min(1),
                    }),
                });
            } catch (error) {
                throw new Error(
                    `Failed to generate search query: ${error instanceof Error ? error.message : String(error)}`
                );
            }

            // Step 2: Get search results
            let searchResults: SearchResult[] = [];
            try {
                const gl = context?.get('gl');
                console.log('gl', gl);
                searchResults = await getSERPResults([query.query], gl);
                if (!searchResults || searchResults.length === 0) {
                    throw new Error('No search results found');
                }
            } catch (error) {
                throw new Error(
                    `Failed to get search results: ${error instanceof Error ? error.message : String(error)}`
                );
            }

            // Update event with search results
            events?.update('steps', prev => ({
                ...prev,
                0: {
                    ...prev?.[0],
                    id: 0,
                    status: 'PENDING',
                    steps: {
                        search: {
                            data: [query.query],
                            status: 'COMPLETED',
                        },
                        read: {
                            data: searchResults.map(result => ({
                                title: result.title,
                                link: result.link,
                                snippet: result.snippet,
                            })),
                            status: 'PENDING',
                        },
                    },
                },
            }));

            // Step 3: Process web pages
            let webPageContent: SearchResult[] = [];
            try {
                webPageContent = await processWebPages(
                    searchResults?.reduce((acc: SearchResult[], result: SearchResult) => {
                        if (result.title && result.link) {
                            acc.push({ title: result.title, link: result.link });
                        }
                        return acc;
                    }, []),
                    signal,
                    { batchSize: 4, maxPages: 8, timeout: 30000 }
                );

                if (!webPageContent || webPageContent.length === 0) {
                    throw new Error('Failed to process web pages');
                }
            } catch (error) {
                throw new Error(
                    `Failed to process web pages: ${error instanceof Error ? error.message : String(error)}`
                );
            }

            // Update event with read status
            events?.update('steps', prev => ({
                ...prev,
                0: {
                    ...prev?.[0],
                    status: 'COMPLETED',
                    id: 0,
                    steps: {
                        ...prev?.[0].steps,
                        read: {
                            ...prev?.[0].steps?.read,
                            status: 'COMPLETED',
                        },
                    },
                },
            }));

            // Update flow with sources
            events?.update('sources', current => [
                ...(current || []),
                ...searchResults?.map((result: SearchResult, index: number) => ({
                    title: result.title,
                    link: result.link,
                    snippet: result.snippet,
                    index: index + (current?.length || 1),
                })),
            ]);

            const reasoningBuffer = new ChunkBuffer({
                threshold: 200,
                breakOn: ['\n\n'],
                onFlush: (chunk, fullText) => {
                    events?.update('steps', current => ({
                        ...current,
                        1: {
                            ...current?.[1],
                            steps: {
                                ...current?.[1]?.steps,
                                reasoning: {
                                    data: fullText,
                                    status: 'COMPLETED',
                                },
                            },
                            id: 1,
                            status: 'PENDING' as const,
                        },
                    }));
                },
            });

            const chunkBuffer = new ChunkBuffer({
                threshold: 200,
                breakOn: ['\n\n'],
                onFlush: (chunk, fullText) => {
                    events?.update('answer', current => ({
                        ...current,
                        text: chunk,
                        status: 'PENDING' as const,
                    }));
                },
            });

            // Step 4: Generate analysis
            let reasoning = '';
            try {
                reasoning = await generateText({
                    prompt: getAnalysisPrompt(question, webPageContent),
                    model: ModelEnum.Deepseek_R1,
                    messages,
                    onReasoning: chunk => {
                        reasoningBuffer.add(chunk);
                    },
                    onChunk: (chunk, fullText) => {
                        chunkBuffer.add(chunk);
                    },
                });

                if (!reasoning || reasoning.trim() === '') {
                    throw new Error('Failed to generate analysis');
                }
            } catch (error) {
                throw new Error(
                    `Failed to generate analysis: ${error instanceof Error ? error.message : String(error)}`
                );
            }

            reasoningBuffer.end();
            chunkBuffer.end();

            // Update flow with completed reasoning
            events?.update('steps', current => ({
                ...current,
                1: {
                    ...current?.[1],
                    steps: {
                        ...current?.[1]?.steps,
                        reasoning: {
                            ...current?.[1]?.steps?.reasoning,
                            status: 'COMPLETED',
                        },
                    },
                    id: 1,
                    status: 'COMPLETED' as const,
                },
                2: {
                    ...current?.[2],
                    steps: {
                        ...current?.[2]?.steps,
                        wrapup: {
                            status: 'COMPLETED' as const,
                        },
                    },
                    id: 2,
                    status: 'COMPLETED' as const,
                },
            }));

            // Update flow with completed answer
            events?.update('answer', prev => ({
                ...prev,
                text: '',
                fullText: reasoning,
                status: 'COMPLETED',
            }));

            events?.update('status', current => 'COMPLETED');

            context?.update('answer', _ => reasoning);

            // Call onFinish callback if provided
            const onFinish = context?.get('onFinish');
            if (onFinish && typeof onFinish === 'function') {
                onFinish({
                    answer: reasoning,
                    threadId: context?.get('threadId'),
                    threadItemId: context?.get('threadItemId'),
                });
            }

            return {
                retry: false,
                result: 'success',
            };
        } catch (error) {
            console.error('Error in proSearchTask:', error);

            // Update flow with error status
            events?.update('error', prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                status: 'ERROR',
            }));

            return {
                retry: false,
                result: 'error',
                error: error instanceof Error ? error.message : 'Unknown error occurred',
            };
        }
    },
    onError: handleError,
    route: ({ context }) => {
        if (context?.get('showSuggestions') && context.get('answer')) {
            return 'suggestions';
        }
        return 'end';
    },
});
