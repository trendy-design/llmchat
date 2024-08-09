import { useEffect, useState } from "react";

export const useScrollToBottom = () => {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [needsScroll, setNeedsScroll] = useState(false);

  const scrollToBottom = () => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTop =
        chatContainer.scrollHeight - chatContainer.clientHeight + 100;
      setIsAtBottom(true);
    }
  };

  const handleScroll = () => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      const isAtBottom =
        chatContainer.scrollHeight - chatContainer.clientHeight <=
        chatContainer.scrollTop + 1;

      setIsAtBottom(isAtBottom);
      const scrollThreshold = 100;
      setNeedsScroll(
        chatContainer.scrollHeight >
          chatContainer.clientHeight + scrollThreshold,
      );
    }
  };

  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  return {
    showScrollToBottom: !isAtBottom && needsScroll,
    scrollToBottom,
    isAtBottom,
  };
};
