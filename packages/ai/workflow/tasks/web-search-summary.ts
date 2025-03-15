import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { generateText } from '../utils';
import {format} from 'date-fns';

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
                        Role: You are a Content Synthesizer Assistant. Helping to sythesize only relevant content to the user question

                        The current date and time is: **${humanizedDate}**. Use this to ensure your reasoning and search queries are up to date with the latest information.

                        <user_question>
                        ${question}
                        </user_question>

                        **Web Search Results**
                        ${webResults?.map((result: any) => `- ${result.title}\n- ${result.content}`).join('\n')}

                        <writing_rules>
                        - Write content in continuous paragraphs using varied sentence lengths for engaging prose; avoid list formatting
                        - Use prose and paragraphs by default; only employ lists when explicitly requested by users
                        - All writing must be highly detailed with a minimum length of several thousand words, unless user explicitly specifies length or format requirements
                        - When writing based on references, actively cite original text with sources and provide a reference list with URLs at the end
                        - For lengthy documents, first save each section as separate draft files, then append them sequentially to create the final document
                        - During final compilation, no content should be reduced or summarized; the final length must exceed the sum of all individual draft files
                        </writing_rules>

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