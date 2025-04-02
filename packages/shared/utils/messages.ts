import { ThreadItem } from '@repo/shared/types';

export const buildCoreMessagesFromThreadItems = ({
    messages,
    query,
    imageAttachment,
}: {
    messages: ThreadItem[];
    query: string;
    imageAttachment?: string;
}) => {
    const coreMessages = [
        ...(messages || []).flatMap(item => [
            {
                role: 'user' as const,
                content: item.imageAttachment
                    ? [
                          { type: 'text' as const, text: item.query || '' },
                          { type: 'image' as const, image: item.imageAttachment },
                      ]
                    : item.query || '',
            },
            {
                role: 'assistant' as const,
                content: item.answer?.text || '',
            },
        ]),
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
