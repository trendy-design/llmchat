import { useRootContext } from '@/libs/context/root';
import { useAppStore } from '@/libs/store/app.store';
import { Thread, useChatStore } from '@/libs/store/chat.store';
import { Button, cn, Flex, Type } from '@repo/ui';
import {
  IconArrowBarLeft,
  IconArrowBarRight,
  IconPlus,
  IconSearch
} from '@tabler/icons-react';
import moment from 'moment';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { FullPageLoader } from '../full-page-loader';
import { HistoryItem } from '../history/history-item';

export const Sidebar = () => {
  const { threadId:currentThreadId } = useParams();
  const pathname = usePathname();
  const { setIsCommandSearchOpen } = useRootContext();
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
        <p className='text-xs text-muted-foreground py-1'>
          {title}
        </p>
        <Flex className="w-full gap-0.5 border-l border-border/50 pl-2" gap="none" direction="col">
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
    <div
    // onMouseLeave={() => {
    //   if (isSidebarOpen) {
    //     setIsSidebarOpen(prev => !prev);
    //   }
    // }}
    className={cn(
      "relative flex h-[100dvh] flex-shrink-0 flex-col transition-all border-r border-border/0 duration-200",
      isSidebarOpen ? 'w-[220px] h-[99dvh] my-1 top-0 bg-background rounded-r-xl border-r border-y border-border/70' : 'w-[50px]'
    )}>
      <Flex className="w-full justify-between items-center px-2 py-2">
        {isSidebarOpen && <Type size="sm" weight="medium">deep.new</Type>}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsSidebarOpen(prev => !prev)}
          className={cn(!isSidebarOpen && "mx-auto")}
        >
          {isSidebarOpen ? <IconArrowBarLeft size={16} strokeWidth={2} /> : <IconArrowBarRight size={16} strokeWidth={2} />}
        </Button>
      </Flex>

      <Flex direction="col" className="no-scrollbar w-full flex-1">
        <Flex direction="col" className="w-full px-2" gap="sm">
        <Button
            size={isSidebarOpen ? "sm" : "icon"}
            variant="bordered"
            rounded="full"
            className={cn("w-full shadow-sm relative", "justify-center")}
            onClick={() => !isChatPage && push('/chat')}
          >
            <IconPlus size={16} strokeWidth={2} className={cn(isSidebarOpen && 'absolute left-2 ')} />
            {isSidebarOpen && "New"}
          </Button>
          <Button
            size={isSidebarOpen ? "sm" : "icon"}
            variant="secondary"
            rounded="full"
            className={cn("w-full relative", "justify-center")}
            onClick={() => setIsCommandSearchOpen(true)}
          >
            <IconSearch size={16} strokeWidth={2} className={cn(isSidebarOpen && 'absolute left-2')} />
            {isSidebarOpen && "Search"}
          </Button>
        </Flex>

        {false ? (
          <FullPageLoader />
        ) : (
          <Flex
            direction="col"
            gap="md"
            className={cn(
              "no-scrollbar w-full flex-1 border-t border-border/70 border-dashed mt-3 overflow-y-auto p-3",
              isSidebarOpen ? "flex" : "hidden"
            )}
          >
            {renderGroup('Today', groupedThreads.today)}
            {renderGroup('Tomorrow', groupedThreads.tomorrow)}
            {renderGroup('Last 7 Days', groupedThreads.last7Days)}
            {renderGroup('Last 30 Days', groupedThreads.last30Days)}
            {renderGroup('Previous Months', groupedThreads.previousMonths)}
         
          </Flex>
        )}

        <div className="flex-1" />
        
        <Flex className="w-full p-2" gap="xs" direction={"col"} justify={isSidebarOpen ? "between" : "center"}>
        
        

          {isSidebarOpen &&  <Button
          size="sm"
          className='w-full'
            variant="brand"
            rounded="full"
          >
            <span className='text-sm'>Log in</span>
          </Button>}
        
        </Flex>
      </Flex>
    </div>
  );
};
