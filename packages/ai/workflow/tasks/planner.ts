import { format } from 'date-fns';
import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { generateObject } from '../utils';

export const plannerTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
        name: 'planner',
        execute: async ({ trace, events, context, data }) => {

                const currentDate = new Date();
                const humanizedDate = format(currentDate, "MMMM dd, yyyy, h:mm a");
                const messages = context?.get('messages') || [];

                // Get question from context
                const question = context?.get('question') || '';


                const prompt = `
         You're a strategic research planner. Your job is to analyze research questions and develop an initial approach to find accurate information through web searches.
                        
                        Current date and time: **${humanizedDate}**
                        
                        **Research Question**:
                        <question>
                        ${question}
                        </question>
                        
                        **Your Task**:
                        1. Identify the 2-3 most important initial aspects of this question to research first
                        2. Formulate 2-3 precise search queries that will yield the most relevant initial information
                        3. Focus on establishing a foundation of knowledge before diving into specifics
                        
                        **Search Strategy Guidelines**:
                        - Create targeted queries using search operators when appropriate
                        - Prioritize broad, foundational information for initial searches
                        - Ensure queries cover different high-priority aspects of the research question
                        
                        **Output Format (JSON)**:
                        - reasoning: A brief explanation of your initial research strategy
                        - components: An array of 2-3 core components to focus on first
                        - queries: An array of 3-5 search queries, each with a purpose field explaining what information it aims to gather any why it is important and a query field containing the actual search string
                        - priorityOrder: A suggested order for executing the queries (array of query indices)
                `;
                
                

           

                const object = await generateObject({
                        prompt,
                        model: ModelEnum.GPT_4o_Mini,
                        schema: z.object({
                                reasoning: z.string(),
                                components: z.array(z.string()),
                                queries: z.array(z.object({
                                        purpose: z.string(),
                                        query: z.string()
                                })),
                                priorityOrder: z.array(z.number()).optional()
                        }),
                        messages: messages as any
                });

                     // Update flow event with initial goal
                     events?.update('flow', (current) => ({
                        ...current,
                        goals: {
                                ...(current.goals || {}),
                                ["0"]: {
                                        text: object.reasoning,
                                        final: false,
                                        status: 'COMPLETED' as const,
                                        id: 0,
                                },
                        }
                }));

                const plan = {
                        reasoning: object.reasoning,
                        components: object.components,
                        queries: object.queries,
                        priorityOrder: object.priorityOrder
                };

                const remainingPlan = object.queries.map((q: any) => ({
                        purpose: q.purpose,
                        query: q.query
                }));
                
                

                context?.update("plan", (current) => ({
                        ...current,
                        ...plan,
                                  
                }));

                context?.update("remainingPlan", (current) => (
                       remainingPlan
                ));

                trace?.span({
                        name: 'planner',
                        input: question,
                        output: plan,
                        metadata: {
                            remainingPlan,
                        }
                })






                // const goal = {
                //         text: object.reasoning,
                //         components: object.components,
                //         final: false,
                //         id: 0,
                //         status: 'PENDING' as const,
                // }

                // const step = {
                //         type: 'search',
                //         queries: object.queries.map(q => ({
                //                 query: q.query,
                //                 purpose: q.purpose
                //         })),
                //         priorityOrder: object.priorityOrder || object.queries.map((_, i) => i),
                //         goalId: 0,
                //         final: true,
                // }

                console.log(object);

                // // Update context with new goal and step
                // context?.update('goals', (current = []) => [...current, goal]);
                // context?.update('steps', (current = []) => [...current, step]);
                // context?.update('search_queries', (current = []) => [
                //         ...current,
                //         ...object.queries.map(q => q.query)
                // ]);

                // // Update flow event with completed goal and step
                // events?.update('flow', (current) => ({
                //         ...current,
                //         goals: { ...(current.goals || {}), ["0"]: goal },
                //         steps: { ...(current.steps || {}), ["0"]: step },
                //         answer: { text: "", final: false },
                //         final: false
                // }));

                // trace?.span({ name: 'initiator', input: question, output: object, metadata: context?.getAll() });

                return {
                        plan,
                        remainingPlan,
                        

                        // goal,
                        // step
                };
        },
        route: ({ result }) => 'web-search'
}); 