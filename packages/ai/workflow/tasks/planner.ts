import { createTask } from '@repo/orchestrator';
import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { generateObject, getHumanizedDate, handleError } from '../utils';

export const plannerTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'planner',
    execute: async ({ trace, events, context, data, signal }) => {
        const messages = context?.get('messages') || [];
        const question = context?.get('question') || '';
        const currentYear = new Date().getFullYear();

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

- DO NOT suggest queries similar to previous ones - review each previous query carefully
- DO NOT broaden the scope beyond the original research question
- DO NOT suggest queries that would likely yield redundant information
- ONLY suggest queries that address identified information gaps
- Each query must explore a distinct aspect not covered by previous searches
- Limit to 1-2 highly targeted queries maximum
- Format queries as direct search terms, NOT as questions
- DO NOT start queries with "how", "what", "when", "where", "why", or "who"
- Use concise keyword phrases instead of full sentences
- Maximum 8 words per query

**Current date and time: **${getHumanizedDate()}**


## Examples of Good Queries:
- "tesla model 3 battery lifespan data ${currentYear}"
- "climate change economic impact statistic ${currentYear}"
- "javascript async await performance benchmarks"
- "remote work productivity research findings"

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

        const stepId = Object.keys(events?.getState('steps')?.data || {}).length;

        context?.update('queries', current => [...(current ?? []), ...(object?.queries || [])]);
        // Update flow event with initial goal
        events?.update('steps', current => {
            return {
                ...current,

                [stepId]: {
                    text: object.reasoning,
                    steps: {
                        ...(current?.[stepId]?.steps || {}),
                        search: {
                            data: object.queries,
                            status: 'COMPLETED' as const,
                        },
                    },
                    status: 'PENDING' as const,
                    id: stepId,
                },
            };
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
