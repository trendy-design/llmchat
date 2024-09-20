import { useChatContext, usePreferenceContext } from "@/lib/context";
import {
  useAssistantUtils,
  useChatEditor,
  useImageAttachment,
  useLLMRunner,
} from "@/lib/hooks";
import { slideUpVariant } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/clsx";
import { Badge, Flex, Type } from "@/ui";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChangeLogs } from "../changelogs";
import { FullPageLoader } from "../full-page-loader";
import { ApiKeyInfo } from "./api-key-info";
import { ChatActions } from "./chat-actions";
import { ChatEditor } from "./chat-editor";
import { ChatExamples } from "./chat-examples";
import { ChatFooter } from "./chat-footer";
import { ImageAttachment } from "./image-attachment";
import { ImageDropzoneRoot } from "./image-dropzone-root";
import { ScrollToBottomButton } from "./scroll-to-bottom-button";
import { SelectedContext } from "./selected-context";

export const ChatInput = () => {
  const { store, isReady } = useChatContext();
  const [openChangelog, setOpenChangelog] = useState(false);
  const { preferences, isPreferencesReady } = usePreferenceContext();
  const { getAssistantByKey, getAssistantIcon } = useAssistantUtils();
  const { invokeModel } = useLLMRunner();
  const { editor } = useChatEditor();
  const session = store((state) => state.session);
  const messages = store((state) => state.messages);
  const currentMessage = store((state) => state.currentMessage);
  const isGenerating = store((state) => state.isGenerating);
  const context = store((state) => state.context);
  const { attachment, clearAttachment, handleImageUpload, dropzonProps } =
    useImageAttachment();

  const isFreshSession =
    messages.length === 0 && !currentMessage?.id && !isGenerating && session;

  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (session?.id) {
      inputRef.current?.focus();
    }
  }, [session?.id]);

  const sendMessage = (input: string) => {
    if (!isReady) return;
    const props = getAssistantByKey(preferences.defaultAssistant);
    if (!props || !session) return;

    invokeModel({
      input,
      context,
      image: attachment?.base64,
      sessionId: session.id,
      assistant: props.assistant,
    });
    clearAttachment();
  };

  const chatInputBackgroundContainer = cn(
    "absolute bottom-0 right-0 left-0 flex w-full flex-col items-center justify-end gap-2 px-4 pb-3  md:px-4",
    "transition-all duration-1000 ease-in-out",
    isFreshSession && "top-0 justify-center  ",
  );

  const chatContainer = cn(
    "flex flex-col items-center flex-1 w-full gap-1 md:w-[640px] lg:w-[700px] z-10",
  );

  const renderChatBottom = () => {
    return (
      <>
        {isFreshSession && <ChatExamples />}

        <Flex items="center" justify="center" gap="sm" className="mb-2">
          <ScrollToBottomButton />
        </Flex>

        <SelectedContext />

        <Flex
          direction="col"
          className="w-full rounded-xl border border-zinc-500/10 bg-white shadow-sm dark:bg-zinc-700/95"
        >
          <motion.div
            variants={slideUpVariant}
            initial="initial"
            animate={editor?.isEditable ? "animate" : "initial"}
            className="flex w-full flex-shrink-0 overflow-hidden rounded-xl"
          >
            <ImageDropzoneRoot dropzoneProps={dropzonProps}>
              <Flex direction="col" className="w-full">
                <ImageAttachment
                  attachment={attachment}
                  clearAttachment={clearAttachment}
                />
                <Flex className="flex w-full flex-row items-end gap-0 py-2 pl-2 pr-2 md:pl-3">
                  <ChatEditor sendMessage={sendMessage} editor={editor} />
                </Flex>
                <ChatActions
                  sendMessage={sendMessage}
                  handleImageUpload={handleImageUpload}
                />
              </Flex>
            </ImageDropzoneRoot>
          </motion.div>
        </Flex>
        {<ChatFooter />}
      </>
    );
  };

  if (!isReady || !isPreferencesReady) {
    return (
      <div className={chatInputBackgroundContainer}>
        <FullPageLoader label="Initializing chat" />
      </div>
    );
  }

  return (
    <div className={chatInputBackgroundContainer}>
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[120px] bg-gradient-to-t from-zinc-25 from-40% to-transparent dark:bg-zinc-800/50 dark:from-zinc-800",
          isFreshSession &&
            "top-0 flex h-full flex-col items-center justify-center",
        )}
      />

      <div className={chatContainer}>
        {isFreshSession && (
          <Flex
            items="center"
            justify="center"
            direction="col"
            gap="md"
            className="mb-2 flex-1"
          >
            <Badge
              onClick={() => setOpenChangelog(true)}
              className="cursor-pointer gap-1"
              variant="tertiary"
            >
              <Flame size={14} /> What&apos;s new
            </Badge>

            <ChangeLogs open={openChangelog} setOpen={setOpenChangelog} />

            {getAssistantIcon(preferences.defaultAssistant, "lg", true)}
            <Type size="lg" textColor="secondary">
              How can I help you?
            </Type>
            <ApiKeyInfo />
          </Flex>
        )}
        {renderChatBottom()}
      </div>
    </div>
  );
};
