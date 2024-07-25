import { usePreferenceContext, useSessions } from "@/context";
import { modelService } from "@/services/models";
import { messagesService, sessionsService } from "@/services/sessions/client";
import { HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import moment from "moment";
import { useAssistantUtils } from ".";

export const useTitleGenerator = () => {
  const { getAssistantByKey } = useAssistantUtils();
  const { preferences, apiKeys } = usePreferenceContext();
  const { updateSessionMutation } = useSessions();

  const generateTitleForSession = async (sessionId: string) => {
    const session = await sessionsService.getSessionById(sessionId);
    const messages = await messagesService.getMessages(sessionId);
    const assistant = getAssistantByKey(preferences.defaultAssistant);
    if (!assistant) {
      return;
    }

    const apiKey = apiKeys[assistant.model.provider];

    const selectedModel = await modelService.createInstance({
      model: assistant.model,
      preferences,
      apiKey,
    });

    const firstMessage = messages?.[0];

    if (
      !firstMessage ||
      !firstMessage.rawAI ||
      !firstMessage.rawHuman ||
      messages?.length > 2
    ) {
      return;
    }

    const template = ChatPromptTemplate.fromMessages([
      new MessagesPlaceholder("message"),
      [
        "user",
        "Generate a concise and clear title for this chat session. Respond with only the title and no additional text. Answer in English.",
      ],
    ]);

    try {
      const prompt = await template.formatMessages({
        message: [new HumanMessage(firstMessage.rawHuman)],
      });

      const generation = await selectedModel.invoke(prompt as any, {});

      const generatedTitle = generation?.content
        ?.toString()
        .replaceAll("Title: ", "")
        .replaceAll('"', "");

      const newTitle = generatedTitle || session?.title || "Untitled";
      await updateSessionMutation.mutate({
        sessionId,
        session: newTitle
          ? { title: newTitle, updatedAt: moment().toISOString() }
          : {},
      });
    } catch (e) {
      console.error(e);
      return firstMessage.rawHuman;
    }
  };

  return { generateTitleForSession };
};
