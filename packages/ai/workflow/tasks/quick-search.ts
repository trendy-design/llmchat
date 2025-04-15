import { createTask } from '@repo/orchestrator';
import { z } from 'zod';
import { getModelFromChatMode, ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import { readWebPagesWithTimeout, TReaderResult } from '../reader';
import {
    generateObject,
    generateText,
    getHumanizedDate,
    getSERPResults,
    handleError,
    sendEvents,
} from '../utils';

const buildWebSearchPrompt = (results: TReaderResult[]): string => {
    const today = new Date().toLocaleDateString();

    let prompt = `You are a helpful assistant that can answer questions and help with tasks.
Today is ${today}.


${results
    .map(
        (result, index) => `
<result>
    \n\n
    ## [${index + 1}] ${result.url}
    \n\n
    ### Title: ${result.title}
    \n\n
    ### Snippet: ${result.markdown}
</result>
`
    )
    .join('\n')}

## Output Requirements:

1. Content Organization:
   - Organize information in a highly scannable format with clear headings and subheadings
   - Use bullet points for key facts and findings
   - Bold important data points, statistics, and conclusions
   - Group related information from different sources together

2. Information Hierarchy:
   - Start with the most relevant and important findings first
   - Include specific details, numbers, and technical information when available
   - Highlight contradictory information or different perspectives on the same topic
   - Ensure each point adds unique value without unnecessary repetition

3. Context & Relevance:
   - Maintain focus on directly answering the user's question
   - Provide enough context for each point to be understood independently
   - Include temporal information (dates, timelines) when relevant
   - Summarize complex concepts in accessible language

4. Citations:
   - Use inline citations like [1] to reference sources
   - When information appears in multiple findings, cite all relevant sources: [1][3]
   - Make it clear when different sources have conflicting information

5. Visual Structure:
   - Use clear visual separation between different sections
   - Keep paragraphs short (3-4 lines maximum)
   - Include a brief "Key Takeaways" section at the beginning for ultra-quick consumption
   - End with any important context or limitations of the findings

Your goal is to help the user quickly understand and extract value from these search results without missing any important details.
`;

    return prompt;
};

const MAX_ALLOWED_CUSTOM_INSTRUCTIONS_LENGTH = 6000;

export const quickSearchTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'quickSearch',
    execute: async ({ events, context, signal, trace }) => {
        // Helper function to update step status

        const { updateStep, updateStatus, addSources, updateAnswer, nextStepId } =
            sendEvents(events);

        let messages =
            context
                ?.get('messages')
                ?.filter(
                    message =>
                        (message.role === 'user' || message.role === 'assistant') &&
                        !!message.content
                ) || [];

        const chatMode = context?.get('mode');
        const gl = context?.get('gl');
        const model = getModelFromChatMode(chatMode);
        const customInstructions = context?.get('customInstructions');

        if (
            customInstructions &&
            customInstructions?.length < MAX_ALLOWED_CUSTOM_INSTRUCTIONS_LENGTH
        ) {
            messages = [
                {
                    role: 'system',
                    content: `Today is ${getHumanizedDate()}. and current location is ${gl?.city}, ${gl?.country}. \n\n ${customInstructions}`,
                },
                ...messages,
            ];
        }

        const query = await generateObject({
            prompt: `Today is ${getHumanizedDate()}.${gl?.country ? `You are in ${gl?.country}\n\n` : ''}
 Generate a query to search the web for information make sure query is not too broad and be specific for recent information`,
            model: ModelEnum.GPT_4o_Mini,
            messages,
            schema: z.object({
                query: z.string(),
            }),
        });

        if (!query.query) {
            throw new Error('No query generated');
        }

        // Update search step with query and PENDING status
        updateStep({
            stepId: 0,
            stepStatus: 'PENDING',
            subSteps: {
                search: { status: 'COMPLETED', data: [query.query] },
                read: { status: 'PENDING', data: [] },
            },
        });

        const results = await getSERPResults([query.query], gl);

        if (!results || results.length === 0) {
            throw new Error('No results found');
        }

        // Mark search as COMPLETED and read as PENDING with data
        const resultsData = results.map((result: any) => ({
            title: result.title,
            link: result.link,
        }));

        updateStep({
            stepId: 0,
            stepStatus: 'PENDING',
            subSteps: {
                search: { status: 'COMPLETED' },
                read: { status: 'PENDING', data: resultsData },
            },
        });

        addSources(
            results.map((result: any, index: number) => ({
                title: result.title,
                link: result.link,
                snippet: result.snippet,
            }))
        );

        const webpageReader = await readWebPagesWithTimeout(
            results.map((result: any) => result?.link),
            30000
        );

        // Mark read as COMPLETED and wrapup as PENDING
        updateStep({
            stepId: 0,
            stepStatus: 'COMPLETED',
            subSteps: {
                read: { status: 'COMPLETED' },
            },
        });

        const stepId = nextStepId();

        console.log('stepId', stepId);

        updateStep({
            stepId,
            stepStatus: 'COMPLETED',
            subSteps: {
                wrapup: { status: 'COMPLETED' },
            },
        });

        const prompt = buildWebSearchPrompt(webpageReader);

        updateAnswer({
            text: '',
            status: 'PENDING',
        });

        const response = await generateText({
            model,
            messages: [...messages],
            prompt,
            onChunk: (chunk, fullText) => {
                updateAnswer({
                    text: chunk,
                    status: 'PENDING',
                });
            },
        });

        updateAnswer({
            text: '',
            finalText: response,
            status: 'COMPLETED',
        });

        context?.update('answer', _ => response);

        const onFinish = context?.get('onFinish');
        if (onFinish) {
            onFinish({
                answer: response,
                threadId: context?.get('threadId'),
                threadItemId: context?.get('threadItemId'),
            });
        }

        updateStatus('COMPLETED');

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
