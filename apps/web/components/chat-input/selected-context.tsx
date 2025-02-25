import { useChatStore } from '@/libs/store/chat.store';
import { Button } from '@repo/ui';
import { CornerDownRight, X } from 'lucide-react';

export const SelectedContext = () => {
  const contextValue = useChatStore((state: any) => state.context);
  const setContextValue = useChatStore((state: any) => state.setContext);

  if (!contextValue) return null;

  return (
    <div className="flex w-full flex-row items-start justify-start gap-2 rounded-lg border border-border bg-secondary py-2 pl-2 pr-2 text-foreground md:w-[640px] lg:w-[700px]">
      <CornerDownRight
        size={16}
        strokeWidth={2}
        className="mt-1 text-muted-foreground"
      />
      <p className="ml-2 line-clamp-2 w-full overflow-hidden text-sm">{contextValue}</p>
      <Button
        size="icon-xs"
        variant="ghost"
        onClick={() => {
          setContextValue('');
        }}
        iconSize="sm"
        icon={X}
        className="ml-4 flex-shrink-0 text-muted-foreground hover:bg-muted"
      />
    </div>
  );
};
