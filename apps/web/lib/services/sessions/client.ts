import { db } from '@/lib/db';
import { TChatMessage, TChatSession, TCustomAssistant } from '@repo/shared/types';
import { generateShortUUID, sortSessions } from '@repo/shared/utils';
import moment from 'moment';

export class MessagesService {
  async getAllMessages() {
    return await db.chatMessages.orderBy('createdAt').toArray();
  }

  async addAllMessages(messages: TChatMessage[]) {
    await db.chatMessages.bulkAdd(messages);
  }

  async getMessages(parentId: string): Promise<TChatMessage[]> {
    return await db.chatMessages.where('parentId').equals(parentId).sortBy('createdAt');
  }

  async addMessage(parentId: string, chatMessage: TChatMessage) {
    await db.chatMessages.put({
      ...chatMessage,
      parentId,
      sessionId: parentId,
    });
  }

  async addMessages(parentId: string, messages: TChatMessage[]) {
    const messagesWithParent = messages.map((message) => ({
      ...message,
      parentId,
      sessionId: parentId,
    }));
    await db.chatMessages.bulkAdd(messagesWithParent);
  }

  async removeMessage(parentId: string, messageId: string): Promise<TChatMessage[]> {
    await db.chatMessages.delete(messageId);
    return this.getMessages(parentId);
  }

  async removeMessages(parentId: string) {
    await db.chatMessages.where('parentId').equals(parentId).delete();
  }
}

export class SessionsService {
  private messagesService: MessagesService;

  constructor(messagesService: MessagesService) {
    this.messagesService = messagesService;
  }

  async getSessions(): Promise<TChatSession[]> {
    return await db.chatSessions.toArray();
  }

  async setSession(chatSession: TChatSession) {
    await db.chatSessions.add(chatSession);
  }

  async addAssistantToSession(assistant: TCustomAssistant) {
    const newSession = await this.createNewSession();
    if (!newSession) return null;

    await db.chatSessions.update(newSession.id, {
      customAssistant: assistant,
    });

    return (await db.chatSessions.get(newSession.id)) || null;
  }

  async removeAssistantFromSession(sessionId: string) {
    const latestSessionMessages = (await this.messagesService.getMessages(sessionId)) || [];
    if (!!latestSessionMessages?.length) return;
    await db.chatSessions.update(sessionId, {
      customAssistant: null,
    });
  }

  async updateSession(sessionId: string, newSession: Partial<Omit<TChatSession, 'id'>>) {
    await db.chatSessions.update(sessionId, newSession);
  }

  async getSessionById(id: string) {
    return (await db.chatSessions.get(id)) || null;
  }

  async removeSessionById(id: string) {
    try {
      this.messagesService.removeMessages(id);

      await db.chatSessions.delete(id);

      const session = await this.getSessionById(id);
      return session;
    } catch (error) {
      console.error(error);
    }
  }

  async createNewSession(): Promise<TChatSession | null> {
    const sessions = await this.getSessions();
    const latestSession = sortSessions(sessions, 'createdAt')?.[0];

    // Only try to get messages if we have a valid session ID
    const latestSessionMessages = latestSession?.id
      ? await this.messagesService.getMessages(latestSession.id)
      : [];

    if (latestSession && latestSessionMessages?.length === 0) {
      return latestSession;
    }

    const newSession = await db.chatSessions.add({
      id: generateShortUUID(),
      title: 'Untitled',
      createdAt: moment().toDate(),
      updatedAt: moment().toDate(),
    });

    return newSession as unknown as TChatSession;
  }

  async clearSessions() {
    await db.chatMessages.clear();
    await db.chatSessions.clear();
  }

  async addSessions(sessions: TChatSession[]) {
    await db.chatSessions.bulkAdd(sessions);
  }
}

const messagesServiceInstance = new MessagesService();
export const sessionsService = new SessionsService(messagesServiceInstance);
export const messagesService = messagesServiceInstance;
