import { messagesService, sessionsService } from '@/lib/services/sessions/client';
import { TChatMessage, TChatSession, TCustomAssistant } from '@repo/shared/types';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useChatSessionQueries = () => {
  const sessionsQuery = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => sessionsService.getSessions(),
  });

  const setSessionMutation = useMutation({
    mutationFn: async (session: TChatSession) => await sessionsService.setSession(session),
    onSuccess: () => {
      sessionsQuery.refetch();
    },
  });

  const addMessageMutation = useMutation({
    mutationFn: async ({ parentId, message }: { parentId: string; message: TChatMessage }) => {
      await messagesService.addMessage(parentId, message);
      const newMessages = await messagesService.getMessages(parentId);
      return newMessages;
    },
    onSuccess: () => {
      sessionsQuery.refetch();
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({
      sessionId,
      session,
    }: {
      sessionId: string;
      session: Partial<Omit<TChatSession, 'id'>>;
    }) => {
      await sessionsService.updateSession(sessionId, session);
    },
    onSuccess: () => {
      sessionsQuery.refetch();
    },
  });

  const removeSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => await sessionsService.removeSessionById(sessionId),
    onSuccess: () => {
      sessionsQuery.refetch();
    },
  });

  const useGetSessionByIdQuery = (id: string) =>
    useQuery({
      queryKey: ['chat-session', id],
      queryFn: async () => {
        if (!id) return;
        return await sessionsService.getSessionById(id);
      },
      enabled: !!id,
    });

  const useMessagesQuery = (id: string) =>
    useQuery({
      queryKey: ['messages', id],
      queryFn: () => messagesService.getMessages(id),
      enabled: !!id,
    });

  const createNewSessionMutation = useMutation({
    mutationFn: async () => await sessionsService.createNewSession(),
    onSuccess: () => {
      sessionsQuery.refetch();
    },
  });

  const clearSessionsMutation = useMutation({
    mutationFn: async () => await sessionsService.clearSessions(),
    onSuccess: () => {
      sessionsQuery.refetch();
    },
  });

  const removeMessageByIdMutation = useMutation({
    mutationFn: async ({ parentId, messageId }: { parentId: string; messageId: string }) => {
      const leftMessages = await messagesService.removeMessage(parentId, messageId);
      if (!leftMessages?.length) {
        await sessionsService.removeSessionById(parentId);
      }
    },
    onSuccess: () => {
      sessionsQuery.refetch();
    },
  });

  const addSessionsMutation = useMutation({
    mutationFn: async (sessions: TChatSession[]) => {
      return await sessionsService.addSessions(sessions);
    },
    onSuccess: () => {
      sessionsQuery.refetch();
    },
  });

  const addAssistantToSessionMutation = useMutation({
    mutationFn: async (assistant: TCustomAssistant) => {
      return await sessionsService.addAssistantToSession(assistant);
    },
    onSuccess: () => {
      sessionsQuery.refetch();
    },
  });

  const removeAssistantFromSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return await sessionsService.removeAssistantFromSession(sessionId);
    },
    onSuccess: () => {
      sessionsQuery.refetch();
    },
  });

  return {
    sessionsQuery,
    setSessionMutation,
    addMessageMutation,
    updateSessionMutation,
    removeSessionMutation,
    useGetSessionByIdQuery,
    createNewSessionMutation,
    clearSessionsMutation,
    removeMessageByIdMutation,
    addSessionsMutation,
    useMessagesQuery,
    addAssistantToSessionMutation,
    removeAssistantFromSessionMutation,
  };
};
