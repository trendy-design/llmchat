import { ModelIcon } from "@/components/icons/model-icon";
import { ChatAnthropic } from "@langchain/anthropic";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { defaultPreferences, usePreferences } from "./use-preferences";

export type TBaseModel = "openai" | "anthropic" | "gemini";

export type TModelKey =
  | "gpt-4o"
  | "gpt-4-turbo"
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0125"
  | "claude-3-opus-20240229"
  | "claude-3-sonnet-20240229"
  | "claude-3-haiku-20240307"
  | "gemini-pro"
  | "gemini-1.5-pro-latest";

export type TModel = {
  name: string;
  key: TModelKey;
  isNew?: boolean;
  icon: () => JSX.Element;
  tokens: number;
  baseModel: TBaseModel;
};

export const useModelList = () => {
  const { getPreferences } = usePreferences();
  const createInstance = async (model: TModel, apiKey: string) => {
    const preferences = await getPreferences();
    const temperature =
      preferences.temperature || defaultPreferences.temperature;
    const topP = preferences.topP || defaultPreferences.topP;
    const topK = preferences.topK || defaultPreferences.topK;
    switch (model.baseModel) {
      case "openai":
        return new ChatOpenAI({
          model: model.key,
          streaming: true,
          apiKey,
          temperature,
          topP,
        });
      case "anthropic":
        return new ChatAnthropic({
          model: model.key,
          streaming: true,
          anthropicApiUrl: `${window.location.origin}/api/anthropic/`,
          apiKey,
          temperature,
          topP,
          topK,
        });
      case "gemini":
        return new ChatGoogleGenerativeAI({
          model: model.key,
          apiKey,
          streaming: true,
          temperature,
          topP,
          topK,
        });
      default:
        throw new Error("Invalid model");
    }
  };
  const models: TModel[] = [
    {
      name: "GPT 4o",
      key: "gpt-4o",
      tokens: 128000,
      isNew: true,
      icon: () => <ModelIcon size="md" type="gpt4" />,
      baseModel: "openai",
    },
    {
      name: "GPT4 Turbo",
      key: "gpt-4-turbo",
      tokens: 128000,
      isNew: false,
      icon: () => <ModelIcon size="md" type="gpt4" />,
      baseModel: "openai",
    },
    {
      name: "GPT3.5 Turbo",
      key: "gpt-3.5-turbo",
      isNew: false,

      tokens: 16385,
      icon: () => <ModelIcon size="md" type="gpt3" />,

      baseModel: "openai",
    },
    {
      name: "GPT3.5 Turbo 0125",
      key: "gpt-3.5-turbo-0125",
      isNew: false,

      tokens: 16385,
      icon: () => <ModelIcon size="md" type="gpt3" />,

      baseModel: "openai",
    },
    {
      name: "Claude 3 Opus",
      key: "claude-3-opus-20240229",
      isNew: false,

      tokens: 200000,
      icon: () => <ModelIcon size="md" type="anthropic" />,

      baseModel: "anthropic",
    },
    {
      name: "Claude 3 Sonnet",
      key: "claude-3-sonnet-20240229",
      isNew: false,

      tokens: 200000,
      icon: () => <ModelIcon size="md" type="anthropic" />,

      baseModel: "anthropic",
    },
    {
      name: "Claude 3 Haiku",
      key: "claude-3-haiku-20240307",
      isNew: false,

      tokens: 200000,
      icon: () => <ModelIcon size="md" type="anthropic" />,
      baseModel: "anthropic",
    },
    {
      name: "Gemini Pro 1.5",
      key: "gemini-1.5-pro-latest",
      isNew: true,

      tokens: 200000,
      icon: () => <ModelIcon size="md" type="gemini" />,
      baseModel: "gemini",
    },
    {
      name: "Gemini Pro",
      isNew: false,
      key: "gemini-pro",
      tokens: 200000,
      icon: () => <ModelIcon size="md" type="gemini" />,
      baseModel: "gemini",
    },
  ];

  const getModelByKey = (key: TModelKey) => {
    return models.find((model) => model.key === key);
  };

  return { models, createInstance, getModelByKey };
};
