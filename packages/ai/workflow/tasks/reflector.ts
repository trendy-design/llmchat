import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { generateObject, getHumanizedDate } from '../utils';

export const reflectorTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
        name: 'reflector',
        execute: async ({ trace, data, events, context, executionContext, config }) => {

                const question = context?.get('question') || '';
                const prevQueries = context?.get('queries') || [];
                const goalId = data?.goalId;
                const prevSummaries = context?.get('summaries') || [];
                const currentYear = new Date().getFullYear();

                const prompt = `
You are a research progress evaluator analyzing how effectively a research question has been addressed. Your primary responsibility is to identify remaining knowledge gaps and determine if additional targeted queries are necessary.

## Current Research State

Research Question: "${question}"

Previous Search Queries:
${prevQueries?.join('\n')}

Research Findings So Far:
${prevSummaries?.join('\n---\n')}

Current date: ${getHumanizedDate()}

## Evaluation Framework

1. Comprehensively assess how well the current findings answer the original research question
2. Identify specific information gaps that prevent fully answering the research question
3. Determine if these gaps warrant additional queries or if the question has been sufficiently addressed

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

## Output Format
{
  "reasoning": "Your analysis of current research progress, specifically identifying what aspects of the question remain unanswered and why additional queries would provide valuable new information (or why the research is complete).",
  "queries": ["direct search term 1", "direct search term 2"] // Return null if research is sufficient or if no non-redundant queries can be formulated
}

CRITICAL: Your primary goal is to avoid redundancy. If you cannot identify genuinely new angles to explore that would yield different information, return null for queries.
`

                const object = await generateObject({
                        prompt,
                        model: ModelEnum.GPT_4o_Mini,
                        schema: z.object({
                                reasoning: z.string(),
                                queries: z.array(z.string()).optional()
                        })

                });

                const newGoalId = goalId + 1;

                context?.update('queries', (current) => [...(current ?? []), ...(object?.queries ?? [])]);



                // Update flow event with initial goal
                events?.update('flow', (current) => {
                        const stepId = Object.keys(current.steps || {}).length;
                        return {
                                ...current,
                                goals: {
                                        ...(current.goals || {}),
                                        [newGoalId]: {
                                                text: object.reasoning,
                                                final: false,
                                                status: 'PENDING' as const,
                                                id: newGoalId,
                                        },
                                },
                                steps: {
                                        ...(current.steps || {}),
                                        [stepId]: {
                                                type: 'search',
                                                queries: object.queries,
                                                status: "COMPLETED" as const,
                                                goalId: newGoalId,
                                                final: true,
                                        },
                                },
                        }
                });



                trace?.span({
                        name: 'reflector',
                        input: prompt,
                        output: object,
                        metadata: {

                                data
                        }
                })

                return {
                        queries: object?.queries,
                        goalId: newGoalId
                };

        },
        route: ({ result, executionContext, config, context }) => {

                if (result?.queries?.filter(Boolean)?.length > 0) {
                        return 'web-search';
                }

                return 'analysis';
        }
}); 