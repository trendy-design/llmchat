import { createTask } from '@repo/orchestrator';
import { format } from 'date-fns';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { ChunkBuffer, generateText, handleError } from '../utils';

export const writerTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'writer',
    execute: async ({ trace, events, context, data, signal }) => {
        const analysis = data?.analysis || '';

        const question = context?.get('question') || '';
        const summaries = context?.get('summaries') || [];
        const messages = context?.get('messages') || [];
        const stepId = data?.stepId;

        const currentDate = new Date();
        const humanizedDate = format(currentDate, 'MMMM dd, yyyy, h:mm a');

        const prompt = `

    Today is ${humanizedDate}.
You are a Comprehensive Research Writer tasked with providing an extremely detailed and thorough writing about "${question}".
Your goal is to create a comprehensive report based on the research information provided.

First, carefully read and analyze the following research information:

<research_findings>
${summaries.map(summary => `<finding>${summary}</finding>`).join('\n')}
</research_findings>

<analysis>
${analysis}
</analysis>

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
   - Use headings strategically only for thematic shifts depending on the question asked and content
   - Use lists, tables, links, images when appropriate
   - use bold text for key points
   - Implement markdown tables for comparative data where appropriate
   - Ensure proper spacing between sections for optimal readability

4. Citations:
   - Based on provided references in each findings, you must cite the sources in the report.
   - Use inline citations like [1] to reference the source
   - For example: According to recent findings [1][3], progress in this area has accelerated
   - When information appears in multiple findings, cite all relevant findings using multiple numbers
   - Integrate citations naturally without disrupting reading flow

Note: **Reference list at the end is not required.**


Your report should demonstrate subject matter expertise while remaining intellectually accessible to informed professionals. Focus on providing substantive analysis rather than cataloging facts. Emphasize implications and significance rather than merely summarizing information.
    `;

        if (stepId) {
            const nextStepId = stepId + 1;
            events?.update('steps', current => ({
                ...current,

                [nextStepId]: {
                    ...(current?.[nextStepId] || {}),
                    steps: {
                        ...(current?.[nextStepId]?.steps || {}),
                        wrapup: {
                            status: 'COMPLETED' as const,
                        },
                    },
                    id: nextStepId,
                    status: 'COMPLETED' as const,
                },
            }));
        }

        const chunkBuffer = new ChunkBuffer({
            threshold: 150,
            breakOn: ['\n\n', '.', '!', '?'],
            onFlush: (text: string) => {
                events?.update('answer', current => ({
                    ...current,
                    text,
                    status: 'PENDING' as const,
                }));
            },
        });

        const answer = await generateText({
            prompt,
            model: ModelEnum.Claude_3_7_Sonnet,
            signal,
            onChunk: (chunk, fullText) => {
                chunkBuffer.add(chunk);
            },
        });

        // Make sure to flush any remaining content
        chunkBuffer.flush();

        events?.update('answer', current => ({
            ...current,
            text: '',
            finalText: answer,
            status: 'COMPLETED' as const,
        }));

        context?.get('onFinish')?.({
            answer,
            threadId: context?.get('threadId'),
            threadItemId: context?.get('threadItemId'),
        });

        events?.update('status', prev => 'COMPLETED');

        trace?.span({
            name: 'writer',
            input: prompt,
            output: answer,
            metadata: context?.getAll(),
        });
        context?.update('answer', _ => answer);

        return answer;
    },
    onError: handleError,
    route: ({ result, context }) => {
        if (context?.get('showSuggestions') && !!context?.get('answer')) {
            return 'suggestions';
        }
        return 'end';
    },
});
