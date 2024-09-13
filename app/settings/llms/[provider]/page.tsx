"use client";
import { ModelIcon, ModelIconType } from "@/components/model-icon";
import { AnthropicSettings } from "@/components/settings/models/anthropic";
import { GeminiSettings } from "@/components/settings/models/gemini";
import { GroqSettings } from "@/components/settings/models/groq";
import { OllamaSettings } from "@/components/settings/models/ollama";
import { OpenAISettings } from "@/components/settings/models/openai";
import { SettingsContainer } from "@/components/settings/settings-container";
import { providers } from "@/config/models";
import { usePreferenceContext } from "@/lib/context";
import { TProvider } from "@/lib/types";
import { cn } from "@/lib/utils/clsx";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Flex,
} from "@/ui";
import { BadgeCheckIcon, CircleAlert } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LLMsSettings() {
  const { provider } = useParams();
  const { push } = useRouter();
  const { apiKeys, preferences, getApiKey } = usePreferenceContext();
  const [selectedModel, setSelectedModel] = useState<TProvider>("openai");
  const [ollamaConnected, setOllamaConnected] = useState(false);

  const checkOllamaConnection = async () => {
    try {
      const url = preferences.ollamaBaseUrl;
      await fetch(url + "/api/tags");
      setOllamaConnected(true);
    } catch (error) {
      setOllamaConnected(false);
    }
  };

  useEffect(() => {
    checkOllamaConnection();
  }, [preferences.ollamaBaseUrl]);

  useEffect(() => {
    if (providers.includes(provider as TProvider)) {
      setSelectedModel(provider as TProvider);
    } else {
      push("settings/llms/openai");
    }
  }, [provider]);

  const modelSettingsData = [
    {
      value: "openai",
      label: "OpenAI",
      iconType: "openai",
      connected: !!getApiKey("openai"),
      settingsComponent: OpenAISettings,
    },
    {
      value: "anthropic",
      label: "Anthropic",
      iconType: "anthropic",
      connected: !!getApiKey("anthropic"),

      settingsComponent: AnthropicSettings,
    },
    {
      value: "gemini",
      label: "Gemini",
      iconType: "gemini",
      connected: !!getApiKey("gemini"),

      settingsComponent: GeminiSettings,
    },
    {
      value: "ollama",
      label: "Ollama",
      iconType: "ollama",
      connected: ollamaConnected,
      settingsComponent: () => (
        <OllamaSettings
          onRefresh={() => {
            checkOllamaConnection();
          }}
        />
      ),
    },
    {
      value: "groq",
      label: "Groq",
      iconType: "groq",
      connected: !!getApiKey("groq"),
      settingsComponent: GroqSettings,
    },
  ];
  return (
    <SettingsContainer title="Providers">
      <Accordion
        type="single"
        value={selectedModel}
        collapsible
        className="w-full"
        onValueChange={(value) => {
          setSelectedModel(value as TProvider);
        }}
      >
        {modelSettingsData.map((model) => (
          <AccordionItem key={model.value} value={model.value}>
            <AccordionTrigger>
              <Flex gap="md" items="center">
                <ModelIcon type={model.iconType as ModelIconType} size="sm" />
                {model.label}
              </Flex>
              <Flex className="flex-1" />
              <div
                className={cn(
                  "!rotate-0 px-2",
                  model.connected
                    ? "text-teal-600 dark:text-teal-400"
                    : "text-zinc-500",
                )}
              >
                {model.connected ? (
                  <BadgeCheckIcon size={16} strokeWidth={2} />
                ) : (
                  <CircleAlert size={16} strokeWidth={2} />
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3 py-6">
              <model.settingsComponent />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SettingsContainer>
  );
}
