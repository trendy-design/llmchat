import { defaultPreferences } from "@/config";
import { TModelItem, TModelKey, TPreferences, TProvider } from "@/types";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { ChatOllama } from "@langchain/ollama";
import { ChatOpenAI } from "@langchain/openai";
type ChatOpenAIConstructorParams = ConstructorParameters<typeof ChatOpenAI>[0];
type ChatAnthropicConstructorParams = ConstructorParameters<
  typeof ChatAnthropic
>[0];
type ChatGoogleGenerativeAIConstructorParams = ConstructorParameters<
  typeof ChatGoogleGenerativeAI
>[0];
type ChatOllamaConstructorParams = ConstructorParameters<typeof ChatOllama>[0];
type ChatGroqConstructorParams = ConstructorParameters<typeof ChatGroq>[0];

type TCreateInstance = {
  model: Omit<TModelItem, "provider">;
  preferences?: Partial<TPreferences>;
  apiKey?: string;
  provider: TProvider;
} & (
  | {
      provider: "openai";
      props?: Partial<ChatOpenAIConstructorParams>;
    }
  | {
      provider: "llmchat";
      props?: Partial<ChatOpenAIConstructorParams>;
    }
  | {
      provider: "anthropic";
      props?: Partial<ChatAnthropicConstructorParams>;
    }
  | {
      provider: "gemini";
      props?: Partial<ChatGoogleGenerativeAIConstructorParams>;
    }
  | {
      provider: "ollama";
      props?: Partial<ChatOllamaConstructorParams>;
    }
  | {
      provider: "groq";
      props?: Partial<ChatGroqConstructorParams>;
    }
);

export class ModelService {
  async createInstance({
    model,
    provider,
    preferences,
    apiKey,
    ...props
  }: TCreateInstance) {
    const { temperature, topP, topK, ollamaBaseUrl, ...rest } = {
      ...defaultPreferences,
      ...preferences,
    };

    const maxTokens =
      rest.maxTokens <= model.maxOutputTokens
        ? rest.maxTokens
        : model.maxOutputTokens;

    switch (provider) {
      case "llmchat":
        return new ChatOpenAI({
          model: model.key,
          streaming: true,
          apiKey: "ssdlk",
          configuration: {
            baseURL: `${window.location.origin}/api/llmchat/`,
          },
          temperature,
          maxTokens,
          topP,
          maxRetries: 2,
          ...props,
        });
      case "openai":
        return new ChatOpenAI({
          model: model.key,
          streaming: true,
          apiKey,
          temperature,
          maxTokens,
          topP,
          maxRetries: 2,
          ...props,
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
          ...props,
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
          ...props,
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
          ...props,
        });
      case "groq":
        return new ChatGroq({
          model: model.key,
          apiKey,
          streaming: true,
          maxTokens: maxTokens,
          maxRetries: 2,
          temperature,
          ...props,
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
      case "llmchat":
        return "llmchat";
      case "groq":
        return "llama3-8b-8192";
    }
  }
}

export const modelService = new ModelService();
