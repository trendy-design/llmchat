"use client";
import { useChatSessionQueries } from "@/services/sessions/queries";
import {
  TChatMessage,
  TChatSession,
  TSessionsContext,
  TSessionsProvider,
} from "@/types";
import { FC, createContext, useContext, useEffect, useState } from "react";

export const SessionContext = createContext<TSessionsContext | undefined>(
  undefined,
);

export const SessionsProvider: FC<TSessionsProvider> = ({ children }) => {
  const [sessions, setSessions] = useState<TChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>();
  const useChatSessionQueriesProps = useChatSessionQueries();
  const { sessionsQuery, createNewSessionMutation, addMessageMutation } =
    useChatSessionQueriesProps;

  useEffect(() => {
    sessionsQuery?.data && setSessions(sessionsQuery?.data || []);
  }, [sessionsQuery?.data]);

  const createSession = async (props: { redirect?: boolean }) => {
    const { redirect } = props;
    await createNewSessionMutation.mutateAsync(undefined, {
      onSuccess: (data) => {
        if (redirect) {
          setActiveSessionId(data.id);
        }
      },
    });
  };

  useEffect(() => {
    createSession({ redirect: true });
  }, []);

  const addMessage = async (parentId: string, message: TChatMessage) => {
    await addMessageMutation.mutateAsync({
      parentId,
      message,
    });
  };

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
