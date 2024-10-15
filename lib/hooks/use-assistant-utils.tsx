import { ModelIcon } from "@/components/model-icon";
import { defaultPreferences } from "@/config";
import { allPlugins, models, ollamaModelsSupportsTools, lmStudioModelsSupportsTools } from "@/config/models";
import { TAssistant, TModelItem, TModelKey } from "@/lib/types";
import { useMemo } from "react";
import { usePreferenceContext } from "../context";
import { useAssistantsQueries } from "../services/assistants";

export const useAssistantUtils = () => {
  const assistantQueries = useAssistantsQueries();
  const { preferences } = usePreferenceContext();

  const ollamaModelsQuery = assistantQueries.useOllamaModelsQuery(
    preferences.ollamaBaseUrl,
  );

  const lmStudioModelsQuery = assistantQueries.useLmStudioModelsQuery(
    preferences.lmStudioBaseUrl
  )

  const parseLmStudioModelName = (name: string): string => {
    const parts = name.split("/");
    const lastPart = parts[parts.length - 1];
    return lastPart.replace(/\.gguf$/i, ""); 
  };

  const allModels: TModelItem[] = useMemo(
    () => [
      ...models,
      ...(ollamaModelsQuery.data?.models?.map(
        (model: any): TModelItem => ({
          name: model.name,
          key: model.name,
          tokens: 128000,
          plugins: ollamaModelsSupportsTools.includes(model.name)
            ? ["web_search", "webpage_reader"]
            : [],
          icon: "ollama",
          provider: "ollama",
          maxOutputTokens: 2048,
        }),
      ) || []),
      ...(lmStudioModelsQuery.data?.data?.map(
        (model: any): TModelItem => ({
          name: parseLmStudioModelName(model.id),
          key: model.id,
          tokens: 128000,
          plugins: lmStudioModelsSupportsTools.includes(model.id)
            ? allPlugins
            : [],
          icon: "lmstudio",
          provider: "lmstudio",
          maxOutputTokens: 2048,
        }),
      ) || []),
    ],
    [ollamaModelsQuery.data?.models, lmStudioModelsQuery.data?.data],
  );

  const getModelByKey = (key: TModelKey, provider: TModelKey) => {
    return allModels.find(
      (model) => model.key === key && model.provider === provider,
    );
  };

  

  const assistants: TAssistant[] = [
    ...allModels.map(
      
      (model): TAssistant => (
        {
        name: model.name,
        key: model.key,
        baseModel: model.key,
        description: model.description || null,
        provider: model.provider,
        iconURL: null,
        type: "base",
        systemPrompt:
          preferences.systemPrompt || defaultPreferences.systemPrompt,
      }),
    ),
  ];

  const getAssistantByKey = (
    key: string,
  ): { assistant: TAssistant; model: TModelItem } | undefined => {
    const assistant = assistants.find((assistant) => assistant.key === key);
    if (!assistant) return;

    const model = getModelByKey(assistant.baseModel, assistant.provider);
    if (!model) return;

    return { assistant, model };
  };

  const getAssistantIcon = (
    assistantKey: string,
    size: "sm" | "md" | "lg",
    rounded: boolean = true,
  ) => {
    const assistant = getAssistantByKey(assistantKey);

    return (
      <ModelIcon
        type={
          assistant?.assistant.type === "base"
            ? assistant?.model?.icon
            : "assistant"
        }
        rounded={rounded}
        name={assistant?.assistant.name}
        size={size}
        base64={assistant?.assistant.iconURL}
      />
    );
  };

  return {
    models: allModels,
    getModelByKey,
    getAssistantIcon,
    assistants: assistants.filter((a) =>
      allModels.some((m) => m.key === a.baseModel),
    ),
    getAssistantByKey,
    ...assistantQueries,
  };
};
