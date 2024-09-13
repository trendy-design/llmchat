import { TAssistant } from "@/lib/types";
import { generateShortUUID } from "@/lib/utils/utils";
import { getDB } from "@/libs/database/client";
import { schema } from "@/libs/database/schema";
import { eq, sql } from "drizzle-orm";

export class AssistantService {
  async getAssistants(): Promise<TAssistant[]> {
    const db = await getDB();
    const assistants = await db.select().from(schema.assistants);
    return assistants || [];
  }

  async createAssistant(assistant: Omit<TAssistant, "key">) {
    const db = await getDB();
    const newAssistant = { ...assistant, key: generateShortUUID() };
    await db
      .insert(schema.assistants)
      .values(newAssistant)
      .onConflictDoUpdate({
        target: schema.assistants.key,
        set: {
          ...newAssistant,
        },
      });
  }

  async deleteAssistant(key: string) {
    const db = await getDB();
    await db.delete(schema.assistants).where(eq(schema.assistants.key, key));
  }

  async updateAssistant(
    assistantKey: string,
    newAssistant: Omit<TAssistant, "key">,
  ) {
    const db = await getDB();
    await db
      .update(schema.assistants)
      .set(newAssistant)
      .where(eq(schema.assistants.key, assistantKey));
  }

  async addAssistants(assistants: TAssistant[]) {
    const db = await getDB();
    await db
      .insert(schema.assistants)
      .values(assistants)
      .onConflictDoUpdate({
        target: schema.assistants.key,
        set: {
          name: sql`excluded.name`,
          description: sql`excluded.description`,
          baseModel: sql`excluded.baseModel`,
          provider: sql`excluded.provider`,
          systemPrompt: sql`excluded.systemPrompt`,
          type: sql`excluded.type`,
          iconURL: sql`excluded.iconURL`,
        },
      });
  }
}

export const assistantService = new AssistantService();
