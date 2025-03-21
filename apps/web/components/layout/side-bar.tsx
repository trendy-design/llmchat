import { useRootContext } from '@/libs/context/root';
import { useAppStore } from '@/libs/store/app.store';
import { Thread, useChatStore } from '@/libs/store/chat.store';
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from '@clerk/nextjs';
import { Button, cn, Flex, Type } from '@repo/ui';
import {
  IconLayoutSidebar,
  IconMoon,
  IconPlus,
  IconSearch,
  IconSun
} from '@tabler/icons-react';
import moment from 'moment';
import { useTheme } from 'next-themes';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { FullPageLoader } from '../full-page-loader';
import { HistoryItem } from '../history/history-item';

export const Sidebar = () => {
  const { threadId:currentThreadId } = useParams();
  const pathname = usePathname();
  const { setIsCommandSearchOpen } = useRootContext();
  const { theme, setTheme } = useTheme();
  const { push } = useRouter();
  const isChatPage = pathname.startsWith('/chat');
  const threads = useChatStore(state => state.threads);
  const sortThreads = (threads: Thread[], sortBy: 'createdAt') => {
    return [...threads].sort((a, b) => moment(b[sortBy]).diff(moment(a[sortBy])));
  };
  const clearAllThreads = useChatStore(state => state.clearAllThreads);
  const setIsSidebarOpen = useAppStore(state => state.setIsSidebarOpen);
  const isSidebarOpen = useAppStore(state => state.isSidebarOpen);


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
        <Type size="xs" weight="regular" className="text-xs text-emerald-300/50 px-2 py-1">
          {title}
        </Type>
        <Flex className="w-full gap-0.5" gap="none" direction="col">
          {threads.map(thread => (
            <HistoryItem
              thread={thread}
              key={thread.id}
              dismiss={() => { }}
              isActive={thread.id === currentThreadId}
            />
          ))}
        </Flex>
      </Flex>
    );
  };

  return (
    <div className={cn("border-border bg-secondary/50 relative flex flex-1 h-[100dvh] pt-[1px] w-[240px] flex-shrink-0 flex-col", isSidebarOpen ? 'w-[240px]' : 'w-[50px]')}>
      <Flex className='w-full justify-between items-center px-3 pb-2 pt-4 '>
        <p className={cn('text-sm font-semibold', isSidebarOpen ? 'flex' : 'hidden')}>deep.new</p>
        <Button variant='ghost' size="icon-sm" onClick={() => setIsSidebarOpen(prev => !prev)}>
          <IconLayoutSidebar size={16} strokeWidth={2} className='opacity-50' />
        </Button>
      </Flex>
      <Flex direction="col" className="no-scrollbar w-full flex-1">
        <Flex justify="between" items="center" direction="col" className="w-full px-3" gap="xs">
        <Button
            size={isSidebarOpen ? "sm" : "icon-sm"}
            variant="ghost"
            className="w-full gap-3 px-2"
            onClick={() =>   {
              !isChatPage && push('/chat');
            }}
          >
            <div className="flex flex-row items-center gap-2 opacity-50">
              <IconPlus size={16} strokeWidth={2} /> {isSidebarOpen ? 'New' : ''}
            </div>
            {isSidebarOpen && <div className="flex-1" />}
            {/* {isSidebarOpen && <div className="flex flex-row gap-1">
              <Kbd className='w-5'><IconCommand className='size-3 shrink-0' /></Kbd>
              <Kbd>N</Kbd>
            </div>} */}
          </Button>
          <Button
            size={isSidebarOpen ? "sm" : "icon-sm"}
            variant="ghost"
            className="w-full gap-3 px-2"
            onClick={() => setIsCommandSearchOpen(true)}
          >
            <div className="flex flex-row items-center gap-2 opacity-50">
              <IconSearch size={16} strokeWidth={2} /> {isSidebarOpen ? 'Search' : ''}
            </div>
            {isSidebarOpen && <div className="flex-1" />}
            {/* {isSidebarOpen && <div className="flex flex-row gap-1">
              <Kbd className='w-5'><IconCommand className='size-3 shrink-0' /></Kbd>
              <Kbd>K</Kbd>
            </div>} */}
          </Button>
        </Flex>

        {false ? (
          <FullPageLoader />
        ) : (
          <Flex
            direction="col"
            gap="md"
            className={cn("no-scrollbar border-border w-full flex-1 overflow-y-auto p-3", isSidebarOpen ? 'flex' : 'hidden')}
          >
            {renderGroup('Today', groupedThreads.today)}
            {renderGroup('Tomorrow', groupedThreads.tomorrow)}
            {renderGroup('Last 7 Days', groupedThreads.last7Days)}
            {renderGroup('Last 30 Days', groupedThreads.last30Days)}
            {renderGroup('Previous Months', groupedThreads.previousMonths)}
            <Button variant="ghost" onClick={() => clearAllThreads()}>
              Clear All
            </Button>
          </Flex>
        )}
        <div className='flex-1' />
        <Flex className="w-full p-2.5" direction="col" gap="sm">


         
            <Flex gap="xs">
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              >
                {theme === 'dark' ? <IconMoon size={16} /> : <IconSun size={16} />}
              </Button>

            </Flex>
            <SignedOut>
            <SignInButton />
            <SignUpButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
            
        </Flex>
      </Flex>
    </div>
  );
};
