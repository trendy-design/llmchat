import { createTask } from '@repo/orchestrator';
import { ChatMode } from '@repo/shared/config';
import { z } from 'zod';
import { ModelEnum } from '../../models';
import { WorkflowContextSchema, WorkflowEventSchema } from '../flow';
import {
    generateObject,
    generateText,
    getHumanizedDate,
    getSERPResults,
    processWebPages,
} from '../utils';

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

const buildWebSearchPrompt = (analysis: string, results: any[]): string => {
    const today = new Date().toLocaleDateString();

    let prompt = `You are a helpful assistant that can answer questions and help with tasks.
Today is ${today}.

Here is the analysis of the research findings:

<analysis>
${analysis}
</analysis>

Here are the search results:

<research_findings>
${results
    ?.map(
        (s, index) => `

## Finding ${index + 1}

<title>${s.title}</title>
<content>${s.content}</content>
<link>${s.link}</link>

`
    )
    .join('\n\n\n')}
</research_findings>

Must use citations for the findings.
<citation-method>
    - Use finding number as citations like [1], [2], etc. for referencing findings
    - Example: According to recent findings [1][3], progress in this area has accelerated
    - When information appears in multiple findings, cite all relevant findings using multiple numbers
    - Integrate citations naturally without disrupting reading flow
    - Include a numbered reference list at the end with format:
      [1] https://www.example.com
      [2] https://www.another-source.com
</citation-method>`;

    return prompt;
};

export const proSearchTask = createTask<WorkflowEventSchema, WorkflowContextSchema>({
    name: 'pro-search',
    execute: async ({ events, context, signal }) => {
        const question = context?.get('question');

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
                    ...prev?.steps?.[0],
                    id: 0,
                    status: 'PENDING',
                    steps: {
                        search: {
                            data: [query.query],
                            status: 'COMPLETED',
                        },
                        read: {
                            data: results.map((result: any) => ({
                                title: result.title,
                                link: result.link,
                            })),
                            status: 'PENDING',
                        },
                    },
                },
            },
        }));

        const webPageContent = await processWebPages(
            results?.reduce((acc: any[], result: any) => {
                acc.push({ title: result.title, link: result.link });
                return acc;
            }, []),
            signal,
            { batchSize: 4, maxPages: 8, timeout: 30000 }
        );

        const content = webPageContent.reduce((acc: string, result: any) => {
            return acc + `\n${result.title}\n${result.content}\n${result.link}`;
        }, '');

        events?.update('flow', prev => ({
            ...prev,
            steps: {
                ...prev.steps,
                0: {
                    ...prev?.steps?.[0],
                    status: 'COMPLETED',
                    id: 0,
                    steps: {
                        ...prev.steps?.[0].steps,
                        read: {
                            ...prev.steps?.[0].steps?.read,
                            status: 'COMPLETED',
                        },
                    },
                },
            },
        }));

        const analysisPrompt = `
                # Research Analysis Framework

Today is ${getHumanizedDate()}.

You are a Research Analyst tasked with thoroughly analyzing findings related to "${question}" before composing a comprehensive report. 

You gonna perform pre-writing analysis of the research findings.


## Research Materials

<research_findings>
${webPageContent
    ?.map(
        (s, index) => `

## Finding ${index + 1}

<title>${s.title}</title>
<content>${s.content}</content>
<link>${s.link}</link>

`
    )
    .join('\n\n\n')}
</research_findings>


## Analysis Instructions
- Analyze the research findings one by one and highlight the most important information which will be used to compose a comprehensive report.
- Document your analysis in a structured format that will serve as the foundation for creating a comprehensive report.



Must use citations for the findings.
<citation-method>
    - Use numbered citations like [1], [2], etc. for referencing findings
    - Example: According to recent findings [1][3], progress in this area has accelerated
    - When information appears in multiple findings, cite all relevant findings using multiple numbers
    - Integrate citations naturally without disrupting reading flow
    - Don't add citations to the end of the report, just use them in the report
</citation-method>
`;

        events?.update('flow', current => ({
            ...current,
            sources: webPageContent.map((result: any, index: number) => ({
                title: result.title,
                link: result.link,
                index: index + (current?.sources?.length || 1),
            })),
        }));

        const reasoning = await generateText({
            prompt: analysisPrompt,
            model: ModelEnum.Deepseek_R1,
            messages,
            onReasoning: chunk => {
                events?.update('flow', current => ({
                    ...current,
                    steps: {
                        ...current?.steps,
                        1: {
                            ...current?.steps?.[1],
                            steps: {
                                ...current?.steps?.[1]?.steps,
                                reasoning: {
                                    data: chunk,
                                    status: 'COMPLETED',
                                },
                            },
                            id: 1,
                            status: 'PENDING' as const,
                        },
                    },
                }));
            },
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

        events?.update('flow', current => ({
            ...current,
            steps: {
                ...current?.steps,
                1: {
                    ...current?.steps?.[1],
                    steps: {
                        ...current?.steps?.[1]?.steps,
                        reasoning: {
                            ...current?.steps?.[1]?.steps?.reasoning,
                            status: 'COMPLETED',
                        },
                    },
                    id: 1,
                    status: 'COMPLETED' as const,
                },
                2: {
                    ...current?.steps?.[2],
                    steps: {
                        ...current?.steps?.[2]?.steps,
                        wrapup: {
                            status: 'COMPLETED' as const,
                        },
                    },
                    id: 2,
                    status: 'COMPLETED' as const,
                },
            },
        }));

        const prompt = buildWebSearchPrompt(reasoning, webPageContent);

        console.log('prompt', prompt);

        // const response = await generateText({
        //     model,
        //     messages: [...messages, { role: 'user', content }],
        //     prompt,
        //     onChunk: chunk => {
        //         events?.update('flow', current => ({
        //             ...current,
        //             answer: {
        //                 ...current.answer,
        //                 text: chunk,
        //                 status: 'PENDING' as const,
        //             },
        //         }));
        //     },
        // });

        events?.update('flow', prev => ({
            ...prev,
            answer: {
                text: reasoning,
                status: 'COMPLETED',
            },
            status: 'COMPLETED',
        }));

        context?.update('answer', _ => reasoning);

        const onFinish = context?.get('onFinish');
        if (onFinish) {
            onFinish({
                answer: reasoning,
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
