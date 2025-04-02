import { createTask } from '@repo/orchestrator';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { generateText, getHumanizedDate, handleError } from '../utils';

export const analysisTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'analysis',
    execute: async ({ trace, events, context, signal }) => {
        const messages = context?.get('messages') || [];
        const question = context?.get('question') || '';
        const prevSummaries = context?.get('summaries') || [];
        const nextStepId = Object.keys(events?.getState('steps') || {}).length;

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
 ## Citations and References:
   - Based on provided references in each findings, you must cite the sources in the analysis.
   - Use inline citations like [1] to reference the source
   - For example: According to recent findings [1][3], progress in this area has accelerated
   - When information appears in multiple findings, cite all relevant findings using multiple numbers
   - Integrate citations naturally without disrupting reading flow
   - must add a numbered reference list at the end with format:
      [1] https://www.example.com
      [2] https://www.another-source.com
   </citations>
                `;

        const text = await generateText({
            prompt,
            model: ModelEnum.Deepseek_R1,
            messages: messages as any,
            signal,
            onReasoning: reasoning => {
                events?.update('steps', current => ({
                    ...current,
                    [nextStepId]: {
                        ...(current?.[nextStepId] || {}),
                        steps: {
                            ...(current?.[nextStepId]?.steps || {}),
                            reasoning: {
                                data: reasoning,
                                status: 'PENDING' as const,
                            },
                        },
                        id: nextStepId,
                        status: 'PENDING' as const,
                    },
                }));
            },
        });

        events?.update('steps', current => ({
            ...current,

            [nextStepId]: {
                ...(current?.[nextStepId] || {}),
                steps: {
                    ...(current?.[nextStepId]?.steps || {}),
                    reasoning: {
                        ...current?.[nextStepId]?.steps?.reasoning,
                        status: 'COMPLETED' as const,
                    },
                },
                id: nextStepId,
                status: 'COMPLETED' as const,
            },
        }));

        events?.update('sources', current => {
            return [...(current || []), ...(context?.get('sources') || [])];
        });

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
    onError: handleError,
    route: ({ result }) => 'writer',
});
