import { useChatStore } from '@repo/common/store';
import { Button } from '@repo/ui';
import { CornerDownRight } from 'lucide-react';

export const SelectedContext = () => {
    const contextValue = useChatStore((state: any) => state.context);
    const setContextValue = useChatStore((state: any) => state.setContext);

    if (!contextValue) return null;

    return (
        <div className="border-border bg-secondary text-foreground flex w-full flex-row items-start justify-start gap-2 rounded-lg border py-2 pl-2 pr-2 md:w-[640px] lg:w-[700px]">
            <CornerDownRight size={16} strokeWidth={2} className="text-muted-foreground mt-1" />
            <p className="ml-2 line-clamp-2 w-full overflow-hidden text-sm">{contextValue}</p>
            <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => {
                    setContextValue('');
                }}
                iconSize="sm"
                className="text-muted-foreground hover:bg-muted ml-4 flex-shrink-0"
            />
        </div>
    );
};
