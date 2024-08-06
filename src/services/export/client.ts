import { defaultPreferences } from "@/config";
import { dataValidator } from "@/helper/validator";
import { TChatMessage } from "@/types";
import { ExportData } from "@/types/export";
import { AssistantService } from "../assistants";
import { PreferenceService } from "../preferences";
import { PromptsService } from "../prompts";
import { MessagesService, SessionsService } from "../sessions/client";

export class ExportService {
  private messagesService: MessagesService;
  private sessionsService: SessionsService;
  private preferencesService: PreferenceService;
  private assistantsService: AssistantService;
  private promptsService: PromptsService;

  constructor(
    messagesService: MessagesService,
    sessionsService: SessionsService,
    preferencesService: PreferenceService,
    assistantsService: AssistantService,
    promptsService: PromptsService,
  ) {
    this.messagesService = messagesService;
    this.sessionsService = sessionsService;
    this.preferencesService = preferencesService;
    this.assistantsService = assistantsService;
    this.promptsService = promptsService;
  }

  async processExport(): Promise<ExportData> {
    try {
      const chatSessions = await this.sessionsService.getSessions();
      const messages = await Promise.all(
        chatSessions.map(async (session) => {
          const messages = await this.messagesService.getMessages(session.id);
          if (messages.length === 0) {
            return Promise.resolve(null);
          }
          return Promise.resolve({
            key: `messages-${session.id}`,
            message: await this.messagesService.getMessages(session.id),
          });
        }),
      );

      const chatMessages = messages.filter(
        (message): message is { key: string; message: TChatMessage[] } =>
          message !== null,
      );
      const preferences = await this.preferencesService.getPreferences();
      const apiKeys = await this.preferencesService.getApiKeys();
      const assistants = await this.assistantsService.getAssistants();

      dataValidator.parseAsync({
        preferences: { ...defaultPreferences, ...preferences },
        apiKeys,
        chatMessages,
        chatSessions,
        assistants,
      });

      return {
        preferences: { ...defaultPreferences, ...preferences },
        apiKeys,
        chatMessages,
        chatSessions,
        assistants,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async processImport(data: string) {
    try {
      const parsedData = dataValidator.parse(JSON.parse(data), {
        errorMap: (issue: any, ctx: any) => {
          return { message: ctx.defaultError };
        },
      });
      const sessions = parsedData.chatSessions;
      const messages = parsedData.chatMessages;
      const preferences = parsedData.preferences;
      const apiKeys = parsedData.apiKeys;
      const assistants = parsedData.assistants;
      const prompts = parsedData.prompts;

      sessions && (await sessionsService.addSessions(sessions));
      messages &&
        (await Promise.all(
          messages.map(async (message) => {
            await messagesService.addMessages(
              message.key.split("-")[1],
              message.message,
            );
          }),
        ));
      prompts && (await this.promptsService.addPrompts(prompts));
      preferences && (await preferencesService.setPreferences(preferences));
      apiKeys && (await preferencesService.setApiKeys(apiKeys));

      assistants && (await assistantsService.addAssistants(assistants));
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

const messagesService = new MessagesService();
const sessionsService = new SessionsService(messagesService);
const preferencesService = new PreferenceService();
const assistantsService = new AssistantService();
const promptsService = new PromptsService();

export const exportService = new ExportService(
  messagesService,
  sessionsService,
  preferencesService,
  assistantsService,
  promptsService,
);
