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
<result>
    \n\n
    ## [${index + 1}] ${result.link}
    \n\n
    ### Title: ${result.title}
    \n\n
    ### Snippet: ${result.snippet}
</result>
`
    )
    .join('\n')}

**Must use citations for the findings**\n\n
<citation-method>
    - Use numbered citations like [1], [2], etc. for referencing findings
    - Example: According to recent findings [1][3], progress in this area has accelerated
    - When information appears in multiple findings, cite all relevant findings using multiple numbers
    - Integrate citations naturally without disrupting reading flow
    - Don't add citations to the end of the report, just use them in the report
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
            steps: {
                ...prev.steps,
                0: {
                    ...prev.steps?.[0],
                    id: 0,
                    status: 'COMPLETED',
                    steps: {
                        ...prev.steps?.[0]?.steps,
                        search: {
                            data: [query.query],
                            status: 'COMPLETED',
                        },
                        read: {
                            data: results.map((result: any) => ({
                                title: result.title,
                                link: result.link,
                            })),
                            status: 'COMPLETED',
                        },
                    },
                },
                1: {
                    ...prev.steps?.[1],
                    status: 'COMPLETED',
                    id: 1,
                    steps: {
                        ...prev.steps?.[1]?.steps,
                        wrapup: {
                            status: 'COMPLETED',
                        },
                    },
                } as any,
            },
            sources: results.map((result: any, index: number) => ({
                title: result.title,
                link: result.link,
                index: index + (prev?.sources?.length || 1),
            })),
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

            answer: {
                text: response,
                status: 'COMPLETED',
            },
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
