import { generateShortUUID } from "@/helper/utils";
import { TPrompt } from "@/types";
import { get, set } from "idb-keyval";

export class PromptsService {
  constructor() {}

  async getPrompts(): Promise<TPrompt[]> {
    return (await get("prompts")) || [];
  }

  async setPrompt(prompt: Omit<TPrompt, "id">): Promise<TPrompt[]> {
    const prompts = await this.getPrompts();
    const newPrompts = [...prompts, { id: generateShortUUID(), ...prompt }];
    await set("prompts", newPrompts);
    return newPrompts;
  }

  async updatePrompt(
    id: string,
    prompt: Partial<Omit<TPrompt, "id">>,
  ): Promise<TPrompt[]> {
    const prompts = await this.getPrompts();
    const newPrompts = prompts.map((p) =>
      p.id === id ? { ...p, ...prompt } : p,
    );
    await set("prompts", newPrompts);
    return newPrompts;
  }

  async deletePrompt(id: string) {
    const prompts = await this.getPrompts();
    const newPrompts = prompts?.filter((prompt) => prompt.id !== id) || [];
    await set("prompts", newPrompts);
  }

  async addPrompts(prompts: TPrompt[]) {
    const existingPrompts = await this.getPrompts();
    const newPrompts = [
      ...prompts,
      ...existingPrompts?.filter((p) => prompts.some((np) => np.id !== p.id)),
    ];
    await set("prompts", newPrompts);
    return newPrompts;
  }
}

export const promptsService = new PromptsService();
