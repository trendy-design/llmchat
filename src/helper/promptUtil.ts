import { TConstructPrompt } from "@/types/prompts";
import { HumanMessage } from "@langchain/core/messages";
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";

const constructPrompt = async (props: TConstructPrompt) => {
  const { context, image, hasMessages, memories, systemPrompt } = props;
  const messagePlaceholders = new MessagesPlaceholder("chat_history");

  const memoryPrompt = `Things to remember:\n${memories.join("\n")}`;
  const messagesPrompt = hasMessages
    ? `You can also refer to these previous conversations`
    : ``;

  const systemMessage: BaseMessagePromptTemplateLike = [
    "system",
    `${systemPrompt}\n${memoryPrompt}\n${messagesPrompt}`,
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

export { constructPrompt };
