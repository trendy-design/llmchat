import { ModelIcon, ModelIconType } from "@/components/model-icon";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Flex } from "@/components/ui/flex";
import { usePreferenceContext } from "@/context";
import { cn } from "@/lib/utils";
import { AlertCircleIcon, CheckmarkCircle02Icon } from "@hugeicons/react";
import { AnthropicSettings } from "./anthropic";
import { GeminiSettings } from "./gemini";
import { OllamaSettings } from "./ollama";
import { OpenAISettings } from "./openai";

export const ModelSettings = () => {
  const { apiKeys } = usePreferenceContext();
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
    <Flex direction="col" gap="lg" className="p-2">
      <Accordion type="single" collapsible className="w-full">
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
