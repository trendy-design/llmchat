import { useChatContext, useSessions } from "@/context";
import { useScrollToBottom } from "@/hooks";
import { useRelatedQuestions } from "@/hooks/use-related-questions";
import { useTitleGenerator } from "@/hooks/use-title-generator";
import { TChatMessage } from "@/types";
import { useEffect } from "react";
import { ChatScrollAnchor } from "../chat-scroll-anchor";
import { AIMessage } from "./ai/ai-message";
import { HumanMessage } from "./human-message";

export const RecentMessage = () => {
  const { store } = useChatContext();
  const currentMessage = store((state) => state.currentMessage);
  const isGenerating = store((state) => state.isGenerating);
  const setIsGenerating = store((state) => state.setIsGenerating);
  const setCurrentMessage = store((state) => state.setCurrentMessage);
  const { generateTitleForSession } = useTitleGenerator();
  const { generateRelatedQuestion } = useRelatedQuestions();
  const { addMessageMutation } = useSessions();
  const { isAtBottom, scrollToBottom } = useScrollToBottom();

  useEffect(() => {
    if (
      !currentMessage ||
      !currentMessage.stop ||
      !currentMessage.sessionId ||
      currentMessage.relatedQuestions?.length
    )
      return;

    const processMessage = async () => {
      try {
        const messages = await addMessageMutation.mutateAsync({
          parentId: currentMessage.sessionId,
          message: currentMessage,
        });

        setIsGenerating(false);

        if (messages?.[0].sessionId && messages?.length < 2) {
          await generateTitleForSession(messages[0].sessionId as string);
        }

        const questions = await generateRelatedQuestion(
          currentMessage.sessionId,
          currentMessage.id,
        );

        if (questions?.length > 0) {
          const updatedMessage = {
            ...currentMessage,
            relatedQuestions: questions,
          };
          await addMessageMutation.mutateAsync({
            parentId: currentMessage.sessionId,
            message: updatedMessage,
          });
          setCurrentMessage(updatedMessage);
        }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    };

    processMessage();
  }, [currentMessage]);

  const renderMessage = (message: TChatMessage) => {
    return (
      <div className="flex w-full flex-col items-end gap-1" key={message.id}>
        <HumanMessage chatMessage={message} isLast={true} />
        <AIMessage message={message} isLast={true} />
      </div>
    );
  };

  useEffect(() => {
    scrollToBottom();
  }, [
    isGenerating,
    currentMessage?.relatedQuestions?.length,
    currentMessage?.tools?.length,
    currentMessage?.stop,
  ]);

  return (
    <>
      {currentMessage ? renderMessage(currentMessage) : null}
      <ChatScrollAnchor
        isAtBottom={isAtBottom}
        trackVisibility={!currentMessage?.stop}
      />
    </>
  );
};
