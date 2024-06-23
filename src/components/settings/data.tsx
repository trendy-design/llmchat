import { useSettingsContext } from "@/context";
import { usePreferenceContext } from "@/context/preferences";
import { useSessionsContext } from "@/context/sessions";
import { TChatSession } from "@/hooks/use-chat-session";
import { TPreferences, defaultPreferences } from "@/hooks/use-preferences";
import { generateAndDownloadJson, sortMessages } from "@/lib/helper";
import { ChangeEvent } from "react";
import { z } from "zod";
import { Button } from "../ui/button";
import { Flex } from "../ui/flex";
import { Input } from "../ui/input";
import { Type } from "../ui/text";
import { PopOverConfirmProvider } from "../ui/use-confirm-popover";
import { useToast } from "../ui/use-toast";
import { SettingCard } from "./setting-card";
import { SettingsContainer } from "./settings-container";

const apiSchema = z.object({
  openai: z.string().optional(),
  gemini: z.string().optional(),
  anthropic: z.string().optional(),
});

const preferencesSchema = z.object({
  defaultAssistant: z.string(),
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
  ollamaBaseUrl: z.string().optional(),
});

const runModelPropsSchema = z.object({
  context: z.string().optional(),
  input: z.string().optional(),
  image: z.string().optional(),
  sessionId: z.string(),
  messageId: z.string().optional(),
  assistant: z.object({
    key: z.string(),
    name: z.string(),
    baseModel: z.string(),
    systemPrompt: z.string(),
    type: z.string().refine((val) => ["custom", "base"].includes(val)),
  }),
});

const chatMessageSchema = z.object({
  id: z.string(),
  image: z.string().optional(),
  rawHuman: z.string().optional(),
  rawAI: z.string().optional(),
  sessionId: z.string(),
  inputProps: runModelPropsSchema,
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
  deafultBaseModel: z.string().default("gpt-3.5-turbo"),
});

