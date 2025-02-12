"use client";
import { useChatSessionQueries } from "@/lib/services/sessions/queries";
import { createSessionsStore } from "@/lib/store/sessions/store";
import { TChatMessage, TSessionsContext, TSessionsProvider } from "@repo/shared/types";
import { FC, createContext, useContext, useEffect, useMemo } from "react";

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
  const activeSessionId = store((state) => state.activeSessionId);
  const setActiveSessionId = store((state) => state.setActiveSessionId);
  const useChatSessionQueriesProps = useChatSessionQueries();
  const { sessionsQuery, createNewSessionMutation, addMessageMutation } =
    useChatSessionQueriesProps;


    console.log(sessionsQuery.data, "sessionsQuery.data");

  useEffect(() => {
    store.persist.rehydrate();
  }, []);

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

  return (
    <SessionContext.Provider
      value={{
        sessions: sessionsQuery?.data || [],
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
