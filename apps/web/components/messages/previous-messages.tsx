import { TChatMessage } from '@repo/shared/types';
import { Message } from './message';

export const PreviousMessages = () => {
  // const messages = store((state) => state.messages) || [];
  // const isStopped = store((state) => state.currentMessage?.stop);
  // const hasCurrentMessage = store((state) => !!state.currentMessage);

  const renderMessage = (message: TChatMessage, index: number) => {
    // const isLast = !hasCurrentMessage && messages.length - 1 === index;
    return <Message message={message} isLast={false} key={message.id} />;
  };

  // useEffect(() => {
  //   if (messages?.length) {
  //     scrollToBottom();
  //   }
  // }, [messages.length]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  // const  previousMessages = useMemo(() => {
  //     return messages.map(renderMessage);
  //   }, [messages, isStopped]);

  // return previousMessages;
  return null;
};
