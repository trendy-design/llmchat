import { examplePrompts } from "@/config/example-prompts";
import {
  useChatContext,
  usePreferenceContext,
  useSessions,
} from "@/lib/context";
import {
  useAssistantUtils,
  useChatEditor,
  useImageAttachment,
  useLLMRunner,
} from "@/lib/hooks";
import { slideUpVariant } from "@/lib/utils/animations";
import { cn } from "@/lib/utils/clsx";
import { Badge, Button, Flex, Type } from "@/ui";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChangeLogs } from "../changelogs";
import { CustomAssistantAvatar } from "../custom-assistant-avatar";
import { FullPageLoader } from "../full-page-loader";
import { ApiKeyStatus } from "./api-key-status";
import { ChatActions } from "./chat-actions";
import { ChatEditor } from "./chat-editor";
import { ChatFooter } from "./chat-footer";
import { ImageAttachment } from "./image-attachment";
import { ImageDropzoneRoot } from "./image-dropzone-root";
import { ScrollToBottomButton } from "./scroll-to-bottom-button";
import { SelectedContext } from "./selected-context";
import { StarterMessages } from "./starter-messages";

export const ChatInput = () => {
  const { store, isReady, refetch } = useChatContext();
  const { removeAssistantFromSessionMutation } = useSessions();
  const [openChangelog, setOpenChangelog] = useState(false);
  const { preferences, isPreferencesReady } = usePreferenceContext();
  const { getAssistantByKey, getAssistantIcon } = useAssistantUtils();
  const { invokeModel } = useLLMRunner();
  const { editor } = useChatEditor();
  const session = store((state) => state.session);
  const isInitialized = store((state) => state.isInitialized);
  const setIsInitialized = store((state) => state.setIsInitialized);
  const context = store((state) => state.context);
  const { attachment, clearAttachment, handleImageUpload, dropzonProps } =
    useImageAttachment();

  const isFreshSession = !isInitialized;

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

  const chatInputBackgroundContainer = cn(
    "absolute bottom-0 right-0 left-0 flex w-full flex-col items-center justify-end gap-2 px-4 pb-1  md:px-4",
    "transition-all duration-1000 ease-in-out",
    isFreshSession && "top-0 justify-center  ",
  );

  const chatContainer = cn(
    "flex flex-col items-center flex-1 w-full gap-1 md:w-[640px] lg:w-[700px] z-10",
  );

  const renderChatBottom = () => {
    return (
      <>
        {isFreshSession && (
          <StarterMessages
            messages={
              session?.customAssistant?.startMessage?.map((m) => ({
                name: m,
                content: m,
              })) || examplePrompts
            }
          />
        )}

        <Flex items="center" justify="center" gap="sm" className="mb-2">
          <ScrollToBottomButton />
        </Flex>

        <SelectedContext />

        <Flex
          direction="col"
          className="w-full rounded-lg border border-zinc-500/15 bg-white shadow-sm dark:bg-zinc-700"
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

            {session?.customAssistant ? (
              <CustomAssistantAvatar
                url={session?.customAssistant?.iconURL}
                alt={session?.customAssistant?.name}
                size="lg"
              />
            ) : (
              getAssistantIcon(preferences.defaultAssistant, "lg", true)
            )}
            <Flex direction="col" gap="xs" justify="center" items="center">
              <Type
                size="lg"
                textColor={session?.customAssistant ? "primary" : "secondary"}
              >
                {session?.customAssistant
                  ? session?.customAssistant?.name
                  : "How can I help you?"}
              </Type>
              {session?.customAssistant && (
                <Type
                  size="sm"
                  textColor="secondary"
                  className="max-w-[400px] text-center"
                >
                  {session?.customAssistant?.description}
                </Type>
              )}
              {session?.customAssistant && (
                <Button
                  variant="bordered"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    removeAssistantFromSessionMutation.mutate(session?.id, {
                      onSuccess: () => {
                        refetch();
                      },
                    });
                  }}
                >
                  Remove
                </Button>
              )}
            </Flex>
            <ApiKeyStatus />
          </Flex>
        )}
        {renderChatBottom()}
      </div>
    </div>
  );
};
