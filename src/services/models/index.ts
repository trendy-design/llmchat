import { defaultPreferences } from "@/config";
import { TModelItem, TModelKey, TPreferences, TProvider } from "@/types";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";

type TCreateInstance = {
  model: TModelItem;
  preferences?: Partial<TPreferences>;
  apiKey?: string;
};

export class ModelService {
  async createInstance({ model, preferences, apiKey }: TCreateInstance) {
    const { temperature, topP, topK, maxTokens, ollamaBaseUrl } = {
      ...defaultPreferences,
      ...preferences,
    };

    switch (model.provider) {
      case "openai":
        return new ChatOpenAI({
          model: model.key,
          streaming: true,
          apiKey,
          temperature,
          maxTokens,
          topP,
          maxRetries: 2,
        });
      case "anthropic":
        return new ChatAnthropic({
          model: model.key,
          anthropicApiUrl: `${window.location.origin}/api/anthropic/`,
          apiKey,
          maxTokens,
          streaming: true,
          temperature,
          topP,
          topK,
          maxRetries: 2,
        });
      case "gemini":
        return new ChatGoogleGenerativeAI({
          model: model.key,
          apiKey,
          maxOutputTokens: maxTokens,
          streaming: true,
          temperature,
          maxRetries: 1,
          onFailedAttempt: (error) => {
            console.error("Failed attempt", error);
          },
          topP,
          topK,
        });
      case "ollama":
        return new ChatOllama({
          model: model.key,
          baseUrl: ollamaBaseUrl,
          numPredict: maxTokens,
          topK,
          topP,
          maxRetries: 2,
          temperature,
        });
      default:
        throw new Error("Invalid model");
    }
  }

  getTestModelKey(key: TProvider): TModelKey {
    switch (key) {
      case "openai":
        return "gpt-3.5-turbo";
      case "anthropic":
        return "claude-3-haiku-20240307";
      case "gemini":
        return "gemini-pro";
      case "ollama":
        return "phi3:latest";
    }
  }
}

export const modelService = new ModelService();
