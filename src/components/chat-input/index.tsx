import { useChatContext, usePreferenceContext } from "@/context";
import { slideUpVariant } from "@/helper/animations";
import { cn } from "@/helper/clsx";
import { useAssistantUtils, useImageAttachment } from "@/hooks";
import { useChatEditor } from "@/hooks/use-editor";
import { useLLMRunner } from "@/hooks/use-llm-runner";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Flex } from "../ui";
import { AudioRecorder } from "./audio-recorder";
import { ChatActions } from "./chat-actions";
import { ChatEditor } from "./chat-editor";
import { ChatExamples } from "./chat-examples";
import { ImageAttachment } from "./image-attachment";
import { ImageDropzoneRoot } from "./image-dropzone-root";
import { ScrollToBottomButton } from "./scroll-to-bottom-button";
import { SelectedContext } from "./selected-context";
import { StopGenerationButton } from "./stop-generation-button";
import { WelcomeMessage } from "./welcome-message";

export const ChatInput = () => {
  const { store } = useChatContext();
  const { preferences } = usePreferenceContext();
  const { getAssistantByKey } = useAssistantUtils();
  const { invokeModel } = useLLMRunner();
  const { editor } = useChatEditor();

  const session = store((state) => state.session);
  const messages = store((state) => state.messages);
  const currentMessage = store((state) => state.currentMessage);

  const { attachment, clearAttachment, handleImageUpload, dropzonProps } =
    useImageAttachment();

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (session?.id) {
      inputRef.current?.focus();
    }
  }, [session?.id]);

  const isFreshSession = !messages?.length && !currentMessage;

  const sendMessage = (input: string) => {
    const props = getAssistantByKey(preferences.defaultAssistant);
    if (!props || !session) return;

    invokeModel({
      input,
      image: attachment?.base64,
      sessionId: session.id,
      assistant: props.assistant,
    });
    clearAttachment();
  };

  const chatInputBackgroundContainer = cn(
    "absolute bottom-0 right-0 left-0 flex w-full flex-col items-center justify-end gap-2 px-4 pb-4 pt-16 md:justify-end md:px-4",
    "bg-gradient-to-t from-white from-70% to-transparent transition-all duration-1000 ease-in-out dark:from-zinc-800",
    isFreshSession && "top-0",
  );

  const chatContainer = cn(
    "flex w-full flex-col items-center relative justify-center gap-1 md:w-[700px] lg:w-[720px]",
    isFreshSession && "h-screen",
  );

  return (
    <div className={chatInputBackgroundContainer}>
      <div className={chatContainer}>
        <WelcomeMessage show={isFreshSession} />
        <Flex items="center" justify="center" gap="sm" className="mb-2">
          <ScrollToBottomButton />
          <StopGenerationButton />
        </Flex>
        <SelectedContext />
        <motion.div
          variants={slideUpVariant}
          initial="initial"
          animate={editor?.isEditable ? "animate" : "initial"}
          className="flex w-full overflow-hidden rounded-lg border bg-zinc-50 dark:border-white/5 dark:bg-white/5"
        >
          <ImageDropzoneRoot dropzoneProps={dropzonProps}>
            <Flex direction="col" className="w-full">
              <ImageAttachment
                attachment={attachment}
                clearAttachment={clearAttachment}
              />
              <Flex className="flex w-full flex-row items-end gap-0 py-2 pl-2 pr-2 md:pl-3">
                <ChatEditor sendMessage={sendMessage} />
                <AudioRecorder sendMessage={sendMessage} />
              </Flex>
            </Flex>
            <ChatActions
              sendMessage={sendMessage}
              handleImageUpload={handleImageUpload}
            />
          </ImageDropzoneRoot>
        </motion.div>
        {isFreshSession && <ChatExamples />}
      </div>
    </div>
  );
};
