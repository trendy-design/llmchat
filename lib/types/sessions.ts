import { useChatSessionQueries } from "@/libs/services/sessions/queries";
import { TChatMessage } from "./messages";

export type TSessionsState = {
  activeSessionId?: string;
  setActiveSessionId: (id: string) => void;
};

export type TLegacyChatSession = {
  title?: string;
  id: string;
  createdAt: string;
  updatedAt?: string;
};

export type TChatSession = {
  title: string | null;
  id: string;
  isExample?: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
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
