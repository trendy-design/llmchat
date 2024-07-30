import { Button } from "@/components/ui/button";
import { ArrowDown02Icon, Navigation03Icon } from "@/components/ui/icons";
import { defaultPreferences } from "@/config";
import {
  useAssistants,
  useChatContext,
  usePreferenceContext,
  usePromptsContext,
} from "@/context";
import { slideUpVariant } from "@/helper/animations";
import { cn } from "@/helper/clsx";
import {
  useAssistantUtils,
  useImageAttachment,
  useRecordVoice,
  useScrollToBottom,
} from "@/hooks";
import { useChatEditor } from "@/hooks/use-editor";
import { useLLMRunner } from "@/hooks/use-llm-runner";
import { TAssistant } from "@/types";
import { AiIdeaIcon } from "@hugeicons/react";
import { ArrowElbowDownRight, Stop, X } from "@phosphor-icons/react";
import { EditorContent } from "@tiptap/react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChatExamples } from "./chat-examples";
import { ChatGreeting } from "./chat-greeting";
import { PluginSelect } from "./plugin-select";
import { Flex } from "./ui";

export type TAttachment = {
  file?: File;
  base64?: string;
};

export const ChatInput = () => {
  const { store } = useChatContext();
  const session = store((state) => state.session);
  const messages = store((state) => state.messages);
  const contextValue = store((state) => state.context);
  const setContextValue = store((state) => state.setContext);
  const stopGeneration = store((state) => state.stopGeneration);
  const isGenerating = store((state) => state.isGenerating);
  const { showButton, scrollToBottom } = useScrollToBottom();
  const {
    renderListeningIndicator,
    renderRecordingControls,
    recording,
    text,
    transcribing,
  } = useRecordVoice();
  const {
    renderImageUpload,
    renderAttachedImage,
    attachment,
    clearAttachment,
    renderDropZone,
    getRootProps,
  } = useImageAttachment({ id: "image-upload" });
  const { selectedAssistant, open: openAssistants } = useAssistants();
  const { open: openPrompts } = usePromptsContext();
  const { invokeModel } = useLLMRunner();

  const { editor } = useChatEditor();

  const { preferences, updatePreferences } = usePreferenceContext();
  const { models, getAssistantByKey, getAssistantIcon } = useAssistantUtils();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [selectedAssistantKey, setSelectedAssistantKey] = useState<
    TAssistant["key"]
  >(preferences.defaultAssistant);

  useEffect(() => {
    const assistantProps = getAssistantByKey(preferences.defaultAssistant);
    if (assistantProps?.model) {
      setSelectedAssistantKey(preferences.defaultAssistant);
    } else {
      updatePreferences({
        defaultAssistant: defaultPreferences.defaultAssistant,
      });
    }
  }, [models, preferences]);

  useEffect(() => {
    if (session?.id) {
      inputRef.current?.focus();
    }
  }, [session?.id]);

  const isFreshSession = !messages?.length;

  const sendMessage = (input: string) => {
    const props = getAssistantByKey(preferences.defaultAssistant);
    if (!props || !session) {
      return;
    }
    invokeModel({
      input,
      image: attachment?.base64,
      sessionId: session.id,
      assistant: props.assistant,
    });
    clearAttachment();
    editor?.commands.clearContent();
  };

  useEffect(() => {
    if (text && session) {
      editor?.commands.clearContent();
      editor?.commands.setContent(text);
      sendMessage(text);
    }
  }, [text]);

  const renderScrollToBottom = () => {
    if (showButton && !recording && !transcribing) {
      return (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <Button
            onClick={scrollToBottom}
            size="iconSm"
            variant="outlined"
            rounded="full"
          >
            <ArrowDown02Icon size={16} strokeWidth="2" />
          </Button>
        </motion.span>
      );
    }
  };

  const renderStopGeneration = () => {
    if (isGenerating) {
      return (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <Button
            rounded="full"
            variant="secondary"
            size="sm"
            onClick={() => {
              stopGeneration();
            }}
          >
            <Stop size={16} weight="fill" />
            Stop generation
          </Button>
        </motion.span>
      );
    }
  };

  const renderSelectedContext = () => {
    if (contextValue) {
      return (
        <div className="flex w-full flex-row items-start justify-start gap-2 rounded-xl border border-zinc-100 bg-white py-2 pl-2 pr-2 text-zinc-700 ring-1 ring-zinc-100 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 md:w-[700px] lg:w-[720px]">
          <ArrowElbowDownRight size={16} weight="bold" className="mt-1" />
          <p className="ml-2 line-clamp-2 w-full overflow-hidden text-sm md:text-base">
            {contextValue}
          </p>
          <Button
            size={"iconXS"}
            variant="ghost"
            onClick={() => {
              setContextValue("");
            }}
            className="ml-4 flex-shrink-0"
          >
            <X size={14} weight="bold" />
          </Button>
        </div>
      );
    }
  };

  return (
    <div
      className={cn(
        "absolute bottom-0 right-0 flex w-full flex-col items-center justify-end gap-2 px-4 pb-4 pt-16 md:justify-center md:px-4",
        "left-0 bg-gradient-to-t from-white from-70% to-transparent transition-all duration-1000 ease-in-out dark:from-zinc-800",
        isFreshSession && "top-0",
      )}
    >
      {isFreshSession && <ChatGreeting />}
      <div className="mb-2 flex flex-row items-center justify-center gap-2">
        {renderScrollToBottom()}
        {renderStopGeneration()}
      </div>

      <div className="flex w-full flex-col gap-1 md:w-[700px] lg:w-[720px]">
        {renderSelectedContext()}

        {editor && (
          <motion.div
            variants={slideUpVariant}
            initial={"initial"}
            animate={editor.isEditable ? "animate" : "initial"}
            className="flex w-full overflow-hidden rounded-lg border bg-zinc-50 dark:border-white/5 dark:bg-white/5"
          >
            <div
              className="relative flex w-full flex-col items-start gap-0"
              {...getRootProps()}
            >
              <div className="flex w-full flex-col items-start justify-start">
                {attachment && (
                  <div className="pl-2 pr-2 pt-2 md:pl-3">
                    {renderAttachedImage()}
                  </div>
                )}

                <div className="flex w-full flex-row items-end gap-0 py-2 pl-2 pr-2 md:pl-3">
                  <Flex className="flex-1">
                    {recording || transcribing ? (
                      renderListeningIndicator()
                    ) : (
                      <EditorContent
                        editor={editor}
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            sendMessage(editor.getText());
                          }
                        }}
                        className="no-scrollbar [&>*]:no-scrollbar wysiwyg max-h-[120px] min-h-8 w-full cursor-text overflow-y-auto p-1 text-sm outline-none focus:outline-none md:text-base [&>*]:leading-6 [&>*]:outline-none"
                      />
                    )}
                  </Flex>
                  {!isGenerating && renderRecordingControls()}
                </div>
              </div>
              <Flex
                className="w-full px-1 pb-1 pt-1 md:px-2 md:pb-2"
                items="center"
                justify="between"
              >
                <Flex gap="xs" items="center">
                  <Button
                    variant="ghost"
                    onClick={openAssistants}
                    className={cn("gap-2 pl-1.5 pr-3 text-xs md:text-sm")}
                    size="sm"
                  >
                    {selectedAssistant?.assistant.key &&
                      getAssistantIcon(selectedAssistant?.assistant.key, "sm")}

                    {selectedAssistant?.assistant.name}
                  </Button>

                  <PluginSelect selectedAssistantKey={selectedAssistantKey} />
                  {renderImageUpload({ showIcon: true })}
                </Flex>

                <Flex gap="xs" items="center">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      openPrompts();
                    }}
                    className="gap-2 pl-1.5 pr-3 text-xs md:text-sm"
                    size="sm"
                  >
                    <AiIdeaIcon size={18} variant="stroke" strokeWidth="2" />
                    <span className="hidden md:flex">Prompts</span>
                  </Button>
                  {!isGenerating && (
                    <Button
                      size="icon"
                      variant={!!editor?.getText() ? "default" : "secondary"}
                      disabled={!editor?.getText()}
                      className={cn(
                        !!editor?.getText() &&
                          "bg-zinc-800 text-white dark:bg-emerald-500/20 dark:text-emerald-400 dark:outline-emerald-400",
                      )}
                      onClick={() => {
                        sendMessage(editor.getText());
                      }}
                    >
                      <Navigation03Icon
                        size={18}
                        variant="stroke"
                        strokeWidth="2"
                      />
                    </Button>
                  )}
                </Flex>
              </Flex>
              {renderDropZone()}
            </div>
          </motion.div>
        )}
      </div>
      {isFreshSession && <ChatExamples />}
    </div>
  );
};
