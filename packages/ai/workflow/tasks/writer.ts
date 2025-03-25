import { format } from 'date-fns';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { generateText } from '../utils';

export const writerTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'writer',
    execute: async ({ trace, events, context, data, signal }) => {
        const analysis = data?.analysis || '';

        const question = context?.get('question') || '';
        const summaries = context?.get('summaries') || [];
        const messages = context?.get('messages') || [];

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

3. Citations Method:
   - Use inline citations with <Source> tags for each statement where possible.
   - Example: According to recent findings <Source>https://www.example.com</Source>, progress in this area has accelerated
   - When information appears in multiple sources, cite all relevant sources
   - Use multiple citations for each statement if multiple sources stated the same information.
   - Integrate citations naturally without disrupting reading flow

4. Formatting Standards:
   - Highlight key figures, critical statistics, and significant findings with bold text
   - Construct balanced continuous paragraphs (4-5 sentences per paragraph not more than that) with logical flow instead of shorter sentences.
   - Use headings strategically only for major thematic shifts depending on the question asked and content
   - Use lists, tables, links, images when appropriate
   - Implement markdown tables for comparative data where appropriate
   - Ensure proper spacing between sections for optimal readability

Your report should demonstrate subject matter expertise while remaining intellectually accessible to informed professionals. Focus on providing substantive analysis rather than cataloging facts. Emphasize implications and significance rather than merely summarizing information.
    `;

        const answer = await generateText({
            prompt,
            model: ModelEnum.GEMINI_2_FLASH,
            signal,
            onChunk: chunk => {
                events?.update('flow', current => ({
                    ...current,
                    answer: { text: chunk, final: false, status: 'PENDING' as const },
                    final: false,
                }));
            },
        });

        events?.update('flow', current => ({
            ...current,
            answer: { text: answer, final: true, status: 'COMPLETED' as const },
            final: true,
        }));

        trace?.span({
            name: 'writer',
            input: prompt,
            output: answer,
            metadata: context?.getAll(),
        });
        context?.update('answer', _ => answer);

        return answer;
    },
    onError: (error, { context, events }) => {
        console.error('Task failed', error);
        events?.update('flow', prev => ({
            ...prev,
            error: 'Something went wrong while processing your request. Please try again.',
            status: 'ERROR',
        }));
        return Promise.resolve({
            retry: false,
            result: 'error',
        });
    },
    route: ({ result, context }) => {
        if (context?.get('showSuggestions')) {
            return 'suggestions';
        }
        return 'end';
    },
});
