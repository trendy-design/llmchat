import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { generateText } from '../utils';

export const webSearchSummaryTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
        name: 'web-search-summary',
        execute: async ({ data, trace, events, context }) => {
                console.log('web-search-summary');

                const currentGoal = data.goal;
                const lastStep = data.step;
                const webResults = data.webSearchResults;

                const prompt = `
    You are a smart summarizer. Your role is to summarize the web search results.

    **Web Search Results**
    ${webResults?.map((result: any) => `- ${result.title}\n- ${result.content}`).join('\n')}
    `;

                const summary = await generateText({
                        prompt,
                        model: ModelEnum.GPT_4o_Mini,
                });

                // Update typed context with the new summary
                context?.update('summaries', (current = []) => [...current, summary]);

                // Update flow event with the completed goal
                if (currentGoal?.id) {
                        events?.update('flow', (current) => {
                                const updatedGoals = { ...(current.goals || {}) };
                                if (updatedGoals[currentGoal.id]) {
                                        updatedGoals[currentGoal.id] = {
                                                ...updatedGoals[currentGoal.id],
                                                final: true,
                                                id: currentGoal.id,
                                                status: 'COMPLETED' as const
                                        };
                                }
                                return {
                                        ...current,
                                        goals: updatedGoals,
                                };
                        });
                }

                trace?.span({
                        name: 'web-search-summary',
                        input: webResults,
                        output: summary,
                        metadata: {
                                webResults,
                        }
                });

                return {
                        goal: currentGoal,
                        step: lastStep,
                        summary,
                };
        },
        route: ({ executionContext, config }) => {
                const maxIterations = config?.maxIterations || 3;
                if (executionContext.getTaskExecutionCount('web-search-summary') >= Math.floor(maxIterations / 2)) {
                        return 'final-answer';
                }
                return 'reflector';
        }
}); 