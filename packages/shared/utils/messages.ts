import { CoreMessage, ThreadItem } from '@repo/shared/types';

export const buildCoreMessagesFromThreadItems = ({
    messages,
    query,
    imageAttachment,
}: {
    messages: ThreadItem[];
    query: string;
    imageAttachment?: string;
}) => {
    const coreMessages: CoreMessage[] = [
        ...(messages || []).flatMap(item => {
            const userMessage = {
                role: 'user' as const,
                content: item.imageAttachment
                    ? [
                          { type: 'text' as const, text: item.query || '' },
                          { type: 'image' as const, image: item.imageAttachment },
                      ]
                    : item.query || '',
            };

            if (item.answer?.messages && item.answer.messages.length > 0) {
                const processedMessages: CoreMessage[] = [userMessage];
                const toolCallMap: Map<string, CoreMessage> = new Map();
                const toolResultMap: Map<string, CoreMessage> = new Map();
                const regularMessages: CoreMessage[] = [];

                // First pass: categorize messages
                item.answer.messages.forEach(msg => {
                    if (msg.type === 'text') {
                        regularMessages.push({
                            role: 'assistant' as const,
                            content: msg.text || '',
                        });
                    } else if (msg.type === 'tool-call' && msg.toolCallId) {
                        toolCallMap.set(msg.toolCallId, {
                            role: 'assistant' as const,
                            content: [
                                {
                                    type: 'tool-call' as const,
                                    toolCallId: msg.toolCallId,
                                    toolName: msg.toolName,
                                    args: msg.args,
                                },
                            ],
                        } as CoreMessage);
                    } else if (msg.type === 'tool-result' && msg.toolCallId) {
                        toolResultMap.set(msg.toolCallId, {
                            role: 'tool' as const,
                            content: [
                                {
                                    type: 'tool-result' as const,
                                    toolCallId: msg.toolCallId,
                                    toolName: msg.toolName,
                                    result: msg.result,
                                },
                            ],
                        });
                    }
                });

                // Second pass: add only complete tool call-result pairs and regular messages
                processedMessages.push(...regularMessages);

                toolCallMap.forEach((toolCallMessage, toolCallId) => {
                    const toolResultMessage = toolResultMap.get(toolCallId);
                    if (toolResultMessage) {
                        processedMessages.push(toolCallMessage, toolResultMessage);
                    }
                });

                return processedMessages;
            }

            return [
                userMessage,
                {
                    role: 'assistant' as const,
                    content: item.answer?.text || '',
                },
            ];
        }),
        {
            role: 'user' as const,
            content: imageAttachment
                ? [
                      { type: 'text' as const, text: query || '' },
                      { type: 'image' as const, image: imageAttachment },
                  ]
                : query || '',
        },
    ];

    return coreMessages ?? [];
};
