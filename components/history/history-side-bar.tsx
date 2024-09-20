import { useSessions } from "@/lib/context";
import { sortSessions } from "@/lib/utils/utils";
import { useRootContext } from "@/libs/context/root";
import { TChatSession } from "@/types";
import { Button, Flex, Type } from "@/ui";
import { Command, History, Plus, Search } from "lucide-react";
import moment from "moment";
import { FullPageLoader } from "../full-page-loader";
import { HistoryItem } from "./history-item";

export const HistorySidebar = () => {
  const { sessions, createSession, isAllSessionLoading } = useSessions();
  const { setIsCommandSearchOpen } = useRootContext();

  const groupedSessions: Record<string, TChatSession[]> = {
    today: [],
    tomorrow: [],
    last7Days: [],
    last30Days: [],
    previousMonths: [],
  };

  sortSessions(sessions, "createdAt")?.forEach((session) => {
    const createdAt = moment(session.createdAt);
    const now = moment();

    if (createdAt.isSame(now, "day")) {
      groupedSessions.today.push(session);
    } else if (createdAt.isSame(now.clone().add(1, "day"), "day")) {
      groupedSessions.tomorrow.push(session);
    } else if (createdAt.isAfter(now.clone().subtract(7, "days"))) {
      groupedSessions.last7Days.push(session);
    } else if (createdAt.isAfter(now.clone().subtract(30, "days"))) {
      groupedSessions.last30Days.push(session);
    } else {
      groupedSessions.previousMonths.push(session);
    }
  });

  const renderGroup = (title: string, sessions: TChatSession[]) => {
    if (sessions.length === 0) return null;
    return (
      <>
        <Flex items="center" gap="xs" className="px-5 py-3">
          <History size={14} strokeWidth={3} className="text-zinc-500" />
          <Type size="xs" weight="medium" textColor="tertiary">
            {title}
          </Type>
        </Flex>
        <Flex className="w-full px-2.5" gap="xs" direction="col">
          {sessions.map((session) => (
            <HistoryItem
              session={session}
              key={session.id}
              dismiss={() => {}}
            />
          ))}
        </Flex>
      </>
    );
  };

  return (
    <div className="relative flex h-[100dvh] w-[260px] flex-shrink-0 flex-row border-l border-zinc-500/10">
      <Flex direction="col" className="no-scrollbar w-full">
        <Flex
          justify="between"
          items="center"
          className="w-full border-b border-zinc-500/10 px-3 py-3"
        >
          <Button rounded="full" className="w-full" onClick={createSession}>
            <Plus size={14} strokeWidth={2} /> New Chat
          </Button>
        </Flex>
        <Flex justify="between" items="center" className="w-full px-3 py-2">
          <Button
            size="sm"
            variant="secondary"
            className="w-full gap-2"
            rounded="full"
            onClick={() => setIsCommandSearchOpen(true)}
          >
            <Search size={14} strokeWidth={2} /> Search
            <Flex items="center" gap="xs">
              <Command size={12} /> K
            </Flex>
          </Button>
        </Flex>
        {isAllSessionLoading ? (
          <FullPageLoader />
        ) : (
          <Flex direction="col" className="no-scrollbar w-full overflow-y-auto">
            {renderGroup("Today", groupedSessions.today)}
            {renderGroup("Tomorrow", groupedSessions.tomorrow)}
            {renderGroup("Last 7 Days", groupedSessions.last7Days)}
            {renderGroup("Last 30 Days", groupedSessions.last30Days)}
            {renderGroup("Previous Months", groupedSessions.previousMonths)}
          </Flex>
        )}
      </Flex>
    </div>
  );
};
