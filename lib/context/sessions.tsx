"use client";
import { FullPageLoader } from "@/components/full-page-loader";
import { useChatSessionQueries } from "@/lib/services/sessions/queries";
import { createSessionsStore } from "@/lib/store/sessions/store";
import {
  TChatMessage,
  TChatSession,
  TSessionsContext,
  TSessionsProvider,
} from "@/lib/types";
import {
  FC,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const SessionContext = createContext<TSessionsContext | undefined>(
  undefined,
);

export const SessionsProvider: FC<TSessionsProvider> = ({ children }) => {
  const store = useMemo(() => createSessionsStore(), []);
  store?.persist?.onFinishHydration((state) => {
    if (!state?.activeSessionId) {
      createSession();
    }
  });
  const [sessions, setSessions] = useState<TChatSession[]>([]);
  const activeSessionId = store((state) => state.activeSessionId);
  const setActiveSessionId = store((state) => state.setActiveSessionId);
  const useChatSessionQueriesProps = useChatSessionQueries();
  const { sessionsQuery, createNewSessionMutation, addMessageMutation } =
    useChatSessionQueriesProps;

  useEffect(() => {
    store.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (sessionsQuery?.data) {
      setSessions(sessionsQuery.data);
    }
    if (sessionsQuery?.data?.length === 0) {
      createSession();
    }
  }, [sessionsQuery?.data]);

  const createSession = async () => {
    try {
      const data = await createNewSessionMutation.mutateAsync(undefined);
      if (data) {
        setActiveSessionId(data?.id);
      }
    } catch (error) {
      console.error("Failed to create session:", error);
    }
  };

  const addMessage = async (parentId: string, message: TChatMessage) => {
    try {
      await addMessageMutation.mutateAsync({
        parentId,
        message,
      });
    } catch (error) {
      console.error("Failed to add message:", error);
    }
  };

  if (!activeSessionId || sessions?.length === 0) {
    return <FullPageLoader label="Initializing chat" />;
  }

  return (
    <SessionContext.Provider
      value={{
        sessions,
        activeSessionId,
        setActiveSessionId,
        isAllSessionLoading: sessionsQuery.isLoading,
        createSession,
        refetchSessions: sessionsQuery.refetch,
        addMessage,
        ...useChatSessionQueriesProps,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSessions = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSessions must be used within a SessionsProvider");
  }
  return context;
};
