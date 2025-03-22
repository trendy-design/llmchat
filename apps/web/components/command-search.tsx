'use client';
import { useRootContext } from '@/libs/context/root';
import { useChatStore } from '@/libs/store/chat.store';
import { cn } from '@repo/shared/utils';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@repo/ui';
import { Moon, Plus, Sun } from 'lucide-react';
import moment from 'moment';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export const CommandSearch = () => {
  const { isCommandSearchOpen, setIsCommandSearchOpen } = useRootContext();
  const threads = useChatStore(state => state.threads);
  const switchThread = useChatStore(state => state.switchThread);
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (isCommandSearchOpen) {
    }
  }, [isCommandSearchOpen]);

  const onClose = () => setIsCommandSearchOpen(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsCommandSearchOpen(true);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const actions = [
    {
      name: 'New session',
      icon: Plus,
      action: () => {
        // createSession();
        onClose();
      },
    },
    {
      name: `Switch to ${theme === 'light' ? 'dark' : 'light'} mode`,
      icon: theme === 'light' ? Moon : Sun,
      action: () => {
        setTheme(theme === 'light' ? 'dark' : 'light');
        onClose();
      },
    },
  ];

  return (
    <CommandDialog open={isCommandSearchOpen} onOpenChange={setIsCommandSearchOpen}>
      <CommandInput placeholder="Search..." />
      <CommandSeparator className='opacity-50' />

      <CommandList className="pt-1">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {actions.map(action => (
            <CommandItem
              key={action.name}
              className="gap-2"
              value={action.name}
              onSelect={action.action}
            >
              <div className="flex h-6 w-6 items-center justify-center">
                <action.icon size={16} strokeWidth="2" className="flex-shrink-0" />
              </div>
              {action.name}
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandGroup heading="Recent Conversations">
          {threads.map(thread => {
            return (
              <CommandItem
                key={thread.id}
                value={`${thread.id}/${thread.title}`}
                className={cn('w-full gap-2')}
                onSelect={value => {
                  switchThread(thread.id);
                  router.push(`/c/${thread.id}`);
                  onClose();
                }}
              >
                <span className="w-full truncate">{thread.title}</span>
                <span className="text-muted-foreground flex-shrink-0 pl-4 text-xs">
                  {moment(thread.createdAt).fromNow(true)}
                </span>
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};
