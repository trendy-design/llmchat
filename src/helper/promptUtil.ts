import { TChatMessage } from "@/types";
import { TConstructPrompt } from "@/types/prompts";
import { AIMessage, HumanMessage } from "@langchain/core/messages";
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { sortMessages } from "./utils";

const constructPrompt = async (props: TConstructPrompt) => {
  const { context, image, hasMessages, memories, systemPrompt } = props;
  const messagePlaceholders = new MessagesPlaceholder("chat_history");

  const memoryPrompt =
    memories.length > 0 ? `Things to remember:\n${memories.join("\n")}` : "";
  const messagesPrompt = hasMessages
    ? `You can also refer to these previous conversations`
    : ``;

  const formatInstructions = props?.formatInstructions
    ? `\n{format_instructions}`
    : ``;

  const systemMessage: BaseMessagePromptTemplateLike = [
    "system",
    `${systemPrompt}\n${memoryPrompt}\n${messagesPrompt}\n${formatInstructions}`,
  ];

  const userContent = `{input}\n\n${
    context
      ? `Answer user's question based on the following context: """{context}"""`
      : ``
  }`;

  const userMessageContent = image
    ? new HumanMessage({
        content: [
          {
            type: "text",
            text: userContent,
          },
          {
            type: "image_url",
            image_url: image,
          },
        ],
      }).content
    : userContent;

  console.log("userMessageContent", userMessageContent);

  const userMessage: BaseMessagePromptTemplateLike = [
    "user",
    userMessageContent,
  ];

  return ChatPromptTemplate.fromMessages([
    systemMessage,
    messagePlaceholders,
    userMessage,
    ["placeholder", "{agent_scratchpad}"],
  ]);
};

const constructMessagePrompt = async ({
  messages,
  limit,
}: {
  messages: TChatMessage[];
  limit: number;
}) => {
  const sortedMessages = sortMessages(messages, "createdAt");

  const chatHistory = sortedMessages
    .slice(0, limit)
    .reduce((acc: (HumanMessage | AIMessage)[], { rawAI, rawHuman }) => {
      if (rawAI && rawHuman) {
        return [...acc, new HumanMessage(rawHuman), new AIMessage(rawAI)];
      } else {
        return acc;
      }
    }, []);

  return chatHistory;
};

export { constructMessagePrompt, constructPrompt };
