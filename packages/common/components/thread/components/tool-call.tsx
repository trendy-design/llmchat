import { CodeBlock, ToolIcon } from '@repo/common/components';
import { ToolCall as ToolCallType } from '@repo/shared/types';
import { Badge, cn } from '@repo/ui';
import { IconCaretDownFilled } from '@tabler/icons-react';
import { memo, useCallback, useState } from 'react';

export type ToolCallProps = {
    toolCall: ToolCallType;
};

export const ToolCallStep = memo(({ toolCall }: ToolCallProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const toggleOpen = useCallback(() => setIsOpen(prev => !prev), []);

    return (
        <div className="flex w-full flex-col items-start overflow-hidden">
            <div
                className="flex w-full cursor-pointer flex-row items-center justify-between gap-2.5 pb-2 pt-2"
                onClick={toggleOpen}
            >
                <div className="flex flex-row items-center gap-2.5">
                    <ToolIcon />
                    <Badge>{toolCall.toolName}</Badge>
                </div>
                <div className="pr-2">
                    <IconCaretDownFilled
                        size={14}
                        strokeWidth={2}
                        className={cn(
                            'text-muted-foreground transform transition-transform',
                            isOpen && 'rotate-180'
                        )}
                    />
                </div>
            </div>
            {isOpen && (
                <div className="flex w-full flex-row items-center gap-2.5">
                    <CodeBlock
                        variant="secondary"
                        showHeader={false}
                        lang="json"
                        className="my-2"
                        code={JSON.stringify(toolCall.args, null, 2)}
                    />
                </div>
            )}
        </div>
    );
});

ToolCallStep.displayName = 'ToolCallStep';
