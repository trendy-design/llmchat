import { messagesService } from '@/lib/services/sessions/client';
import { StructuredOutputParser } from 'langchain/output_parsers';
import { z } from 'zod';

const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    title: z.string().describe('Give title for the conversation'),
  })
);

export const useTitleGenerator = () => {
  const generateTitleForSession = async (sessionId: string) => {
    const messages = await messagesService.getMessages(sessionId);

    const firstMessage = messages?.[0];
    if (!firstMessage || !firstMessage.rawAI || !firstMessage.rawHuman || messages?.length > 2)
      return;

    // const title = preferences?.generateTitle
    //   ? await generateTitle(firstMessage)
    //   : firstMessage.rawHuman || "Untitled";

    // await updateSessionMutation.mutate({
    //   sessionId,
    //   session: { title, updatedAt: moment().toDate() },
    // });
  };

  //   const generateTitle = async (message: TChatMessage) => {
  //     const assistant = getAssistantByKey(message.runConfig.assistant.key);
  //     if (!assistant) return;

  //     if (!message.rawAI || !message.rawHuman) return;

  //     if (assistant.model.plugins?.length > 0) {
  //     }

  //     const apiKey = getApiKey(assistant.model.provider);
  //     const selectedModel = await modelService.createInstance({
  //       model: assistant.model,
  //       preferences,
  //       provider: assistant.model.provider,
  //       apiKey,
  //     });

  //     const prompt = await constructPrompt({
  //       hasMessages: true,
  //       formatInstructions: true,
  //       systemPrompt: "You're a helpful assistant.",
  //       memories: [],
  //     });

  //     try {
  //       const chain = RunnableSequence.from([
  //         prompt,
  //         // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  // selectedModel  as any,
  //         // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  // parser  as any,
  //       ]);
  //       const generation = await chain.invoke({
  //         chat_history: [new HumanMessage(message.rawHuman)],
  //         input:
  //           "Generate a concise and clear title for this chat session. Respond with only the title and no additional text. Answer in English.",
  //         format_instructions: parser.getFormatInstructions(),
  //       });

  //       return generation?.title || message.rawHuman || "Untitled";
  //     } catch (e) {
  //       console.error(e);
  //       return message.rawHuman;
  //     }
  //   };
  return { generateTitleForSession };
};
