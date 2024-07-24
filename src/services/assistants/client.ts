import { generateShortUUID } from "@/helper/utils";
import { TAssistant } from "@/types";
import { get, set } from "idb-keyval";

class AssistantService {
  key = "assistants";
  async getAssistants(): Promise<TAssistant[]> {
    return (await get(this.key)) || [];
  }

  async createAssistant(assistant: Omit<TAssistant, "key">) {
    const assistants = await this.getAssistants();
    const newAssistants = [
      ...assistants,
      { ...assistant, key: generateShortUUID() },
    ];
    await set(this.key, newAssistants);
  }

  async deleteAssistant(key: string) {
    const assistants = await this.getAssistants();
    const newAssistants = assistants.filter(
      (assistant) => assistant.key !== key,
    );
    await set(this.key, newAssistants);
  }

  async updateAssistant(
    assistantKey: string,
    newAssistant: Omit<TAssistant, "key">,
  ) {
    const assistants = await this.getAssistants();
    const newAssistants = assistants.map((assistant) =>
      assistant.key === assistantKey
        ? { ...assistant, ...newAssistant }
        : assistant,
    );
    await set(this.key, newAssistants);
  }
}

export const assistantService = new AssistantService();
