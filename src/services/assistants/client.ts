import { TAssistant } from "@/types";
import { get, set } from "idb-keyval";
import { v4 } from "uuid";

class AssistantService {
  key = "assistants";
  async getAssistants(): Promise<TAssistant[]> {
    return (await get(this.key)) || [];
  }

  async createAssistant(assistant: Omit<TAssistant, "key">) {
    const assistants = await this.getAssistants();
    const newAssistants = [...assistants, { ...assistant, key: v4() }];
    await set(this.key, newAssistants);
  }

  async deleteAssistant(key: string) {
    const assistants = await this.getAssistants();
    const newAssistants = assistants.filter(
      (assistant) => assistant.key !== key
    );
    await set(this.key, newAssistants);
  }

  async updateAssistant(
    assistantKey: string,
    newAssistant: Omit<TAssistant, "key">
  ) {
    const assistants = await this.getAssistants();
    const newAssistants = assistants.map((assistant) =>
      assistant.key === assistantKey
        ? { ...assistant, ...newAssistant }
        : assistant
    );
    await set(this.key, newAssistants);
  }
}

export const assistantService = new AssistantService();
