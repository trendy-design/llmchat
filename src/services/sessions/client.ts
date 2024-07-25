import { generateShortUUID, sortSessions } from "@/helper/utils";
import { TChatMessage, TChatSession } from "@/types";
import { del, get, set } from "idb-keyval";
import moment from "moment";

export class SessionsService {
  private messagesService: MessagesService;

  constructor(messagesService: MessagesService) {
    this.messagesService = messagesService;
  }

  async getSessions(): Promise<TChatSession[]> {
    return (await get("chat-sessions")) || [];
  }

  async setSession(chatSession: TChatSession) {
    const sessions = await this.getSessions();
    const newSessions = [...sessions, chatSession];
    await set("chat-sessions", newSessions);
  }

  async updateSession(
    sessionId: string,
    newSession: Partial<Omit<TChatSession, "id">>,
  ) {
    const sessions = await this.getSessions();
    const newSessions = sessions.map((session) => {
      if (session.id === sessionId) {
        return { ...session, ...newSession };
      }
      return session;
    });

    await set("chat-sessions", newSessions);
  }

  async getSessionById(id: string) {
    const sessions = await this.getSessions();
    return sessions.find((session: TChatSession) => session.id === id);
  }

  async removeSessionById(id: string) {
    const sessions = await this.getSessions();
    const newSessions = sessions.filter(
      (session: TChatSession) => session.id !== id,
    );

    this.messagesService.removeMessages(id);
    await set("chat-sessions", newSessions);

    return newSessions;
  }

  async createNewSession() {
    const sessions = (await this.getSessions()) || [];

    const latestSession = sortSessions(sessions, "createdAt")?.[0];

    console.log("new session sort", latestSession);

    const latestSessionMessages =
      (await this.messagesService.getMessages(latestSession?.id)) || [];

    console.log("new session message", latestSessionMessages);

    if (latestSession && latestSessionMessages?.length === 0) {
      return latestSession;
    }

    const newSession: TChatSession = {
      id: generateShortUUID(),
      title: "Untitled",
      createdAt: moment().toISOString(),
    };

    console.log("new session", newSession);

    const newSessions = [...(sessions || []), newSession];
    await set("chat-sessions", newSessions);
    return newSession;
  }

  async clearSessions() {
    await set("chat-sessions", []);
  }

  async addSessions(sessions: TChatSession[]) {
    const existingSessions = await this.getSessions();
    const newSessions = [
      ...sessions,
      ...existingSessions?.filter(
        (existingSession) => !sessions.some((s) => s.id === existingSession.id),
      ),
    ];
    await set("chat-sessions", newSessions);
    return newSessions;
  }
}

export class MessagesService {
  async getMessages(parentId: string): Promise<TChatMessage[]> {
    return (await get(`messages-${parentId}`)) || [];
  }

  async setMessages(parentId: string, messages: TChatMessage[]) {
    await set(`messages-${parentId}`, messages);
  }

  async addMessage(parentId: string, chatMessage: TChatMessage) {
    const messages = await this.getMessages(parentId);

    const existingMessage = messages.find(
      (message) => message.id === chatMessage.id,
    );

    const newMessages = existingMessage
      ? messages.map((message) => {
          if (message.id === chatMessage.id) {
            return chatMessage;
          }
          return message;
        })
      : [...messages, chatMessage];
    await set(`messages-${parentId}`, newMessages);
  }

  async addMessages(parentId: string, messages: TChatMessage[]) {
    const existingMessages = await this.getMessages(parentId);
    const newMessages = existingMessages
      ? [
          ...messages,
          ...existingMessages.filter(
            (message) => !messages.some((m) => m.id === message.id),
          ),
        ]
      : messages;
    await set(`messages-${parentId}`, newMessages);
  }

  async removeMessage(
    parentId: string,
    messageId: string,
  ): Promise<TChatMessage[]> {
    const messages = await this.getMessages(parentId);
    const newMessages = messages.filter((message) => message.id !== messageId);
    if (!newMessages?.length) {
      await del(`messages-${parentId}`);
    } else {
      await set(`messages-${parentId}`, newMessages);
    }
    return newMessages;
  }

  async removeMessages(parentId: string) {
    await del(`messages-${parentId}`);
  }
}

const messagesServiceInstance = new MessagesService();
export const sessionsService = new SessionsService(messagesServiceInstance);
export const messagesService = messagesServiceInstance;
