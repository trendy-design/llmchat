import { configs } from "@/config";
import { usePreferenceContext } from "@/context";
import { constructMessagePrompt, constructPrompt } from "@/helper/promptUtil";
import { modelService } from "@/services/models";
import { messagesService } from "@/services/sessions/client";
import { RunnableSequence } from "@langchain/core/runnables";
import { StructuredOutputParser } from "langchain/output_parsers";
import { z } from "zod";
import { useAssistantUtils } from ".";

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    questions: z.array(z.string()).describe("list of 2 questions"),
  }),
);

export const useRelatedQuestions = () => {
  const { getAssistantByKey } = useAssistantUtils();
  const { preferences, apiKeys } = usePreferenceContext();

  const generateRelatedQuestion = async (
    sessionId: string,
    messageId: string,
  ) => {
    if (!preferences?.suggestRelatedQuestions) {
      return [];
    }
    const messages = await messagesService.getMessages(sessionId);
    const message = messages.find((m) => m.id === messageId);

    if (!message?.rawHuman || !message?.rawAI) {
      return [];
    }

    const assistant = getAssistantByKey(preferences.defaultAssistant);

    if (!assistant || !apiKeys[assistant.model.provider]) {
      return [];
    }

    const apiKey = apiKeys[assistant.model.provider];
    const selectedModel = await modelService.createInstance({
      model: assistant.model,
      preferences,
      apiKey,
    });

    const prompt = await constructPrompt({
      hasMessages: false,
      formatInstructions: true,
      systemPrompt: configs.relatedQuestionsSystemPrompt,
      memories: [],
    });

    const chatHistory = await constructMessagePrompt({
      messages,
      limit: 1,
    });

    try {
      const chain = RunnableSequence.from([
        prompt,
        selectedModel as any,
        parser as any,
      ]);
      const generation = await chain.invoke({
        chat_history: [],
        input: configs.relatedQuestionsUserPrompt(
          message.rawHuman,
          message.rawAI,
        ),
        format_instructions: parser.getFormatInstructions(),
      });

      return generation?.questions || [];
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  return { generateRelatedQuestion };
};
