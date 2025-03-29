import { createTask } from '@repo/orchestrator';
import { ChatMode } from '@repo/shared/config';
import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { generateObject, generateText, getHumanizedDate, getSERPResults } from '../utils';

const getModelFromChatMode = (mode?: string): ModelEnum => {
    switch (mode) {
        case ChatMode.GEMINI_2_FLASH:
            return ModelEnum.GEMINI_2_FLASH;
        case ChatMode.DEEPSEEK_R1:
            return ModelEnum.Deepseek_R1;
        case ChatMode.CLAUDE_3_5_SONNET:
            return ModelEnum.Claude_3_5_Sonnet;
        case ChatMode.CLAUDE_3_7_SONNET:
            return ModelEnum.Claude_3_7_Sonnet;
        case ChatMode.O3_Mini:
            return ModelEnum.O3_Mini;
        default:
            return ModelEnum.GPT_4o_Mini;
    }
};

const buildWebSearchPrompt = (results: any[]): string => {
    const today = new Date().toLocaleDateString();

    let prompt = `You are a helpful assistant that can answer questions and help with tasks.
Today is ${today}.

${results
    .map(
        (result, index) => `
<result-${index}>
    <title>${result.title}</title>
    <snippet>${result.snippet}</snippet>
    <link>${result.link}</link>
</result-${index}>
`
    )
    .join('\n')}

<citation-method>
    - Use inline citations with <Source> tags for each statement where possible.
    - Example: According to recent findings <Source>https://www.example.com</Source>, progress in this area has accelerated
    - When information appears in multiple sources, cite all relevant sources
    - Use multiple citations for each statement if multiple sources stated the same information.
    - Integrate citations naturally without disrupting reading flow
</citation-method>`;

    return prompt;
};

export const quickSearchTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'quickSearch',
    execute: async ({ events, context, signal }) => {
        const messages =
            context
                ?.get('messages')
                ?.filter(
                    message =>
                        (message.role === 'user' || message.role === 'assistant') &&
                        !!message.content
                ) || [];

        console.log('messages', messages);

        const chatMode = context?.get('mode');
        const model = getModelFromChatMode(chatMode);

        const query = await generateObject({
            prompt: `Today is ${getHumanizedDate()}. Generate a query to search the web for information make sure query is not too broad and be specific for recent information`,
            model: ModelEnum.GPT_4o_Mini,
            messages,
            schema: z.object({
                query: z.string(),
            }),
        });
        if (!query.query) {
            throw new Error('No query generated');
        }
        const results = await getSERPResults([query.query]);
        console.log(results);
        events?.update('flow', prev => ({
            ...prev,
            goals: {
                ...prev.goals,
                0: {
                    ...prev.goals?.[0],
                    status: 'PENDING',
                } as any,
            },
            steps: {
                ...prev.steps,
                0: {
                    ...prev.steps?.[0],
                    type: 'search',
                    queries: [query.query],
                    final: true,
                    status: 'COMPLETED',
                } as any,
                1: {
                    ...prev.steps?.[1],
                    type: 'read',
                    results: results.map((result: any) => ({
                        title: result.title,
                        link: result.link,
                    })),
                    final: false,
                    status: 'PENDING',
                } as any,
            },
        }));

        const searchContent = results.reduce((acc: string, result: any) => {
            return acc + `\n${result.title}\n${result.snippet}\n${result.link}`;
        }, '');

        const response = await generateText({
            model,
            messages: [...messages, { role: 'user', content: searchContent }],
            prompt: buildWebSearchPrompt(results),
            onChunk: chunk => {
                events?.update('flow', current => ({
                    ...current,
                    answer: {
                        ...current.answer,
                        text: chunk,
                        status: 'PENDING' as const,
                    },
                }));
            },
        });

        events?.update('flow', prev => ({
            ...prev,
            goals: {
                ...prev.goals,
                0: {
                    ...prev.goals?.[0],
                    status: 'COMPLETED',
                } as any,
            },
            steps: {
                ...prev.steps,
                1: {
                    ...prev.steps?.[1],
                    final: true,
                    status: 'COMPLETED',
                } as any,
            },
            answer: {
                text: response,
                final: true,
                status: 'COMPLETED',
            },
            final: true,
            status: 'COMPLETED',
        }));

        context?.update('answer', _ => response);

        const onFinish = context?.get('onFinish');
        if (onFinish) {
            onFinish({
                answer: response,
                threadId: context?.get('threadId'),
                threadItemId: context?.get('threadItemId'),
            });
        }

        return {
            retry: false,
            result: 'success',
        };
    },
    route: ({ context }) => {
        if (context?.get('showSuggestions') && context.get('answer')) {
            return 'suggestions';
        }
        return 'end';
    },
});
