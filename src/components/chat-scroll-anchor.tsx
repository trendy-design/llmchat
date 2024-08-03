import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export type TChatScrollAnchorProps = {
  isAtBottom: boolean;
  trackVisibility: boolean;
};
export const ChatScrollAnchor = ({
  isAtBottom,
  trackVisibility,
}: TChatScrollAnchorProps) => {
  const { ref, inView, entry } = useInView({
    trackVisibility,
    threshold: 1,
    delay: 100,
  });
  useEffect(() => {
    if (isAtBottom && trackVisibility && !inView) {
      const chatContainer = document.getElementById("chat-container");
      if (chatContainer) {
        console.log("scroll to bottom");
        chatContainer.scrollTop =
          chatContainer.scrollHeight - chatContainer.clientHeight;
      }
    }
  }, [inView, entry, isAtBottom, trackVisibility]);
  return <div ref={ref} className="h-px w-full" />;
};
