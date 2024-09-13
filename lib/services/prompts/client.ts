import { TPrompt } from "@/lib/types";
import { generateShortUUID } from "@/lib/utils/utils";
import { getDB } from "@/libs/database/client";
import { schema } from "@/libs/database/schema";
import { eq, sql } from "drizzle-orm";

export class PromptsService {
  async getPrompts(): Promise<TPrompt[]> {
    const db = await getDB();
    const prompts = await db.select().from(schema.prompts);
    return prompts || [];
  }

  async createPrompt(prompt: Omit<TPrompt, "id">): Promise<void> {
    const db = await getDB();
    const newPrompt = { ...prompt, id: generateShortUUID() };
    console.log("newPrompt", newPrompt);
    const result = await db.insert(schema.prompts).values(newPrompt);
    console.log("result", result);
  }

  async updatePrompt(
    id: string,
    prompt: Partial<Omit<TPrompt, "id">>,
  ): Promise<void> {
    const db = await getDB();
    await db
      .update(schema.prompts)
      .set(prompt)
      .where(eq(schema.prompts.id, id));
  }

  async deletePrompt(id: string): Promise<void> {
    const db = await getDB();
    await db.delete(schema.prompts).where(eq(schema.prompts.id, id));
  }

  async addPrompts(prompts: TPrompt[]): Promise<void> {
    const db = await getDB();
    await db
      .insert(schema.prompts)
      .values(prompts)
      .onConflictDoUpdate({
        target: schema.prompts.id,
        set: {
          name: sql`excluded.name`,
          content: sql`excluded.content`,
        },
      });
  }
}

export const promptsService = new PromptsService();
