import { ModelIcon, ModelIconType } from "@/components/model-icon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Flex } from "@/components/ui/flex";
import { usePreferenceContext, useSettingsContext } from "@/context";
import { cn } from "@/lib/utils";
import { TBaseModel } from "@/types";
import { AlertCircleIcon, CheckmarkCircle02Icon } from "@hugeicons/react";
import { useEffect, useState } from "react";
import { AnthropicSettings } from "./anthropic";
import { GeminiSettings } from "./gemini";
import { OllamaSettings } from "./ollama";
import { OpenAISettings } from "./openai";

export const ModelSettings = () => {
  const { selected } = useSettingsContext();
  const { apiKeys } = usePreferenceContext();
  const [selectedModel, setSelectedModel] = useState<TBaseModel>("openai");

  useEffect(() => {
    if (selected.startsWith("models/")) {
      const model = selected?.split("/")?.[1];
      setSelectedModel(model as TBaseModel);
    }
  }, [selected]);
  const modelSettingsData = [
    {
      value: "openai",
      label: "OpenAI",
      iconType: "openai",
      connected: !!apiKeys.openai,
      settingsComponent: OpenAISettings,
    },
    {
      value: "anthropic",
      label: "Anthropic",
      iconType: "anthropic",
      connected: !!apiKeys.anthropic,

      settingsComponent: AnthropicSettings,
    },
    {
      value: "gemini",
      label: "Gemini",
      iconType: "gemini",
      connected: !!apiKeys.gemini,

      settingsComponent: GeminiSettings,
    },
    {
      value: "ollama",
      label: "Ollama",
      iconType: "ollama",
      connected: !!apiKeys.ollama,
      settingsComponent: OllamaSettings,
    },
  ];
  return (
    <Flex direction="col" gap="sm" className="p-4">
      <Accordion
        type="single"
        value={selectedModel}
        collapsible
        className="w-full"
        onValueChange={(value) => {
          setSelectedModel(value as TBaseModel);
        }}
      >
        {modelSettingsData.map((model) => (
          <AccordionItem key={model.value} value={model.value}>
            <AccordionTrigger>
              <Flex gap="sm" items="center">
                <ModelIcon type={model.iconType as ModelIconType} size="sm" />
                {model.label}
              </Flex>
              <Flex className="flex-1" />
              <div
                className={cn(
                  "px-2 !rotate-0",
                  model.connected ? "text-emerald-600" : "text-zinc-500"
                )}
              >
                {model.connected ? (
                  <CheckmarkCircle02Icon
                    size={20}
                    strokeWidth={1.5}
                    variant="solid"
                  />
                ) : (
                  <AlertCircleIcon
                    size={20}
                    strokeWidth={1.5}
                    variant="solid"
                  />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <model.settingsComponent />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Flex>
  );
};
