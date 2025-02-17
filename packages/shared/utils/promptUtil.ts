import { AIMessage, HumanMessage } from '@langchain/core/messages';
import {
  BaseMessagePromptTemplateLike,
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts';
import { TChatMessage, TConstructPrompt } from '@repo/shared/types';
import { sortMessages } from './utils';

const constructPrompt = async (props: TConstructPrompt) => {
  const { context, image, hasMessages, memories, systemPrompt } = props;
  const messagePlaceholders = new MessagesPlaceholder('chat_history');

  const memoryPrompt = memories?.length > 0 ? `Things to remember:\n${memories.join('\n')}` : '';
  const messagesPrompt = hasMessages ? 'You can also refer to these previous conversations' : '';

  const formatInstructions = props.formatInstructions ? '\n{format_instructions}' : '';

  const systemMessage: BaseMessagePromptTemplateLike = [
    'system',
    `${systemPrompt}\n${memoryPrompt}\n${messagesPrompt}\n${formatInstructions}`,
  ];

  const userContent = `{input}\n\n${
    context ? `Answer user's question based on the following context: """{context}"""` : ''
  }`;

  const userMessageContent = image
    ? [
        {
          type: 'text',
          text: userContent,
        },
        {
          type: 'image_url',
          image_url: image,
        },
      ]
    : userContent;

  const userMessage: BaseMessagePromptTemplateLike = ['user', userMessageContent];

  return ChatPromptTemplate.fromMessages([
    systemMessage,
    messagePlaceholders,
    userMessage,
    ['placeholder', '{agent_scratchpad}'],
  ]);
};

const constructMessagePrompt = async ({
  messages,
  limit,
}: {
  messages: TChatMessage[];
  limit: number;
}) => {
  const sortedMessages = sortMessages(messages, 'createdAt');
  const chatHistory = sortedMessages
    .slice(-limit)
    .reduce((acc: (HumanMessage | AIMessage)[], { rawAI, rawHuman, image }) => {
      if (rawHuman) {
        acc.push(
          new HumanMessage({
            content: image
              ? [
                  {
                    type: 'text',
                    text: rawHuman,
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: image,
                    },
                  },
                ]
              : rawHuman,
          })
        );
      }
      if (rawAI) {
        acc.push(new AIMessage(rawAI));
      }
      return acc;
    }, []);

  return chatHistory;
};

export { constructMessagePrompt, constructPrompt };
