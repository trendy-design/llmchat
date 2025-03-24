import { useCopyText } from '@/hooks/use-copy-text';
import { Button, cn } from '@repo/ui';
import { IconCheck, IconCopy, IconPencil } from '@tabler/icons-react';
import { memo, useCallback, useEffect, useRef, useState } from 'react';

type MessageProps = {
    message: string;
};

export const Message = memo(({ message }: MessageProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const messageRef = useRef<HTMLDivElement>(null);
    const [showExpandButton, setShowExpandButton] = useState(false);
    const { copyToClipboard, status } = useCopyText();
    const maxHeight = 120;

    useEffect(() => {
        if (messageRef.current) {
            setShowExpandButton(messageRef.current.scrollHeight > maxHeight);
        }
    }, [message]);

    const handleCopy = useCallback(() => {
        if (messageRef.current) {
            copyToClipboard(messageRef.current);
        }
    }, [copyToClipboard]);

    const toggleExpand = useCallback(() => setIsExpanded(prev => !prev), []);

    return (
        <div className="flex w-full flex-col items-end pt-4">
            <div className="text-foreground group relative max-w-[80%]">
                <div
                    ref={messageRef}
                    className={cn(
                        'bg-background border-border relative overflow-hidden rounded-3xl border px-3 py-2 text-base font-normal',
                        {
                            'pb-12': isExpanded,
                        }
                    )}
                    style={{
                        maxHeight: isExpanded ? 'none' : maxHeight,
                        transition: 'max-height 0.3s ease-in-out',
                    }}
                >
                    {message}

                    <div className="absolute bottom-0 left-0 right-0 hidden flex-col items-center p-1.5 group-hover:flex">
                        <div className="via-background/85 to-background flex w-full items-center justify-end gap-1 bg-gradient-to-b from-transparent">
                            {showExpandButton && (
                                <Button
                                    variant="secondary"
                                    size="xs"
                                    rounded="full"
                                    className="pointer-events-auto relative z-10 px-4"
                                    onClick={toggleExpand}
                                >
                                    {isExpanded ? 'Show less' : 'Show more'}
                                </Button>
                            )}
                            <Button
                                variant="secondary"
                                size="icon-sm"
                                rounded="full"
                                onClick={handleCopy}
                                tooltip={status === 'copied' ? 'Copied' : 'Copy'}
                            >
                                {status === 'copied' ? (
                                    <IconCheck size={14} strokeWidth={2} />
                                ) : (
                                    <IconCopy size={14} strokeWidth={2} />
                                )}
                            </Button>
                            <Button
                                variant="secondary"
                                size="icon-sm"
                                rounded="full"
                                tooltip="Edit"
                            >
                                <IconPencil size={14} strokeWidth={2} />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

Message.displayName = 'Message';
