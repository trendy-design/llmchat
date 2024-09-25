import { TChatMessage, TChatSession, TCustomAssistant } from "@/lib/types";
import { generateShortUUID, sortSessions } from "@/lib/utils/utils";
import { getDB } from "@/libs/database/client";
import { schema } from "@/libs/database/schema";
import { asc, eq } from "drizzle-orm";
import moment from "moment";

export class SessionsService {
  private messagesService: MessagesService;

  constructor(messagesService: MessagesService) {
    this.messagesService = messagesService;
  }

  async getSessions(): Promise<TChatSession[]> {
    const db = await getDB();
    return db?.select().from(schema.chatSessions) || [];
  }

  async setSession(chatSession: TChatSession) {
    const db = await getDB();
    await db?.insert(schema.chatSessions).values(chatSession);
  }

  async addAssistantToSession(assistant: TCustomAssistant) {
    const db = await getDB();
    const newSession = await this.createNewSession();
    if (!newSession) return;
    const updatedSession = await db
      ?.update(schema.chatSessions)
      .set({
        customAssistant: assistant,
      })
      .where(eq(schema.chatSessions.id, newSession.id))
      .returning();
    return updatedSession?.[0] || null;
  }

  async removeAssistantFromSession(sessionId: string) {
    const db = await getDB();
    const latestSessionMessages =
      (await this.messagesService.getMessages(sessionId)) || [];
    if (!!latestSessionMessages?.length) return;
    const updatedSession = await db
      ?.update(schema.chatSessions)
      .set({
        customAssistant: null,
      })
      .where(eq(schema.chatSessions.id, sessionId))
      .returning();
    return updatedSession?.[0] || null;
  }

  async updateSession(
    sessionId: string,
    newSession: Partial<Omit<TChatSession, "id">>,
  ) {
    const db = await getDB();
    await db
      ?.update(schema.chatSessions)
      .set(newSession)
      .where(eq(schema.chatSessions.id, sessionId));
  }

  async getSessionById(id: string) {
    const db = await getDB();
    const session = await db
      ?.select()
      .from(schema.chatSessions)
      .where(eq(schema.chatSessions.id, id))
      .limit(1);
    return session?.[0] || null;
  }

  async removeSessionById(id: string) {
    try {
      this.messagesService.removeMessages(id);

      const db = await getDB();
      const deletedSession = await db
        ?.delete(schema.chatSessions)
        .where(eq(schema.chatSessions.id, id))
        .returning();

      const session = await this.getSessionById(id);
      return session;
    } catch (error) {
      console.error(error);
    }
  }

  async createNewSession(): Promise<TChatSession | null> {
    const db = await getDB();
    const sessions = await this.getSessions();

    const latestSession = sortSessions(sessions, "createdAt")?.[0];

    const latestSessionMessages =
      (await this.messagesService.getMessages(latestSession?.id)) || [];

    if (latestSession && latestSessionMessages?.length === 0) {
      return latestSession;
    }

    const newSession = await db
      ?.insert(schema.chatSessions)
      .values({
        id: generateShortUUID(),
        title: "Untitled",
        createdAt: moment().toDate(),
      })
      .returning();

    return newSession?.[0] || null;
  }

  async clearSessions() {
    const db = await getDB();
    await db?.delete(schema.chatMessages);
    await db?.delete(schema.chatSessions);
  }

  async addSessions(sessions: TChatSession[]) {
    const db = await getDB();
    await db?.insert(schema.chatSessions).values(sessions);
  }
}

export class MessagesService {
  async getAllMessages() {
    const db = await getDB();
    return await db
      ?.select()
      .from(schema.chatMessages)
      .orderBy(asc(schema.chatMessages.createdAt));
  }

  async addAllMessages(messages: TChatMessage[]) {
    const db = await getDB();

    await db?.insert(schema.chatMessages).values(messages);
  }

  async getMessages(parentId: string): Promise<TChatMessage[]> {
    const db = await getDB();

    return (
      (await db
        ?.select()
        .from(schema.chatMessages)
        .where(eq(schema.chatMessages.parentId, parentId))
        .orderBy(asc(schema.chatMessages.createdAt))) || []
    );
  }

  async setMessages(parentId: string, messages: TChatMessage[]) {
    const db = await getDB();
    await db?.insert(schema.chatMessages).values(
      messages?.map((message) => ({
        ...message,
        parentId,
        sessionId: parentId,
      })),
    );
  }

  async addMessage(parentId: string, chatMessage: TChatMessage) {
    const db = await getDB();

    await db
      ?.insert(schema.chatMessages)
      .values({
        ...chatMessage,
        parentId,
        sessionId: parentId,
      })
      .onConflictDoUpdate({
        target: schema.chatMessages.id,
        set: chatMessage,
      });
  }

  async addMessages(parentId: string, messages: TChatMessage[]) {
    const db = await getDB();

    await db?.insert(schema.chatMessages).values(
      messages?.map((message) => ({
        ...message,
        parentId,
        sessionId: parentId,
      })),
    );
  }

  async removeMessage(
    parentId: string,
    messageId: string,
  ): Promise<TChatMessage[]> {
    const db = await getDB();

    await db
      ?.delete(schema.chatMessages)
      .where(eq(schema.chatMessages.id, messageId));
    return this.getMessages(parentId);
  }

  async removeMessages(parentId: string) {
    const db = await getDB();

    await db
      ?.delete(schema.chatMessages)
      .where(eq(schema.chatMessages.parentId, parentId))
      .returning();
  }
}

const messagesServiceInstance = new MessagesService();
export const sessionsService = new SessionsService(messagesServiceInstance);
export const messagesService = messagesServiceInstance;
