import { useAuth } from '@/lib/context';
import { useRootContext } from '@/libs/context/root';
import { Thread, useChatStore } from '@/libs/store/chat.store';
import { Button, Flex, Kbd, Tooltip, Type } from '@repo/ui';
import {
  IconBrandGithub,
  IconBrandX,
  IconCommand,
  IconLogin,
  IconLogout,
  IconMoon,
  IconPlus,
  IconSearch,
  IconSun,
} from '@tabler/icons-react';
import Avvvatars from 'avvvatars-react';
import moment from 'moment';
import { useTheme } from 'next-themes';
import { usePathname, useRouter } from 'next/navigation';
import { FullPageLoader } from '../full-page-loader';
import { HistoryItem } from '../history/history-item';

export const Sidebar = () => {
  const pathname = usePathname();
  const { setIsCommandSearchOpen } = useRootContext();
  const { theme, setTheme } = useTheme();
  const { push } = useRouter();
  const { open: openSignIn, logout, user } = useAuth();
  const isChatPage = pathname.startsWith('/chat');
  const threads = useChatStore(state => state.threads);
  const currentThreadId = useChatStore(state => state.currentThreadId);
  const createThread = useChatStore(state => state.createThread);
  const sortThreads = (threads: Thread[], sortBy: 'createdAt') => {
    return threads.sort((a, b) => moment(a[sortBy]).diff(moment(b[sortBy])));
  };
  const clearAllThreads = useChatStore(state => state.clearAllThreads);

  const groupedThreads: Record<string, Thread[]> = {
    today: [],
    tomorrow: [],
    last7Days: [],
    last30Days: [],
    previousMonths: [],
  };

  sortThreads(threads, 'createdAt')?.forEach(thread => {
    const createdAt = moment(thread.createdAt);
    const now = moment();
    if (createdAt.isSame(now, 'day')) {
      groupedThreads.today.push(thread);
    } else if (createdAt.isSame(now.clone().add(1, 'day'), 'day')) {
      groupedThreads.tomorrow.push(thread);
    } else if (createdAt.isAfter(now.clone().subtract(7, 'days'))) {
      groupedThreads.last7Days.push(thread);
    } else if (createdAt.isAfter(now.clone().subtract(30, 'days'))) {
      groupedThreads.last30Days.push(thread);
    } else {
      groupedThreads.previousMonths.push(thread);
    }
  });

  const renderGroup = (title: string, threads: Thread[]) => {
    if (threads.length === 0) return null;
    return (
      <Flex gap="xs" direction="col" items="start" className="w-full">
        <Type size="xs" weight="regular" className="px-2 py-1 text-muted-foreground">
          {title}
        </Type>
        <Flex className="w-full gap-0.5" gap="none" direction="col">
          {threads.map(thread => (
            <HistoryItem
              thread={thread}
              key={thread.id}
              dismiss={() => {}}
              isActive={thread.id === currentThreadId}
            />
          ))}
        </Flex>
      </Flex>
    );
  };

  return (
    <div className="border-border relative flex h-[100dvh] w-[240px] flex-shrink-0 flex-row border-r bg-secondary">
      <Flex direction="col" className="no-scrollbar w-full">
        <Flex justify="between" items="center" direction="col" className="w-full p-2" gap="xs">
          <Button
            size="sm"
            className="w-full"
            onClick={() => {
              !isChatPage && push('/chat');
              createThread();
            }}
          >
            <IconPlus size={14} strokeWidth={2} /> New Chat
          </Button>
          <Button
            size="sm"
            variant="bordered"
            className="w-full gap-2 px-2 "
            onClick={() => setIsCommandSearchOpen(true)}
          >
            <div className="flex flex-row items-center gap-1 opacity-50">
              <IconSearch size={14} strokeWidth={2} /> Search
            </div>
            <div className="flex-1" />
            <Kbd icon={IconCommand}>K</Kbd>
          </Button>
        </Flex>

        {false ? (
          <FullPageLoader />
        ) : (
          <Flex
            direction="col"
            gap="md"
            className="no-scrollbar border-border w-full flex-1 overflow-y-auto border-t p-2"
          >
            {renderGroup('Today', groupedThreads.today)}
            {renderGroup('Tomorrow', groupedThreads.tomorrow)}
            {renderGroup('Last 7 Days', groupedThreads.last7Days)}
            {renderGroup('Last 30 Days', groupedThreads.last30Days)}
            {renderGroup('Previous Months', groupedThreads.previousMonths)}
          </Flex>
        )}
        <Flex className="w-full p-2" direction="col" gap="sm">
          <Button size="icon-xs" variant="ghost" onClick={() => clearAllThreads()}>
            Clear All
          </Button>
          {!user ? (
            <Button
              size="sm"
              variant="secondary"
              className="w-full gap-2"
              onClick={() => {
                openSignIn();
              }}
            >
              <IconLogin size={14} strokeWidth={2} />
              SignIn{' '}
            </Button>
          ) : (
            <Flex
              gap="sm"
              items="center"
              className="w-full rounded-lg border border-border p-1"
            >
              <Avvvatars value={user.email || 'Anonymous'} size={24} />
              <Type size="xs" className="line-clamp-1 flex-grow">
                {user.email}
              </Type>
              <Tooltip content="Sign Out">
                <Button size="icon-xs" variant="ghost" onClick={() => logout()}>
                  <IconLogout size={14} strokeWidth={2} />
                </Button>
              </Tooltip>
            </Flex>
          )}

          {/* <Flex gap="sm" className="w-full">
            <Button
              variant="bordered"
              size="sm"
              className="w-full gap-2"
              onClick={() => {
                setOpenApiKeyModal(true);
              }}
            >
              <KeyRound size={16} strokeWidth={2} />
              Add API
            </Button>
            <Button
              variant="bordered"
              size="sm"
              className="w-full gap-2"
              onClick={() => {
                push("/settings");
              }}
            >
              <Bolt size={16} strokeWidth={2} />
              Settings
            </Button> 
          </Flex>*/}
          <Flex className="w-full items-center justify-between opacity-70">
            <Flex gap="xs">
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <IconMoon size={16} /> : <IconSun size={16} />}
              </Button>

              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => {
                  window.open('https://git.new/llmchat', '_blank');
                }}
              >
                <IconBrandGithub size={14} />
              </Button>
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => {
                  window.open('https://x.com/llmchatOS', '_blank');
                }}
              >
                <IconBrandX size={14} />
              </Button>
            </Flex>
            <Type size="xs" weight="medium" textColor="secondary" className="px-1">
              v1
            </Type>
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
};