const sessionSchema = z.object({
  messages: z.array(chatMessageSchema),
  title: z.string().optional(),
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

const promptSchema = z.object({});

const importSchema = z.object({
  apiKeys: apiSchema.optional(),
  preferences: preferencesSchema.optional(),
  sessions: sessionSchema.array().optional(),
  prompts: z.array(z.string()).optional(),
});

const mergeSessions = (
  incomingSessions: TChatSession[],
  existingSessions: TChatSession[]
) => {
  const updatedSessions = [...existingSessions];

  incomingSessions.forEach((incomingSession) => {
    const sessionIndex = existingSessions.findIndex(
      (s) => s.id === incomingSession.id
    );

    if (sessionIndex > -1) {
      // Merge messages from the same session
      const currentSession = updatedSessions[sessionIndex];
      const uniqueNewMessages = incomingSession.messages.filter(
        (im) => !currentSession.messages.some((cm) => cm.id === im.id)
      );

      // Combine and sort messages
      currentSession.messages = sortMessages(
        [...currentSession.messages, ...uniqueNewMessages],
        "createdAt"
      );
    } else {
      // If session does not exist, add it directly
      updatedSessions.push(incomingSession);
    }
  });

  return updatedSessions;
};

export const Data = () => {
  const { dismiss } = useSettingsContext();
  const { toast } = useToast();

  const {
    sessions,
    addSessionsMutation,
    clearSessionsMutation,
    createSession,
  } = useSessionsContext();

  const {
    preferences,
    apiKeys,
    updatePreferences,
    updateApiKey,
    updateApiKeys,
  } = usePreferenceContext();

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = async function (e) {
        const content = e.target?.result as string;

        console.log(content);
        try {
          const jsonData = JSON.parse(content);
          console.log(jsonData);
          const parsedData = importSchema.parse(jsonData, {
            errorMap: (issue: any, ctx: any) => {
              console.log(issue, ctx);
              return { message: ctx.defaultError };
            },
          });
          parsedData?.apiKeys && updateApiKeys(parsedData?.apiKeys);
          parsedData?.preferences &&
            updatePreferences(parsedData?.preferences as TPreferences);

          const incomingSessions = parsedData?.sessions?.filter(
            (s) => !!s.messages.length
          );

          const mergedSessions = mergeSessions(
            (incomingSessions as any) || [],
            sessions
          );
          clearSessionsMutation.mutate(undefined, {
            onSuccess: () => {
              addSessionsMutation.mutate(mergedSessions);
            },
          });

          toast({
            title: "Data Imported",
            description: "The JSON file you uploaded has been imported",
            variant: "default",
          });

          console.log(parsedData);
        } catch (e) {
          console.error(e);
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

  // const clearAllData = async () => {
  //   toast({
  //     title: "Clear All Data?",
  //     description: "This action cannot be undone.",
  //     variant: "destructive",
  //     action: (
  //       <Button
  //         size="sm"
  //         variant="default"
  //         onClick={() => {
  //           clearSessionsMutation.mutate(undefined, {
  //             onSuccess: () => {
  //               toast({
  //                 title: "Data Cleared",
  //                 description: "All chat data has been cleared",
  //                 variant: "default",
  //               });
  //               createSession({
  //                 redirect: true,
  //               });
  //               dismiss();
  //               dismiss();
  //             },
  //           });
  //         }}
  //       >
  //         Clear All
  //       </Button>
  //     ),
  //   });
  // };

  // const clearAllData = async () => {
  //   toast({
  //     title: "Clear All Data?",
  //     description: "This action cannot be undone.",
  //     variant: "destructive",
  //     action: (
  //       <Button
  //         size="sm"
  //         variant="default"
  //         onClick={() => {
  //           clearSessionsMutation.mutate(undefined, {
  //             onSuccess: () => {
  //               toast({
  //                 title: "Data Cleared",
  //                 description: "All chat data has been cleared",
  //                 variant: "default",
  //               });
  //               createSession({
  //                 redirect: true,
  //               });
  //               dismiss();
  //               dismiss();
  //             },
  //           });
  //         }}
  //       >
  //         Clear All
  //       </Button>
  //     ),
  //   });
  // };

  return (
    <SettingsContainer title="Manage your Data">
      <Flex direction="col" gap="md" className="w-full">
        <SettingCard className="p-3">
          <Flex items="center" justify="between">
            <Type textColor="secondary">Clear all chat sessions</Type>
            <PopOverConfirmProvider
              title="Are you sure you want to clear all chat sessions? This action cannot be undone."
              confimBtnText="Clear All"
              onConfirm={() => {
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
                  },
                });
              }}
            >
              <Button variant="destructive" size="sm">
                Clear All
              </Button>
            </PopOverConfirmProvider>
          </Flex>
          <div className="my-3 h-[1px] bg-zinc-500/10 w-full" />
          <Flex items="center" justify="between">
            <Type textColor="secondary" className="w-full">
              Clear all chat sessions and preferences
            </Type>
            <PopOverConfirmProvider
              title="Are you sure you want to reset all chat sessions and preferences? This action cannot be undone."
              confimBtnText="Reset All"
              onConfirm={() => {
                clearSessionsMutation.mutate(undefined, {
                  onSuccess: () => {
                    updatePreferences(defaultPreferences);
                    toast({
                      title: "Reset successful",
                      description: "All chat data has been reseted",
                      variant: "default",
                    });
                    createSession({
                      redirect: true,
                    });
                    dismiss();
                  },
                });
              }}
            >
              <Button variant="destructive" size="sm">
                Reset All
              </Button>
            </PopOverConfirmProvider>
          </Flex>
        </SettingCard>

        <SettingCard className="p-3">
          <Flex items="center" justify="between">
            <Type textColor="secondary" className="w-full">
              Import Data
            </Type>
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

          <Flex items="center" justify="between" className="w-full">
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
