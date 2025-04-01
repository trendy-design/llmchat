import { createTask } from '@repo/orchestrator';
import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import {
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
# Research Analysis Framework

Today is ${getHumanizedDate()}.

You are a Research Write tasked with thoroughly analyzing findings related to "${question}" before composing a comprehensive report. 

Once you have analyzed the research findings, you will compose a comprehensive report.
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

## Report Requirements:
1. Structure and Organization:
   - Begin with a concise executive summary highlighting key developments
   - Organize content thematically with clear progression between topics, Group related information into coherent categories
   - Use a consistent hierarchical structure throughout
   - Conclude with analytical insights identifying patterns, implications, and future directions

2. Content and Analysis:
   - Provide specific details, data points, and technical information where relevant
   - Analyze the significance of key findings within the broader context
   - Make connections between related information across different sources
   - Maintain an objective, analytical tone throughout


3. Formatting Standards:
   - Highlight key figures, critical statistics, and significant findings with bold text
   - Construct balanced continuous paragraphs (4-5 sentences per paragraph not more than that) with logical flow instead of shorter sentences.
   - Use headings strategically only for major thematic shifts depending on the question asked and content
   - Use lists, tables, links, images when appropriate
   - Implement markdown tables for comparative data where appropriate
   - Ensure proper spacing between sections for optimal readability

4. Citations:
   - Based on provided references in each findings, you must cite the sources in the report.
   - Use inline citations like [1] to reference the source
   - For example: According to recent findings [1][3], progress in this area has accelerated
   - When information appears in multiple findings, cite all relevant findings using multiple numbers
   - Integrate citations naturally without disrupting reading flow

Note: **Reference list at the end is not required.**
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
                    prompt: `Today is ${getHumanizedDate()}. Generate a query to search the web for information make sure query is not too broad and be specific for recent information`,
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
                searchResults = await getSERPResults([query.query]);
                if (!searchResults || searchResults.length === 0) {
                    throw new Error('No search results found');
                }
            } catch (error) {
                throw new Error(
                    `Failed to get search results: ${error instanceof Error ? error.message : String(error)}`
                );
            }

            // Update event with search results
            events?.update('flow', prev => ({
                ...prev,
                steps: {
                    ...prev.steps,
                    0: {
                        ...prev?.steps?.[0],
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
            events?.update('flow', prev => ({
                ...prev,
                steps: {
                    ...prev.steps,
                    0: {
                        ...prev?.steps?.[0],
                        status: 'COMPLETED',
                        id: 0,
                        steps: {
                            ...prev.steps?.[0].steps,
                            read: {
                                ...prev.steps?.[0].steps?.read,
                                status: 'COMPLETED',
                            },
                        },
                    },
                },
            }));

            // Update flow with sources
            events?.update('flow', current => ({
                ...current,
                sources: searchResults?.map((result: SearchResult, index: number) => ({
                    title: result.title,
                    link: result.link,
                    snippet: result.snippet,
                    index: index + (current?.sources?.length || 1),
                })),
            }));

            // Step 4: Generate analysis
            let reasoning = '';
            try {
                reasoning = await generateText({
                    prompt: getAnalysisPrompt(question, webPageContent),
                    model: ModelEnum.Deepseek_R1,
                    messages,
                    onReasoning: chunk => {
                        events?.update('flow', current => ({
                            ...current,
                            steps: {
                                ...current?.steps,
                                1: {
                                    ...current?.steps?.[1],
                                    steps: {
                                        ...current?.steps?.[1]?.steps,
                                        reasoning: {
                                            data: chunk,
                                            status: 'COMPLETED',
                                        },
                                    },
                                    id: 1,
                                    status: 'PENDING' as const,
                                },
                            },
                        }));
                    },
                    onChunk: chunk => {
                        events?.update('flow', current => ({
                            ...current,
                            answer: {
                                ...current.answer,
                                text: chunk,
                                status: 'PENDING' as const,
                            },
                        }));
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

            // Update flow with completed reasoning
            events?.update('flow', current => ({
                ...current,
                steps: {
                    ...current?.steps,
                    1: {
                        ...current?.steps?.[1],
                        steps: {
                            ...current?.steps?.[1]?.steps,
                            reasoning: {
                                ...current?.steps?.[1]?.steps?.reasoning,
                                status: 'COMPLETED',
                            },
                        },
                        id: 1,
                        status: 'COMPLETED' as const,
                    },
                    2: {
                        ...current?.steps?.[2],
                        steps: {
                            ...current?.steps?.[2]?.steps,
                            wrapup: {
                                status: 'COMPLETED' as const,
                            },
                        },
                        id: 2,
                        status: 'COMPLETED' as const,
                    },
                },
            }));

            // Update flow with completed answer
            events?.update('flow', prev => ({
                ...prev,
                answer: {
                    text: reasoning,
                    status: 'COMPLETED',
                },
                status: 'COMPLETED',
            }));

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
            events?.update('flow', prev => ({
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
