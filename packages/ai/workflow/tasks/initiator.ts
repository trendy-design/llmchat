import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { generateObject } from '../utils';

export const initiatorTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
        name: 'initiator',
        execute: async ({ trace, events, context, data }) => {
                console.log('Initiator');

                // Get question from context
                const question = context?.get('question') || '';

                const prompt = `You're a smart planning and clarity agent. Your role is to analyze query for ambiguities, explore multiple interpretations, and clarify using web search when needed.

            <query>
            ${question}
            </query>

            **Task**
            - Don't rely on internal knowledge or assumptions.
            - Outline ambiguities or uncertainties present in the query.
            - Outline multiple possible interpretations or angles to explore.
            - Outline specific distinct search directions or keywords to clarify the query.

            **Output Guidelines**
            - Ouput JSON with the following fields:
            - Reasoning: your plan of action in 2-3 sentences like you're talking to user.
            - Queries: array of queries to perform web search on max 2 queries.

            **Reasonging Output**
            I need to perform web search on ...
            I need to clarify ...
            I need to find ...`;

                // Update flow event with initial goal
                events?.update('flow', (current) => ({
                        ...current,
                        goals: {
                                ...(current.goals || {}),
                                ["0"]: {
                                        text: "",
                                        final: false,
                                        status: 'PENDING' as const,
                                        id: 0,
                                },
                        }
                }));

                const object = await generateObject({
                        prompt,
                        model: ModelEnum.GPT_4o_Mini,
                        schema: z.object({
                                reasoning: z.string().optional(),
                                queries: z.array(z.string()).optional()
                        })
                });

                const goal = {
                        text: object.reasoning,
                        final: false,
                        id: 0,
                        status: 'PENDING' as const,
                }

                const step = {
                        type: 'search',
                        queries: object.queries,
                        goalId: 0,
                        final: true,
                }

                // Update context with new goal and step
                context?.update('goals', (current = []) => [...current, goal]);
                context?.update('steps', (current = []) => [...current, step]);

                // Update flow event with completed goal and step
                events?.update('flow', (current) => ({
                        ...current,
                        goals: { ...(current.goals || {}), ["0"]: goal },
                        steps: { ...(current.steps || {}), ["0"]: step },
                        answer: { text: "", final: false },
                        final: false
                }));

                trace?.span({ name: 'initiator', input: question, output: object, metadata: context?.getAll() });

                return {
                        goal,
                        step
                };
        },
        route: ({ result }) => 'web-search'
}); 