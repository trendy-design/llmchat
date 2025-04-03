import { createTask } from '@repo/orchestrator';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import {
    executeWebSearch,
    generateText,
    getHumanizedDate,
    handleError,
    processWebPages,
} from '../utils';

export const webSearchTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'web-search',
    execute: async ({ data, trace, events, context, signal }) => {
        const queries = data?.queries;
        const stepId = data?.stepId;
        const results = await executeWebSearch(queries, signal);
        events?.update('steps', current => {
            return {
                ...current,
                [stepId]: {
                    ...(current?.[stepId] || {}),
                    steps: {
                        ...(current?.[stepId]?.steps || {}),
                        read: {
                            data: results?.map((result: any) => ({
                                title: result.title,
                                link: result.link,
                                snippet: result.snippet,
                            })),
                            status: 'PENDING' as const,
                        },
                    },
                    id: stepId,
                    status: 'PENDING' as const,
                },
            };
        });

        context?.update('sources', current => {
            const existingSources = current ?? [];
            const newSources = results
                ?.filter(
                    (result: any) => !existingSources.some(source => source.link === result.link)
                )
                .map((result: any, index: number) => ({
                    title: result.title,
                    link: result.link,
                    snippet: result.snippet,
                    index: index + (existingSources?.length || 1),
                }));
            return [...existingSources, ...newSources];
        });

        const processedResults = await processWebPages(results, signal);

        if (!processedResults || processedResults.length === 0) {
            throw new Error('No results found');
        }

        const question = context?.get('question') || '';

        const prompt = `
Role: You are a Research Information Processor. Your task is to clean and format web search results without summarizing or condensing the information.

The current date and time is: **${getHumanizedDate()}**.

<user_question>
${question}
</user_question>

**Web Search Results**
${processedResults
    .filter(result => !!result?.content && !!result?.link)
    .map(result => ({
        ...result,
        index: context?.get('sources')?.find(s => s.link === result.link)?.index,
    }))
    .map(
        (result: any) =>
            `<findings index="${result.index}">\n\n ## [${result.index}] ${result.link}\n\n ### Title: ${result.title}\n\n ${result.content} \n\n</findings>`
    )
    .join('\n')}

<processing_guidelines>
- Do NOT summarize or condense the information
- Preserve all relevant details, facts, data points, examples, and explanations from the search results
- Remove only duplicate content, irrelevant advertisements, navigation elements, or other web artifacts
- Maintain the original depth and breadth of information
- Organize the information in a clean, readable format
- Present multiple perspectives or approaches when they exist in the sources
</processing_guidelines>

<output_format>
- Present the full detailed information in a clean, readable format
- Use headings or sections only when they help organize complex information
- Include all source links and properly attribute information using [Source X] notation
- Focus on preserving comprehensive information rather than summarizing
</output_format>

<citations>
 **Citations and References:**
   - each findings have given number which can be used to reference the source
   - Use inline citations like [1] to reference the source
   - For example: According to recent findings [1][3], progress in this area has accelerated
   - When information appears in multiple findings, cite all relevant findings using multiple numbers
   - Integrate citations naturally without disrupting reading flow
   - Must include a numbered reference list at the end with format:
      [1] https://www.example.com
      [2] https://www.another-source.com
</citations>

      `;

        const summary = await generateText({
            model: ModelEnum.GEMINI_2_FLASH,
            prompt,
        });

        events?.update('steps', current => {
            return {
                ...current,
                [stepId]: {
                    ...(current?.[stepId] || {}),
                    steps: {
                        ...(current?.[stepId]?.steps || {}),
                        read: {
                            data: results?.map((result: any) => ({
                                title: result.title,
                                link: result.link,
                                snippet: result.snippet,
                            })),
                            status: 'COMPLETED' as const,
                        },
                    },

                    status: 'COMPLETED' as const,
                },
            };
        });

        trace?.span({
            name: 'web-search',
            input: prompt,
            output: summary,
            metadata: {
                queries,
                stepId,
                results,
            },
        });

        context?.update('summaries', current => [
            ...(current ?? []),
            `${queries?.map((q: any) => q.query).join(', ')} \n\n ${summary}`,
        ]);

        return {
            stepId,
            queries,
            summary,
        };
    },
    onError: handleError,
    route: ({ context }) => {
        const allQueries = context?.get('queries') || [];
        if (allQueries?.length < 6) {
            return 'reflector';
        }

        return 'analysis';
    },
});
