import { createTask } from '@repo/orchestrator';
import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { generateObject, getHumanizedDate, handleError, sendEvents } from '../utils';

export const plannerTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'planner',
    execute: async ({ trace, events, context, data, signal }) => {
        const messages = context?.get('messages') || [];
        const question = context?.get('question') || '';
        const currentYear = new Date().getFullYear();
        const { updateStep, nextStepId } = sendEvents(events);

        const stepId = nextStepId();

        const prompt = `
                        You're a strategic research planner. Your job is to analyze research questions and develop an initial approach to find accurate information through web searches.
                        
                        **Research Question**:
                        <question>
                        ${question}
                        </question>
                        
                        **Your Task**:
                        1. Identify the 1-2 most important initial aspects of this question to research first
                        2. Formulate 1-2 precise search queries that will yield the most relevant initial information
                        3. Focus on establishing a foundation of knowledge before diving into specifics
                        
                        **Search Strategy Guidelines**:
                        - Create targeted queries using search operators when appropriate
                        - Prioritize broad, foundational information for initial searches
                        - Ensure queries cover different high-priority aspects of the research question
                
                        ## Query Generation Rules

- DO NOT broaden the scope beyond the original research question
- DO NOT suggest queries that would likely yield redundant information
- Each query must explore a distinct aspect
- Limit to 1-2 highly targeted queries maximum
- Format queries as direct search terms, NOT as questions
- DO NOT start queries with "how", "what", "when", "where", "why", or "who"
- Use concise keyword phrases instead of full sentences
- Use time period in queries when needed
- Maximum 8 words per query
- If user question is clear and concise, you can use it as one of the queries

**Current date and time: **${getHumanizedDate()}**

## Examples of Bad Queries:
- "How long does a Tesla Model 3 battery last?"
- "What are the economic impacts of climate change?"
- "When should I use async await in JavaScript?"
- "Why is remote work increasing productivity?"

**Important**:
- Use current date and time for the queries unless speciffically asked for a different time period
                        
                        **Output Format (JSON)**:
                        - reasoning: A brief explanation of your first step to research the question
                        - queries: 2 well-crafted search queries (4-8 words) that targets the most important aspects
                `;

        const object = await generateObject({
            prompt,
            model: ModelEnum.GPT_4o_Mini,
            schema: z.object({
                reasoning: z.string(),
                queries: z.array(z.string()),
            }),
            messages: messages as any,
            signal,
        });

        context?.update('queries', current => [...(current ?? []), ...(object?.queries || [])]);
        // Update flow event with initial goal

        updateStep({
            stepId,
            text: object.reasoning,
            stepStatus: 'PENDING',
            subSteps: {
                search: {
                    status: 'COMPLETED',
                    data: object.queries,
                },
            },
        });

        trace?.span({
            name: 'planner',
            input: prompt,
            output: object,
            metadata: {
                data,
            },
        });

        return {
            queries: object.queries,
            stepId,
        };
    },
    onError: handleError,
    route: ({ result }) => 'web-search',
});
