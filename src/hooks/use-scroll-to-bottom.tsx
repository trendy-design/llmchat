import { useEffect, useState } from "react";

export const useScrollToBottom = () => {
  const [isAtBottom, setIsAtBottom] = useState(true);

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
    showButton: !isAtBottom,
    scrollToBottom,
    isAtBottom,
  };
};
