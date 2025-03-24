import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { generateObject, getHumanizedDate } from '../utils';

const ClarificationResponseSchema = z.object({
    needsClarification: z.boolean(),
    reasoning: z.string().min(1).describe('Explanation of why clarification is needed').optional(),
    clarifyingQuestion: z.object({
        question: z.string().min(1).describe('A specific question to ask the user'),
        type: z
            .enum(['multiple'])
            .describe('The type of choice the user can make. you can also give multiple choices'),
        options: z.array(z.string()).min(1).max(3).describe('2-3 options for the question'),
    }),
    refinedQuery: z
        .string()
        .describe(
            'Refined query with the same format as the original query but more specific and accurate'
        )
        .optional(),
});

export const refineQueryTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'refine-query',
    execute: async ({ trace, events, context, data, signal }) => {
        const messages = context?.get('messages') || [];
        const question = context?.get('question') || '';

        console.log('question', question);
        console.log('messages', messages);

        const prompt = `You are a professional research assistant tasked with refining user queries for deep research.

                CURRENT DATE: ${getHumanizedDate()}

                Analyze the user's question and current query to determine if it's specific and effective for research purposes.
                You can also give multiple choices for the clarifying questions to enhance the user query.

                If the query is already well-formed:
                - Return needsClarification: false
                - Provide a refinedQuery that enhances the original while maintaining its format

                If the query needs improvement:
                - Return needsClarification: true
                - Provide reasoning explaining why clarification is needed
                - Include 1-2 clarifying questions with 2-3 answer options each

                If user has replied to clarifying questions, return needsClarification: false
                - Provide a refinedQuery that incorporates the user's response

                Based on the user's conversation, refine the query to enable deep, comprehensive research.`;

        const object = await generateObject({
            prompt,
            model: ModelEnum.GPT_4o_Mini,
            schema: ClarificationResponseSchema,
            messages: messages as any,
            signal,
        });

        console.log('object', object);

        if (object?.needsClarification) {
            events?.update('flow', current => {
                return {
                    ...current,
                    answer: {
                        text: object.reasoning,
                        object: object,
                        objectType: 'clarifyingQuestions',
                        final: true,
                        status: 'COMPLETED',
                    },
                };
            });
        } else {
            context?.update('question', current => object?.refinedQuery || question);
        }

        trace?.span({
            name: 'refine-query',
            input: prompt,
            output: object,
            metadata: {
                data,
            },
        });

        return {
            needsClarification: object?.needsClarification,
            refinedQuery: object?.refinedQuery || question,
        };
    },
    onError: (error, { context, events }) => {
        console.error('Task failed', error);
        events?.update('flow', prev => ({
            ...prev,
            error: 'Something went wrong while processing your request. Please try again.',
            status: 'ERROR',
        }));
        return Promise.resolve({
            retry: false,
            result: 'error',
        });
    },
    route: ({ result }) => {
        if (result?.needsClarification) {
            return 'end';
        }

        return 'planner';
    },
});
