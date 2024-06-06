import { usePreferenceContext } from "@/context/preferences/provider";
import { useSessionsContext } from "@/context/sessions/provider";
import { useSettings } from "@/context/settings/context";
import { models } from "@/hooks/use-model-list";
import { TPreferences } from "@/hooks/use-preferences";
import { generateAndDownloadJson } from "@/lib/helper";
import { ChangeEvent } from "react";
import { z } from "zod";
import { Button } from "../ui/button";
import { Flex } from "../ui/flex";
import { Input } from "../ui/input";
import { Type } from "../ui/text";
import { useToast } from "../ui/use-toast";
import { SettingCard } from "./setting-card";
import { SettingsContainer } from "./settings-container";

const apiSchema = z.object({
  openai: z.string().optional(),
  gemini: z.string().optional(),
  anthropic: z.string().optional(),
});

const preferencesSchema = z.object({
  defaultModel: z.string().refine((val) => models.includes(val)),
  systemPrompt: z.string().optional(),
  messageLimit: z.number().int().positive().optional(),
  temperature: z.number().optional(),
  defaultPlugins: z.array(z.string()).optional(),
  whisperSpeechToTextEnabled: z.boolean().optional(),
  maxTokens: z.number().int().positive().optional(),
  defaultWebSearchEngine: z
    .string()
    .refine((val) => ["google", "duckduckgo"].includes(val))
    .optional(),
  topP: z.number().optional(),
  topK: z.number().optional(),
  googleSearchEngineId: z.string().optional(),
  googleSearchApiKey: z.string().optional(),
});

const runModelPropsSchema = z.object({
  context: z.string().optional(),
  input: z.string().optional(),
  image: z.string().optional(),
  sessionId: z.string(),
  messageId: z.string().optional(),
  model: z.string().optional(),
});

const chatMessageSchema = z.object({
  id: z.string(),
  model: z.string(),
  image: z.string().optional(),
  rawHuman: z.string().optional(),
  rawAI: z.string().optional(),
  sessionId: z.string(),
  runModelProps: runModelPropsSchema,
  toolName: z.string().optional(),
  toolResult: z.string().optional(),
  isLoading: z.boolean().optional(),
  isToolRunning: z.boolean().optional(),
  hasError: z.boolean().optional(),
  errorMesssage: z.string().optional(),
  createdAt: z.string(),
});

const botSchema = z.object({
  prompt: z.string(),
  name: z.string(),
  description: z.string(),
  greetingMessage: z.string().optional(),
  id: z.string(),
  avatar: z.string().optional(),
  status: z.string().optional(),
  deafultBaseModel: z.string(),
});

const sessionSchema = z.object({
  messages: z.array(chatMessageSchema),
  bot: botSchema.optional(),
  title: z.string().optional(),
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

const importSchema = z.object({
  apiKeys: apiSchema.optional(),
  preferences: preferencesSchema.optional(),
  sessions: sessionSchema.array().optional(),
});

export const Data = () => {
  const { dismiss } = useSettings();
  const { toast } = useToast();

  const { sessions, addSessionsMutation } = useSessionsContext();
  const {
    preferences,
    apiKeys,
    updatePreferences,
    updateApiKey,
    updateApiKeys,
  } = usePreferenceContext();
  const { clearSessionsMutation, createSession } = useSessionsContext();

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const content = e.target?.result as string;
        try {
          const jsonData = JSON.parse(content);
          const parsedData = importSchema.parse(jsonData);
          parsedData?.apiKeys && updateApiKeys(parsedData?.apiKeys);
          parsedData?.preferences &&
            updatePreferences(parsedData?.preferences as TPreferences);
          !!parsedData?.sessions?.length &&
            addSessionsMutation.mutate(
              parsedData?.sessions?.filter((s) => !!s.messages.length)
            );

          toast({
            title: "Data Imported",
            description: "The JSON file you uploaded has been imported",
            variant: "default",
          });

          console.log(parsedData);
        } catch (e) {
          toast({
            title: "Invalid JSON",
            description: "The JSON file you uploaded is invalid",
            variant: "destructive",
          });
          return;
        }
      };
      reader.readAsText(file);
    }
  }

  const clearAllData = async () => {
    toast({
      title: "Clear All Data?",
      description: "This action cannot be undone.",
      variant: "destructive",
      action: (
        <Button
          size="sm"
          variant="default"
          onClick={() => {
            clearSessionsMutation.mutate(undefined, {
              onSuccess: () => {
                toast({
                  title: "Data Cleared",
                  description: "All chat data has been cleared",
                  variant: "default",
                });
                createSession({
                  redirect: true,
                });
                dismiss();
                dismiss();
              },
            });
          }}
        >
          Clear All
        </Button>
      ),
    });
  };

  return (
    <SettingsContainer title="Manage your Data">
      <Flex direction="col" gap="md" className="w-full">
        <SettingCard className="p-3">
          <Flex items="center" justify="between">
            <Type textColor="secondary">Clear all chat sessions</Type>
            <Button variant="destructive" size="sm" onClick={clearAllData}>
              Clear all
            </Button>
          </Flex>
          <div className="my-3 h-[1px] bg-zinc-500/10 w-full" />
          <Flex items="center" justify="between">
            <Type textColor="secondary">
              Delete all data and reset all settings
            </Type>
            <Button variant="destructive" size="sm" onClick={clearAllData}>
              Reset
            </Button>
          </Flex>
        </SettingCard>

        <SettingCard className="p-3">
          <Flex items="center" justify="between">
            <Type textColor="secondary">Import Data</Type>
            <Input
              type="file"
              onChange={handleFileSelect}
              hidden
              className="invisible"
              id="import-config"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                document?.getElementById("import-config")?.click();
              }}
            >
              Import
            </Button>
          </Flex>
          <div className="my-3 h-[1px] bg-zinc-500/10 w-full" />

          <Flex items="center" justify="between">
            <Type textColor="secondary">Export Data</Type>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                generateAndDownloadJson(
                  {
                    sessions: sessions,
                    preferences: preferences,
                    apiKeys: apiKeys,
                  },
                  "chats.so.json"
                );
              }}
            >
              Export
            </Button>
          </Flex>
        </SettingCard>
      </Flex>
    </SettingsContainer>
  );
};
