import { useChatSessionQueries } from "@/services/sessions/queries";
import { TChatMessage } from "./messages";

export type TSessionsState = {
  activeSessionId?: string;
  setActiveSessionId: (id: string) => void;
};

export type TChatSession = {
  title?: string;
  id: string;
  createdAt: string;
  updatedAt?: string;
};

export type TSessionsProvider = {
  children: React.ReactNode;
};

export type TSessionsContext = {
  sessions: TChatSession[];
  activeSessionId?: string;
  setActiveSessionId: (id: string) => void;
  isAllSessionLoading: boolean;
  createSession: () => void;
  refetchSessions?: () => void;
  addMessage: (parentId: string, message: TChatMessage) => void;
} & ReturnType<typeof useChatSessionQueries>;
