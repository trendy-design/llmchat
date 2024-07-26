import { usePreferenceContext, useSessions } from "@/context";
import { constructPrompt } from "@/helper/promptUtil";
import { modelService } from "@/services/models";
import { messagesService } from "@/services/sessions/client";
import { TChatMessage } from "@/types";
import { HumanMessage } from "@langchain/core/messages";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "langchain/output_parsers";
import moment from "moment";
import { z } from "zod";
import { useAssistantUtils } from ".";

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    title: z.string().describe("Give title for the conversation"),
  }),
);

export const useTitleGenerator = () => {
  const { getAssistantByKey } = useAssistantUtils();
  const { preferences, apiKeys } = usePreferenceContext();
  const { updateSessionMutation } = useSessions();

  const generateTitleForSession = async (sessionId: string) => {
    const messages = await messagesService.getMessages(sessionId);

    const firstMessage = messages?.[0];
    if (
      !firstMessage ||
      !firstMessage.rawAI ||
      !firstMessage.rawHuman ||
      messages?.length > 2
    )
      return;

    const title = preferences?.generateTitle
      ? await generateTitle(firstMessage)
      : firstMessage.rawHuman || "Untitled";

    await updateSessionMutation.mutate({
      sessionId,
      session: { title, updatedAt: moment().toISOString() },
    });
  };

  const generateTitle = async (message: TChatMessage) => {
    const assistant = getAssistantByKey(preferences.defaultAssistant);
    if (!assistant) return;

    if (!message.rawAI || !message.rawHuman) return;

    const apiKey = apiKeys[assistant.model.provider];
    const selectedModel = await modelService.createInstance({
      model: assistant.model,
      preferences,
      apiKey,
    });

    const prompt = await constructPrompt({
      hasMessages: true,
      formatInstructions: true,
      systemPrompt: "You're a helpful assistant.",
      memories: [],
    });

    try {
      const chain = RunnableSequence.from([
        prompt,
        selectedModel as any,
        parser as any,
      ]);
      const generation = await chain.invoke({
        chat_history: [new HumanMessage(message.rawHuman)],
        input:
          "Generate a concise and clear title for this chat session. Respond with only the title and no additional text. Answer in English.",
        format_instructions: parser.getFormatInstructions(),
      });

      return generation?.title || message.rawHuman || "Untitled";
    } catch (e) {
      console.error(e);
      return message.rawHuman;
    }
  };
  return { generateTitleForSession };
};
