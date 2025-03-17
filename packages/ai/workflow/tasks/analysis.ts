import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { generateText, getHumanizedDate } from '../utils';





export const analysisTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
        name: 'analysis',
        execute: async ({ trace, events, context, data }) => {

                const messages = context?.get('messages') || [];
                const question = context?.get('question') || '';
                const prevSummaries = context?.get('summaries') || [];
                const nextGoalId = Object.keys(events?.getState('flow')?.goals || {}).length;


                const prompt = `
          

                # Research Analysis Framework

Today is ${getHumanizedDate()}.

You are a Research Analyst tasked with thoroughly analyzing findings related to "${question}" before composing a comprehensive report. 

You gonna perform pre-writing analysis of the research findings.


## Research Materials

<research_findings>
${prevSummaries?.map((s, index) => `

## Finding ${index + 1}

${s}

`).join('\n\n\n')}
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

                `

                events?.update('flow', (current) => ({
                        ...current,
                        goals: {
                                ...current.goals,
                                [nextGoalId]: {
                                        text: "Analyzing the findings and the gaps in the research",
                                        final: true,
                                        status: 'COMPLETED' as const,
                                        id: nextGoalId,
                                }
                        }
                }));

                const text = await generateText({
                        prompt,
                        model: ModelEnum.Deepseek_R1,
                        onReasoning: (reasoning) => {
                                console.log("Reasoning", reasoning);
                                events?.update('flow', (current) => ({
                                        ...current,
                                        reasoning: {
                                                ...(current.reasoning || {}),
                                                text: reasoning,
                                                final: false,
                                                status: 'PENDING' as const,
                                        }
                                }))
                        }
                })

                events?.update('flow', (current) => ({
                        ...current,
                        reasoning: {
                                ...(current.reasoning || {}),
                                final: true,
                                status: 'COMPLETED' as const,
                        } as any
                }))

                console.log("Analysis", text);

                trace?.span({
                        name: 'analysis',
                        input: prompt,
                        output: text,
                        metadata: {
                                question,
                                prevSummaries,
                        }
                })



                return {
                        queries: [],
                        analysis: text,
                };
        },
        route: ({ result }) => 'final-answer'
});



