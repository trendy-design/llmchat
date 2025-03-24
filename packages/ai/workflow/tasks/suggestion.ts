import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../deep';
import { createTask } from '../task';
import { generateObject, getHumanizedDate } from '../utils';

const SuggestionSchema = z.object({
    questions: z.array(z.string()).describe('A list of questions to user can ask followup'),
});

export const suggestionsTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'suggestions',
    execute: async ({ trace, events, context, data, signal }) => {
        const question = context?.get('question') || '';
        const answer = context?.get('answer') || '';
        const prompt = `You are a professional research reviewer assistant tasked with suggesting followup questions to the user.
                based on the conversation, suggest 2-3 followup questions to the user.

                Current Question: ${question}

                CURRENT DATE: ${getHumanizedDate()}

                <answer>
                ${answer}
                </answer>

                - suggest new questions user might have based on the answer and the current question. make sure questions are concise and to the point.
                `;

        const object = await generateObject({
            prompt,
            model: ModelEnum.GPT_4o_Mini,
            schema: SuggestionSchema,
            signal,
        });

        events?.update('flow', current => {
            return {
                ...current,
                suggestions: object?.questions,
            };
        });

        trace?.span({
            name: 'suggestion',
            input: prompt,
            output: object,
            metadata: {
                data,
            },
        });

        return {
            suggestions: object?.questions,
        };
    },
    route: ({ result }) => {
        return 'end';
    },
});
