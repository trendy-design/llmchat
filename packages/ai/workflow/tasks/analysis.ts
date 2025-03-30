import { createTask } from '@repo/orchestrator';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { generateText, getHumanizedDate } from '../utils';

export const analysisTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'analysis',
    execute: async ({ trace, events, context, signal }) => {
        const messages = context?.get('messages') || [];
        const question = context?.get('question') || '';
        const prevSummaries = context?.get('summaries') || [];
        const nextStepId = Object.keys(events?.getState('flow')?.steps || {}).length;

        const prompt = `
          

                # Research Analysis Framework

Today is ${getHumanizedDate()}.

You are a Research Analyst tasked with thoroughly analyzing findings related to "${question}" before composing a comprehensive report. 

You gonna perform pre-writing analysis of the research findings.


## Research Materials

<research_findings>
${prevSummaries
    ?.map(
        (s, index) => `

## Finding ${index + 1}

${s}

`
    )
    .join('\n\n\n')}
</research_findings>


## Analysis Instructions
- Analyze the research findings one by one and highlight the most important information which will be used to compose a comprehensive report.
- Document your analysis in a structured format that will serve as the foundation for creating a comprehensive report.


<citations>
 Citations and References:
   - Use inline citations using <Source> tags when referencing specific information
      For example: <Source>https://www.google.com</Source> <Source>https://www.xyz.com</Source>
   - Cite multiple sources when information appears in multiple research summaries
   - Don't Include reference list at the end.
   </citations>

                `;

        const text = await generateText({
            prompt,
            model: ModelEnum.Deepseek_R1,
            messages: messages as any,
            signal,
            onReasoning: reasoning => {
                events?.update('flow', current => ({
                    ...current,
                    steps: {
                        ...current.steps,
                        [nextStepId]: {
                            ...(current.steps?.[nextStepId] || {}),
                            steps: {
                                ...(current.steps?.[nextStepId]?.steps || {}),
                                reasoning: {
                                    data: reasoning,
                                    status: 'PENDING' as const,
                                },
                            },
                            id: nextStepId,
                            status: 'PENDING' as const,
                        },
                    },
                }));
            },
        });

        events?.update('flow', current => ({
            ...current,
            steps: {
                ...current.steps,
                [nextStepId]: {
                    ...(current.steps?.[nextStepId] || {}),
                    steps: {
                        ...(current.steps?.[nextStepId]?.steps || {}),
                        reasoning: {
                            ...current.steps?.[nextStepId]?.steps?.reasoning,
                            status: 'COMPLETED' as const,
                        },
                    },
                    id: nextStepId,
                    status: 'COMPLETED' as const,
                },
            },
        }));

        trace?.span({
            name: 'analysis',
            input: prompt,
            output: text,
            metadata: {
                question,
                prevSummaries,
            },
        });

        return {
            queries: [],
            analysis: text,
            stepId: nextStepId,
        };
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
    route: ({ result }) => 'writer',
});
