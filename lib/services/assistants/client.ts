import { TAssistant, TCustomAssistant } from "@/lib/types";
import { getDB } from "@/libs/database/client";
import { schema } from "@/libs/database/schema";
import { eq } from "drizzle-orm";

export class AssistantService {
  async getLegacyAssistants(): Promise<TAssistant[]> {
    const db = await getDB();
    const assistants = await db.select().from(schema.assistants);
    return assistants || [];
  }

  async createAssistant(
    assistant: TCustomAssistant,
  ): Promise<TCustomAssistant | null> {
    const db = await getDB();
    const newAssistant = await db
      .insert(schema.customAssistants)
      .values(assistant)
      .returning();
    return newAssistant?.[0] || null;
  }

  async addAssistants(assistants: TCustomAssistant[]): Promise<void> {
    const db = await getDB();
    await db.insert(schema.customAssistants).values(assistants);
  }
  async updateAssistant(
    key: string,
    assistant: Partial<Omit<TCustomAssistant, "key">>,
  ): Promise<TCustomAssistant | null> {
    const db = await getDB();
    const updatedAssistant = await db
      .update(schema.customAssistants)
      .set(assistant)
      .where(eq(schema.customAssistants.key, key))
      .returning();
    return updatedAssistant?.[0] || null;
  }
  async getAllAssistant(): Promise<TCustomAssistant[]> {
    const db = await getDB();
    const assistants = await db.select().from(schema.customAssistants);
    return assistants || [];
  }

  async removeAssistant(key: string): Promise<void> {
    const db = await getDB();
    console.log("key", key);
    await db
      .delete(schema.customAssistants)
      .where(eq(schema.customAssistants.key, key));
  }
}

export const assistantService = new AssistantService();
