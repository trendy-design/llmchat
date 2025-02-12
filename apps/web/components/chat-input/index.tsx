import {
  useChatContext,
  usePreferenceContext
} from "@/lib/context";
import {
  useAssistantUtils,
  useChatEditor,
  useImageAttachment,
  useLLMRunner,
} from "@/lib/hooks";
import { cn, slideUpVariant } from "@repo/shared/utils";
import { Flex } from "@repo/ui";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChangeLogs } from "../changelogs";
import { FullPageLoader } from "../full-page-loader";
import { ChatActions } from "./chat-actions";
import { ChatEditor } from "./chat-editor";
import { ChatFooter } from "./chat-footer";
import { ImageAttachment } from "./image-attachment";
import { ImageDropzoneRoot } from "./image-dropzone-root";
import { ScrollToBottomButton } from "./scroll-to-bottom-button";
import { SelectedContext } from "./selected-context";

export const ChatInput = () => {
  // Context and store hooks
  const { store, isReady, refetch } = useChatContext();
  const { preferences, isPreferencesReady } = usePreferenceContext();
  
  // Store values
  const session = store((state) => state.session);
  const isInitialized = store((state) => state.isInitialized);
  const setIsInitialized = store((state) => state.setIsInitialized);
  const context = store((state) => state.context);
  
  // Custom hooks
  const { getAssistantByKey } = useAssistantUtils();
  const { invokeModel } = useLLMRunner();
  const { editor } = useChatEditor();
  const { attachment, clearAttachment, handleImageUpload, dropzonProps } = useImageAttachment();

  // Local state
  const [openChangelog, setOpenChangelog] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isFreshSession = !isInitialized;

  // Effects
  useEffect(() => {
    if (session?.id) {
      inputRef.current?.focus();
    }
  }, [session?.id]);

  // Handlers
  const sendMessage = (input: string) => {
    if (!isReady) return;
    const props = getAssistantByKey(preferences.defaultAssistant);
    if (!props || !session) return;
    
    setIsInitialized(true);
    invokeModel({
      input,
      context,
      image: attachment?.base64,
      sessionId: session.id,
      assistant: props.assistant,
    });
    clearAttachment();
  };

  // Styling
  const chatInputBackgroundContainer = cn(
    "absolute bottom-0 right-0 left-0 flex w-full flex-col items-center justify-end gap-2 px-4 pb-1 md:px-4",
    "transition-all duration-1000 ease-in-out",
    isFreshSession && "top-0 justify-center"
  );

  const chatContainer = cn(
    "flex flex-col items-center flex-1 w-full gap-1 md:max-w-2xl lg:max-w-2xl z-10"
  );

  // Component render functions
  const renderChatInput = () => (
    <div className="w-full rounded-xl bg-[#F9F9F9] p-0.5">
      <div className="w-full p-2.5 text-xs">
        <p className="text-secondary-foreground">
          You have 10 free messages left today.{" "}
          <a href="/pricing" className="text-teal-600 underline decoration-zinc-500/20 underline-offset-2">
            Sign up
          </a>{" "}
          to continue.
        </p>
      </div>
      <Flex direction="col" className="w-full rounded-xl border bg-white shadow-sm dark:bg-zinc-700">
        <motion.div
          variants={slideUpVariant}
          initial="initial"
          animate={editor?.isEditable ? "animate" : "initial"}
          className="flex w-full flex-shrink-0 overflow-hidden rounded-xl"
        >
          <ImageDropzoneRoot dropzoneProps={dropzonProps}>
            <Flex direction="col" className="w-full">
              <ImageAttachment attachment={attachment} clearAttachment={clearAttachment} />
              <Flex className="flex w-full flex-row items-end gap-0 p-3 md:pl-3">
                <ChatEditor sendMessage={sendMessage} editor={editor} />
              </Flex>
              <ChatActions sendMessage={sendMessage} handleImageUpload={handleImageUpload} />
            </Flex>
          </ImageDropzoneRoot>
        </motion.div>
      </Flex>
    </div>
  );

  const renderChatBottom = () => (
    <>
      <Flex items="center" justify="center" gap="sm" className="mb-2">
        <ScrollToBottomButton />
      </Flex>
      <SelectedContext />
      {renderChatInput()}
    </>
  );

  // Loading state
  if (!isReady || !isPreferencesReady) {
    return (
      <div className={chatInputBackgroundContainer}>
        <FullPageLoader label="Initializing chat" />
      </div>
    );
  }

  // Main render
  return (
    <div className={chatInputBackgroundContainer}>
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 h-[120px] bg-gradient-to-t from-40% to-transparent dark:bg-zinc-800/50 dark:from-zinc-800",
          isFreshSession && "top-0 flex h-full flex-col items-center justify-center"
        )}
      />

      <div className={chatContainer}>
        {isFreshSession ? (
          <Flex
            items="center"
            justify="center"
            direction="col"
            gap="sm"
            className="mb-2 h-full w-full"
          >
            <h1 className="text-3xl font-semibold tracking-tighter text-zinc-900">
              How can I help you today?
            </h1>
            <ChangeLogs open={openChangelog} setOpen={setOpenChangelog} />
            {renderChatBottom()}
            <ChatFooter />
          </Flex>
        ) : (
          renderChatBottom()
        )}
      </div>
    </div>
  );
};
