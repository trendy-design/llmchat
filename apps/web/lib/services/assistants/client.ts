import { db } from '@/lib/db';
import { TAssistant, TCustomAssistant } from "@repo/shared/types";

export class AssistantService {
  async getLegacyAssistants(): Promise<TAssistant[]> {
    // Since this is legacy, we can return empty array or migrate old data
    return [];
  }

  async createAssistant(
    assistant: TCustomAssistant,
  ): Promise<TCustomAssistant | null> {
    const newAssistant = await db.customAssistants.add(assistant);
    return newAssistant ? assistant : null;
  }

  async addAssistants(assistants: TCustomAssistant[]): Promise<void> {
    await db.customAssistants.bulkAdd(assistants);
  }

  async updateAssistant(
    key: string,
    assistant: Partial<Omit<TCustomAssistant, "key">>,
  ): Promise<TCustomAssistant | null> {
    await db.customAssistants.update(key, assistant);
    return await db.customAssistants.get(key) || null;
  }

  async getAllAssistant(): Promise<TCustomAssistant[]> {
    return await db.customAssistants.toArray();
  }

  async removeAssistant(key: string): Promise<void> {
    await db.customAssistants.delete(key);
  }
}

export const assistantService = new AssistantService();
