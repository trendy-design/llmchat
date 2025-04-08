import { createTask } from '@repo/orchestrator';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { ChunkBuffer, generateText, getHumanizedDate, handleError, sendEvents } from '../utils';

export const analysisTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'analysis',
    execute: async ({ trace, events, context, signal }) => {
        const messages = context?.get('messages') || [];
        const question = context?.get('question') || '';
        const prevSummaries = context?.get('summaries') || [];
        const { updateStep, nextStepId, addSources } = sendEvents(events);

        const stepId = nextStepId();

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

                `;

        const chunkBuffer = new ChunkBuffer({
            threshold: 200,
            breakOn: ['\n\n'],
            onFlush: (chunk: string, fullText: string) => {
                updateStep({
                    stepId,
                    stepStatus: 'PENDING',
                    text: chunk,
                    subSteps: {
                        reasoning: { status: 'PENDING', data: fullText },
                    },
                });
            },
        });

        const text = await generateText({
            prompt,
            model: ModelEnum.Deepseek_R1,
            messages: messages as any,
            signal,
            onReasoning: reasoning => {
                chunkBuffer.add(reasoning);
            },
        });

        chunkBuffer.flush();

        updateStep({
            stepId,
            stepStatus: 'COMPLETED',
            subSteps: {
                reasoning: { status: 'COMPLETED' },
            },
        });

        addSources(context?.get('sources') || []);

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
            stepId,
        };
    },
    onError: handleError,
    route: ({ result }) => 'writer',
});
