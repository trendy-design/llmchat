import { createTask } from '@repo/orchestrator';
import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { generateObject, getHumanizedDate, handleError } from '../utils';

const ClarificationResponseSchema = z.object({
    needsClarification: z.boolean(),
    reasoning: z.string().optional(),
    clarifyingQuestion: z
        .object({
            question: z.string(),
            choiceType: z.enum(['multiple', 'single']),
            options: z.array(z.string()).min(1).max(3),
        })
        .optional(),
    refinedQuery: z.string().optional(),
});

export const refineQueryTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'refine-query',
    execute: async ({ trace, events, context, data, signal }) => {
        const messages = context?.get('messages') || [];
        const question = context?.get('question') || '';

        const prompt = `You are a professional research assistant tasked with refining user queries for deep research.

                CURRENT DATE: ${getHumanizedDate()}

                Analyze the user's question to determine if it needs clarification before research.

                For well-formed queries:
                - Return needsClarification: false
                - Provide a refinedQuery that enhances the original

                For queries needing improvement:
                - Return needsClarification: true
                - Provide reasoning explaining why
                - Include clarifying questions with 2-3 options
                - The choiceType should be single or multiple based on the question

                If the user has already responded to previous clarifying questions:
                - Return needsClarification: false
                - Provide a refinedQuery incorporating their response
                
                If the user has not responded to clarifying questions:
                - Return needsClarification: false
                - Use the original query
                
                `;

        const object = await generateObject({
            prompt,
            model: ModelEnum.GPT_4o_Mini,
            schema: ClarificationResponseSchema,
            messages: messages as any,
            signal,
        });

        if (object?.needsClarification) {
            events?.update('answer', current => {
                return {
                    ...current,
                    text: object.reasoning,
                    finalText: object.reasoning,
                    status: 'COMPLETED',
                };
            });
            object?.clarifyingQuestion &&
                events?.update('object', current => {
                    return {
                        clarifyingQuestion: object?.clarifyingQuestion,
                    };
                });

            events?.update('status', prev => 'COMPLETED');
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
    onError: handleError,
    route: ({ result }) => {
        if (result?.needsClarification) {
            return 'end';
        }

        return 'planner';
    },
});
