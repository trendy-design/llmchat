import { Button } from "@/components/ui/button";
import { ArrowDown02Icon, Navigation03Icon } from "@/components/ui/icons";
import { defaultPreferences } from "@/config";
import { useAssistants, useChatContext, usePreferenceContext } from "@/context";
import { slideUpVariant } from "@/helper/animations";
import { cn } from "@/helper/clsx";
import {
  useAssistantUtils,
  useAttachment,
  useImageAttachment,
  useRecordVoice,
  useScrollToBottom,
} from "@/hooks";
import { useChatEditor } from "@/hooks/use-editor";
import { useLLMRunner } from "@/hooks/use-llm-runner";
import { TAssistant } from "@/types";
import { ArrowElbowDownRight, Stop, X } from "@phosphor-icons/react";
import { EditorContent } from "@tiptap/react";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { ChatExamples } from "./chat-examples";
import { ChatGreeting } from "./chat-greeting";
import { PluginSelect } from "./plugin-select";

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
  } = useImageAttachment();
  const { renderAttachedPdf, renderPdfFileUpload } = useAttachment();
  const { selectedAssistant, open: openAssistants } = useAssistants();
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
            className="dark:bg-zinc-800 dark:border dark:text-white dark:border-white/10"
            variant="outline"
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
            size="sm"
            className="dark:bg-zinc-800 dark:border dark:text-white dark:border-white/10"
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
        <div className="flex flex-row items-start py-2 ring-1 ring-zinc-100 dark:ring-zinc-700 bg-white border-zinc-100 dark:bg-zinc-800 border dark:border-white/10 text-zinc-700 dark:text-zinc-200 rounded-xl w-full md:w-[700px] lg:w-[720px]  justify-start gap-2 pl-2 pr-2">
          <ArrowElbowDownRight size={16} weight="bold" className="mt-1" />
          <p className="w-full overflow-hidden ml-2 text-sm md:text-base line-clamp-2">
            {contextValue}
          </p>
          <Button
            size={"iconXS"}
            variant="ghost"
            onClick={() => {
              setContextValue("");
            }}
            className="flex-shrink-0 ml-4"
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
        "w-full flex flex-col items-center justify-end md:justify-center absolute bottom-0 px-2 md:px-4 pb-4 pt-16  right-0 gap-2",
        "bg-gradient-to-t transition-all ease-in-out duration-1000 from-white dark:from-zinc-800 to-transparent from-70% left-0",
        isFreshSession && "top-0"
      )}
    >
      {isFreshSession && <ChatGreeting />}
      <div className="flex flex-row items-center justify-center gap-2 mb-2">
        {renderScrollToBottom()}
        {renderStopGeneration()}
        {renderListeningIndicator()}
      </div>
      <div className="flex flex-col gap-3 w-full md:w-[700px] lg:w-[720px]">
        {renderSelectedContext()}
        {editor && (
          <motion.div
            variants={slideUpVariant}
            initial={"initial"}
            animate={editor.isEditable ? "animate" : "initial"}
            className="flex flex-col items-start gap-0  border bg-zinc-50 dark:bg-white/5 w-full dark:border-white/5 rounded-2xl overflow-hidden"
          >
            <div className="flex flex-col items-start justify-start w-full">
              {attachment && (
                <div className="pl-2 md:pl-3 pr-2 pt-2">
                  {renderAttachedImage()}
                </div>
              )}

              <div className="flex flex-row pl-2 md:pl-3 pr-2 py-2 w-full gap-0 items-end">
                <EditorContent
                  editor={editor}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      sendMessage(editor.getText());
                    }
                  }}
                  className="w-full min-h-8 text-sm md:text-base max-h-[120px] overflow-y-auto outline-none focus:outline-none p-1 [&>*]:outline-none no-scrollbar [&>*]:no-scrollbar [&>*]:leading-6 wysiwyg cursor-text"
                />
                {!isGenerating && renderRecordingControls()}
              </div>
            </div>
            <div className="flex flex-row items-center w-full justify-start gap-0 pt-1 pb-2 px-2">
              <Button
                variant={"ghost"}
                onClick={openAssistants}
                className={cn("pl-1 pr-3 gap-2 text-xs md:text-sm")}
                size="sm"
              >
                {selectedAssistant?.assistant.key &&
                  getAssistantIcon(selectedAssistant?.assistant.key, "sm")}

                {selectedAssistant?.assistant.name}
              </Button>

              <PluginSelect selectedAssistantKey={selectedAssistantKey} />
              {renderImageUpload()}

              <div className="flex-1"></div>

              {!isGenerating && (
                <Button
                  size="iconSm"
                  rounded="full"
                  variant={!!editor?.getText() ? "default" : "secondary"}
                  disabled={!editor?.getText()}
                  className={cn(
                    !!editor?.getText() &&
                      "bg-zinc-800 dark:bg-emerald-500/20 text-white dark:text-emerald-400 dark:outline-emerald-400"
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
            </div>
          </motion.div>
        )}
      </div>
      {isFreshSession && <ChatExamples />}
    </div>
  );
};
