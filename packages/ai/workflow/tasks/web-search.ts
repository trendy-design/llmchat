import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { executeWebSearch, generateText, getHumanizedDate } from '../utils';


export const webSearchTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
        name: 'web-search',
        execute: async ({ data, trace, events, context, signal }) => {
                console.log('web-search');

                const queries = data?.queries;
                const goalId = data?.goalId;
                const results = await executeWebSearch(queries, signal);
                const question = context?.get('question') || '';


                const prompt = `
Role: You are a Research Information Processor. Your task is to clean and format web search results without summarizing or condensing the information.

The current date and time is: **${getHumanizedDate()}**.

<user_question>
${question}
</user_question>

**Web Search Results**
${results.map((result) => `<web-search-results>\n\n - ${result.title}: ${result.link} \n\n ${result.content} \n\n</web-search-results>`).join('\n')}

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
 Citations and References:
   - Use inline citations using <Source> tags when referencing specific information
      For example: <Source>https://www.google.com</Source> <Source>https://www.xyz.com</Source>
   - Cite multiple sources when information appears in multiple research summaries
   - Don't Include reference list at the end.
   </citations>

      `

                events?.update('flow', (current) => {
                        const stepId = String(Object.keys(current.steps || {}).length);
                        return {
                                ...current,
                                steps: {
                                        ...(current.steps || {}),
                                        [stepId]: {
                                                ...(current.steps?.[stepId] || {}),
                                                type: 'read',
                                                final: true,
                                                goalId: Number(goalId),
                                                status: 'PENDING' as const,
                                                results: results?.map((result) => ({
                                                        title: result.title,
                                                        link: result.link
                                                })),
                                        }
                                }
                        }
                })


                const summary = await generateText({
                        model: ModelEnum.GEMINI_2_FLASH,
                        prompt,

                })


                events?.update('flow', (current) => {
                        const stepId = String(Object.keys(current.steps || {}).length);
                        return {
                                ...current,
                                goals: {
                                        ...(current.goals || {}),
                                        [goalId]: {
                                                ...(current.goals?.[goalId] || {}),
                                                status: 'COMPLETED' as const,
                                        } as any
                                },
                                steps: {
                                        ...(current.steps || {}),
                                        [stepId]: {
                                                ...(current.steps?.[stepId] || {}),
                                                goalId: Number(goalId),
                                                status: 'COMPLETED' as const,

                                        } as any
                                }
                        }
                })


                trace?.span({
                        name: 'web-search',
                        input: prompt,
                        output: summary,
                        metadata: {
                                queries,
                                goalId,
                                results,

                        }
                })


                context?.update('summaries', (current) => [...(current ?? []), `${queries?.map((q: any) => q.query).join(', ')} \n\n ${summary}`]);

                return {
                        goalId,
                        queries,
                        summary,
                };
        },
        route: ({ context }) => {
                const allQueries = context?.get('queries') || [];
                console.log('allQueries', allQueries);
                if (allQueries?.length < 6) {
                        return 'reflector';
                }

                return 'analysis';
        }
}); 