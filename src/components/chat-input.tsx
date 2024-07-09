import { ArrowElbowDownRight, Stop, X } from "@phosphor-icons/react";
import { EditorContent } from "@tiptap/react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  useAssistantContext,
  useChatContext,
  usePreferenceContext,
  useSessionsContext,
} from "@/context";
import {
  defaultPreferences,
  useImageAttachment,
  useModelList,
  useRecordVoice,
  useScrollToBottom,
} from "@/hooks";
import { TAssistant } from "@/hooks/use-chat-session";
import { slideUpVariant } from "@/lib/framer-motion";
import { cn } from "@/lib/utils";
import { ArrowDown02Icon, Navigation03Icon } from "@hugeicons/react";
import { ChatExamples } from "./chat-examples";
import { ChatGreeting } from "./chat-greeting";
import { PluginSelect } from "./plugin-select";
import { PromptsBotsCombo } from "./prompts-bots-combo";
import { QuickSettings } from "./quick-settings";
import { Button } from "./ui/button";

export type TAttachment = {
  file?: File;
  base64?: string;
};

export const ChatInput = () => {
  const { sessionId } = useParams();
  const { showButton, scrollToBottom } = useScrollToBottom();
  const {
    renderListeningIndicator,
    renderRecordingControls,
    recording,
    text,
    transcribing,
  } = useRecordVoice();
  const { currentSession } = useSessionsContext();
  const { renderFileUpload, renderAttachedImage, attachment } =
    useImageAttachment();
  const { selectedAssistant, open: openAssistants } = useAssistantContext();
  const {
    editor,
    handleRunModel,
    openPromptsBotCombo,
    setOpenPromptsBotCombo,
    sendMessage,
    isGenerating,
    contextValue,
    setContextValue,
    stopGeneration,
  } = useChatContext();

  const { preferences, updatePreferences } = usePreferenceContext();
  const { models, getAssistantByKey, getAssistantIcon } = useModelList();

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
    if (editor?.isActive) {
      editor.commands.focus("end");
    }
  }, [editor?.isActive]);

  useEffect(() => {
    if (sessionId) {
      inputRef.current?.focus();
    }
  }, [sessionId]);

  const isFreshSession = !currentSession?.messages?.length;

  useEffect(() => {
    if (text) {
      editor?.commands.clearContent();
      editor?.commands.setContent(text);
      const props = getAssistantByKey(preferences.defaultAssistant);
      if (!props) {
        return;
      }
      handleRunModel({
        input: text,
        image: attachment?.base64,
        sessionId: sessionId.toString(),
        assistant: props.assistant,
      });

      editor?.commands.clearContent();
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

  //   if (showPopup && !recording && !transcribing) {
  //     return (
  //       <motion.span
  //         initial={{ scale: 0, opacity: 0 }}
  //         animate={{ scale: 1, opacity: 1 }}
  //         exit={{ scale: 0, opacity: 0 }}
  //       >
  //         <Button
  //           onClick={() => {
  //             setContextValue(selectedText);
  //             handleClearSelection();
  //             inputRef.current?.focus();
  //           }}
  //           variant="secondary"
  //           size="sm"
  //         >
  //           <Quotes size={20} weight="bold" /> Reply
  //         </Button>
  //       </motion.span>
  //     );
  //   }
  // };

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
          <PromptsBotsCombo
            open={openPromptsBotCombo}
            onBack={() => {
              editor?.commands.clearContent();
              editor?.commands.focus("end");
            }}
            onPromptSelect={(prompt) => {
              editor?.commands.setContent(prompt.content);
              editor?.commands.insertContent("");
              editor?.commands.focus("end");
              setOpenPromptsBotCombo(false);
            }}
            onOpenChange={setOpenPromptsBotCombo}
          >
            <motion.div
              variants={slideUpVariant}
              initial={"initial"}
              animate={editor.isEditable ? "animate" : "initial"}
              className="flex flex-col items-start gap-0 focus-within:ring-2 ring-zinc-100 dark:ring-zinc-700 ring-offset-2 dark:ring-offset-zinc-800 bg-zinc-50 dark:bg-white/5 w-full dark:border-white/5 rounded-2xl overflow-hidden"
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
                      console.log("keydown", e.key);
                      if (e.key === "Enter" && !e.shiftKey) {
                        sendMessage();
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
                    getAssistantIcon(selectedAssistant?.assistant.key)}

                  {selectedAssistant?.assistant.name}
                </Button>

                <PluginSelect selectedAssistantKey={selectedAssistantKey} />
                {renderFileUpload()}
                <QuickSettings />
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
                      sendMessage(attachment?.base64);
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
          </PromptsBotsCombo>
        )}
      </div>
      {isFreshSession && <ChatExamples />}
    </div>
  );
};
