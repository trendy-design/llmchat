import { createTask } from '@repo/orchestrator';
import { z } from 'zod';
import { getModelFromChatMode, ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import {
    generateObject,
    generateText,
    getHumanizedDate,
    getSERPResults,
    handleError,
} from '../utils';

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

        if (!results || results.length === 0) {
            throw new Error('No results found');
        }

        events?.update('steps', prev => ({
            ...prev,
            0: {
                ...prev?.[0],
                id: 0,
                status: 'COMPLETED',
                steps: {
                    ...prev?.[0]?.steps,
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
                ...prev?.[1],
                status: 'COMPLETED',
                id: 1,
                steps: {
                    ...prev?.[1]?.steps,
                    wrapup: {
                        status: 'COMPLETED',
                    },
                },
            },
        }));

        events?.update('sources', prev => ({
            ...prev,
            ...results.map((result: any, index: number) => ({
                title: result.title,
                link: result.link,
            })),
        }));

        const searchContent = results.reduce((acc: string, result: any) => {
            return acc + `\n${result.title}\n${result.snippet}\n${result.link}`;
        }, '');

        const response = await generateText({
            model,
            messages: [...messages, { role: 'user', content: searchContent }],
            prompt: buildWebSearchPrompt(results),
            onChunk: (chunk, fullText) => {
                events?.update('answer', current => ({
                    ...current,
                    text: chunk,
                    status: 'PENDING' as const,
                }));
            },
        });

        events?.update('answer', prev => ({
            ...prev,
            text: undefined,
            fullText: response,
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

        events?.update('status', prev => 'COMPLETED');

        return {
            retry: false,
            result: 'success',
        };
    },
    onError: handleError,
    route: ({ context }) => {
        if (context?.get('showSuggestions') && context.get('answer')) {
            return 'suggestions';
        }
        return 'end';
    },
});
