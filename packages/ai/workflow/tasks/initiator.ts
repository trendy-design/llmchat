import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { generateObject } from '../utils';
import { format } from 'date-fns';

export const initiatorTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
        name: 'initiator',
        execute: async ({ trace, events, context, data }) => {
                console.log('Initiator');

                const currentDate = new Date();
                const humanizedDate = format(currentDate, "MMMM dd, yyyy, h:mm a");

                // Get question from context
                const question = context?.get('question') || '';


                const prompt = `
                        You're a smart planning and clarity agent. Your role is to analyze the query for ambiguities, explore multiple interpretations, and clarify using web search when needed. The goal is to generate precise and relevant search queries that will guide the AI agent's next steps based on current and evolving information.
                        
                        The current date and time is: **${humanizedDate}**. Use this to ensure your reasoning and search queries are up to date with the latest information.
                        
                        **Query**:

                        <query>
                        ${question}
                        </query>
                        
                        **Task**:
                        - **Don't rely on internal knowledge or assumptions**; your analysis should be based entirely on the input query and the current web context.
                        - **Identify ambiguities**: Point out areas where the query is unclear, vague, or could be interpreted in multiple ways.
                        - **Explore multiple interpretations**: Provide a few different angles the query could be approached from.
                        - **Use advanced search techniques**: Where appropriate, formulate search queries using advanced search operators like \`site:\`, \`"exact phrase"\`, \`intitle:\`, \`filetype:\`, etc. to narrow or focus the search results.
                        
                        **Output Guidelines**:
                        - Provide your answer in **JSON format** with the following fields:
                        - **Reasoning**: In 2-3 sentences, explain your plan of action as if you are talking to a user, including why you need to perform specific searches.
                        - **Queries**: An array of search queries (max 3), each crafted to clarify the query or explore multiple interpretations. Try to formulate concise and targeted search queries that cover different facets of the question.
                        
                        **Reasoning Output Example**:
                        - "I need to perform web searches on clarifying the potential interpretations of the query. Specifically, I will first check for any obvious ambiguities and then look for a few key sources that can provide clarity on the topic."
                `;
                
                

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
                context?.update('search_queries', (current = []) => [
                        ...current,
                        ...(object.queries || [])
                      ]);

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