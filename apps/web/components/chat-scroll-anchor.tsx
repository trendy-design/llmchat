import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

export type TChatScrollAnchorProps = {
  isAtBottom: boolean;
  trackVisibility: boolean;
  hasMessages: boolean;
};
export const ChatScrollAnchor = ({
  isAtBottom,
  trackVisibility,
  hasMessages,
}: TChatScrollAnchorProps) => {
  const { ref, inView, entry } = useInView({
    trackVisibility,
    threshold: 1,
    delay: 100,
  });
  useEffect(() => {
    if (isAtBottom && trackVisibility && !inView && hasMessages) {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight - chatContainer.clientHeight;
      }
    }
  }, [inView, entry, isAtBottom, trackVisibility, hasMessages]);
  return <div ref={ref} className="mt-8 h-px w-full" />;
};
