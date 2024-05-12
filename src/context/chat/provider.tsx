"use client";
import { TChatSession, useChatSession } from "@/hooks/use-chat-session";
import { TStreamProps, useLLM } from "@/hooks/use-llm";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ChatContext } from "./context";
export type TChatProvider = {
  children: React.ReactNode;
};

export const ChatProvider = ({ children }: TChatProvider) => {
  const { sessionId } = useParams();
  const { getSessions, createNewSession, getSessionById } = useChatSession();
  const [sessions, setSessions] = useState<TChatSession[]>([]);
  const [isSessionLoading, setIsSessionLoading] = useState<boolean>(true);
  const [currentSession, setCurrentSession] = useState<
    TChatSession | undefined
  >();
  const [lastStream, setLastStream] = useState<TStreamProps>();
  const { runModel } = useLLM({
    onStreamStart: () => {
      setLastStream(undefined);
    },
    onStream: async (props) => {
      setLastStream(props);
    },
    onStreamEnd: () => {
      fetchSessions().then(() => {
        setLastStream(undefined);
      });
    },
  });

  const fetchSession = async () => {
    getSessionById(sessionId.toString()).then((session) => {
      setCurrentSession(session);
    });
  };

  useEffect(() => {
    if (!sessionId) {
      return;
    }
    fetchSession();
  }, [sessionId]);

  const fetchSessions = async () => {
    const sessions = await getSessions();
    setSessions(sessions);
    setIsSessionLoading(false);
  };

  const createSession = async () => {
    const newSession = await createNewSession();
    fetchSessions();
    return newSession;
  };

  useEffect(() => {
    if (!lastStream) {
      fetchSession();
    }
  }, [lastStream]);

  useEffect(() => {
    setIsSessionLoading(true);
    fetchSessions();
  }, []);

  const refetchSessions = () => {
    fetchSessions();
  };

  return (
    <ChatContext.Provider
      value={{
        sessions,
        refetchSessions,
        isSessionLoading,
        createSession,
        runModel,
        lastStream,
        currentSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};
