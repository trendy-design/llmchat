import { useChatStore } from '@/libs/store/chat.store';
import { Button } from '@repo/ui';
import { CornerDownRight, X } from 'lucide-react';

export const SelectedContext = () => {
  const contextValue = useChatStore((state: any) => state.context);
  const setContextValue = useChatStore((state: any) => state.setContext);

  if (!contextValue) return null;

  return (
    <div className="flex w-full flex-row items-start justify-start gap-2 rounded-lg border border-zinc-200 bg-zinc-50 py-2 pl-2 pr-2 text-zinc-800 md:w-[640px] lg:w-[700px] dark:bg-zinc-700 dark:text-zinc-100">
      <CornerDownRight
        size={16}
        strokeWidth={2}
        className="mt-1 text-zinc-500 dark:text-zinc-400"
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
        className="ml-4 flex-shrink-0 text-zinc-500 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-600"
      />
    </div>
  );
};
