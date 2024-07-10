import { useEffect, useState } from "react";

export const useScrollToBottom = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const chatContainer = document?.getElementById("chat-container");

    const handleScroll = () => {
      if (!chatContainer) {
        return;
      }
      if (chatContainer?.scrollTop <= chatContainer?.scrollHeight - 1200) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    };

    if (chatContainer) {
      chatContainer.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (chatContainer) {
        chatContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const scrollToBottom = () => {
    const chatContainer = document?.getElementById("chat-container");

    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  return {
    showButton,
    scrollToBottom,
  };
};
