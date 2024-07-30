import { useChatContext, useSessions } from "@/context";
import { useRelatedQuestions } from "@/hooks/use-related-questions";
import { useTitleGenerator } from "@/hooks/use-title-generator";
import { TChatMessage } from "@/types";
import { useEffect } from "react";
import { AIMessage } from "./ai/ai-message";
import { HumanMessage } from "./human-message";

export const RecentMessage = () => {
  const { store } = useChatContext();
  const currentMessage = store((state) => state.currentMessage);
  const setIsGenerating = store((state) => state.setIsGenerating);
  const addMessage = store((state) => state.addMessage);
  const setCurrentMessage = store((state) => state.setCurrentMessage);
  const { generateTitleForSession } = useTitleGenerator();
  const { generateRelatedQuestion } = useRelatedQuestions();
  const { addMessageMutation } = useSessions();

  useEffect(() => {
    if (!currentMessage) return;

    if (currentMessage.stop && currentMessage.sessionId) {
      addMessageMutation.mutate(
        {
          parentId: currentMessage.sessionId,
          message: currentMessage,
        },
        {
          onSuccess: async (messages) => {
            setIsGenerating(false);
            if (messages?.[0].sessionId && messages?.length < 2) {
              await generateTitleForSession(messages?.[0].sessionId as string);
            }
            console.log("start generating questions");
            const questions = await generateRelatedQuestion(
              currentMessage.sessionId,
              currentMessage.id,
            );
            console.log("questions", questions);

            const message = {
              ...currentMessage,
              relatedQuestions: questions,
            };
            console.log("messageee", message);
            addMessage(message);
            setCurrentMessage(undefined);
            addMessageMutation.mutate({
              parentId: currentMessage.sessionId,
              message: message,
            });
          },
        },
      );
    }
  }, [currentMessage]);

  useEffect(() => {
    if (isUserNearBottom()) {
      scrollToBottom();
    }
  }, [currentMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [!!currentMessage?.relatedQuestions?.length]);

  function isUserNearBottom() {
    const chatContainer = document.getElementById("chat-container");
    var scrollThreshold = 100;
    if (chatContainer) {
      return (
        chatContainer.scrollHeight - chatContainer.scrollTop <=
        chatContainer.clientHeight + scrollThreshold
      );
    }
  }

  const scrollToBottom = () => {
    const chatContainer = document.getElementById("chat-container");

    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  };

  const renderMessage = (message: TChatMessage) => {
    return (
      <div className="flex w-full flex-col items-end gap-1" key={message.id}>
        <HumanMessage chatMessage={message} isLast={true} />
        <AIMessage message={message} isLast={true} />
      </div>
    );
  };

  return currentMessage ? renderMessage(currentMessage) : null;
};
