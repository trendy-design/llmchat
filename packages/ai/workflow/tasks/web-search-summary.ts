import { format } from 'date-fns';
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
                const currentDate = new Date();
                const humanizedDate = format(currentDate, "MMMM dd, yyyy, h:mm a");
                const question = context?.get('question') || '';

                const prompt = `
                        Role: You are a Comprehensive Research Assistant. Your task is to provide detailed information from web search results that thoroughly answers the user's question.

                        The current date and time is: **${humanizedDate}**. Use this to ensure your reasoning and information are up to date.

                        <user_question>
                        ${question}
                        </user_question>

                        **Web Search Results**
                        ${webResults?.map((result: any) => `- ${result.title}\n- ${result.content}`).join('\n')}

                        <instructions>
                        - Provide a comprehensive, detailed response that includes all relevant information from the search results
                        - Include specific facts, data points, examples, and explanations from the sources
                        - be thorough without unnecessary repetition
                        - Cite sources throughout your response using [link] notation
                        </instructions>
                `;

                const summary = await generateText({
                        prompt,
                        model: ModelEnum.QWQ_32B,
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
                        input: prompt,
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
                if (executionContext.getTaskExecutionCount('web-search-summary') >= 5) {
                        return 'final-answer';
                }
                return 'reflector';
        }
}); 