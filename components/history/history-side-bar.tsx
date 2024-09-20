import { useSessions } from "@/lib/context";
import { sortSessions } from "@/lib/utils/utils";
import { useRootContext } from "@/libs/context/root";
import { TChatSession } from "@/types";
import { Button, Flex, Type } from "@/ui";
import { Command, Plus, Search } from "lucide-react";
import moment from "moment";
import { FullPageLoader } from "../full-page-loader";
import { HistoryItem } from "./history-item";

export const HistorySidebar = () => {
  const { sessions, createSession, isAllSessionLoading } = useSessions();
  const { setIsCommandSearchOpen } = useRootContext();

  const groupedSessions: Record<string, TChatSession[]> = {
    examples: [],
    today: [],
    tomorrow: [],
    last7Days: [],
    last30Days: [],
    previousMonths: [],
  };

  sortSessions(sessions, "createdAt")?.forEach((session) => {
    const createdAt = moment(session.createdAt);
    const now = moment();
    if (session.isExample) {
      groupedSessions.examples.push(session);
    } else if (createdAt.isSame(now, "day")) {
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
        <Flex items="center" gap="xs" className="px-5 py-2">
          <Type
            size="xs"
            weight="medium"
            textColor="tertiary"
            className="opacity-70"
          >
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
          direction="col"
          className="w-full px-3 py-4"
          gap="sm"
        >
          <Button size="sm" className="w-full" onClick={createSession}>
            <Plus size={14} strokeWidth={2} /> New Chat
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="w-full gap-2"
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
            {renderGroup("Examples", groupedSessions.examples)}
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
