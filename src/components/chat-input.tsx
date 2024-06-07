import { useFilters } from "@/context/filters/context";
import { TModelKey } from "@/hooks/use-model-list";
import { useRecordVoice } from "@/hooks/use-record-voice";
import useScrollToBottom from "@/hooks/use-scroll-to-bottom";
import { useTextSelection } from "@/hooks/usse-text-selection";
import { slideUpVariant } from "@/lib/framer-motion";
import { cn } from "@/lib/utils";

import {
  ArrowDown,
  ArrowElbowDownRight,
  ArrowUp,
  ClockClockwise,
  Command,
  Quotes,
  X,
} from "@phosphor-icons/react";

import { EditorContent } from "@tiptap/react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ModelSelect } from "./model-select";
import { Badge } from "./ui/badge";

import { useChatContext } from "@/context/chat/provider";
import { usePreferenceContext } from "@/context/preferences/provider";
import { useSessionsContext } from "@/context/sessions/provider";
import { Footer } from "./footer";
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
  const { open: openFilters } = useFilters();
  const { showButton, scrollToBottom } = useScrollToBottom();
  const {
    renderListeningIndicator,
    renderRecordingControls,
    recording,
    text,
    transcribing,
  } = useRecordVoice();
  const { currentSession } = useSessionsContext();
  const {
    editor,
    handleRunModel,
    openPromptsBotCombo,
    setOpenPromptsBotCombo,
    sendMessage,
  } = useChatContext();
  const [contextValue, setContextValue] = useState<string>("");

  const { preferences } = usePreferenceContext();

  const { showPopup, selectedText, handleClearSelection } = useTextSelection();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [selectedModel, setSelectedModel] = useState<TModelKey>(
    preferences.defaultModel
  );

  useEffect(() => {
    if (editor?.isActive) {
      editor.commands.focus("end");
    }
  }, [editor?.isActive]);

  useEffect(() => {
    if (currentSession?.bot?.deafultBaseModel) {
      setSelectedModel(currentSession.bot.deafultBaseModel);
    }
  }, [currentSession]);

  useEffect(() => {
    if (sessionId) {
      inputRef.current?.focus();
    }
  }, [sessionId]);

  const isFreshSession =
    !currentSession?.messages?.length && !currentSession?.bot;

  useEffect(() => {
    if (text) {
      editor?.commands.clearContent();
      editor?.commands.setContent(text);
      handleRunModel({
        input: text,
        sessionId: sessionId.toString(),
      });

      editor?.commands.clearContent();
    }
  }, [text]);

  const renderScrollToBottom = () => {
    if (showButton && !showPopup && !recording && !transcribing) {
      return (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <Button onClick={scrollToBottom} variant="secondary" size="iconSm">
            <ArrowDown size={20} weight="bold" />
          </Button>
        </motion.span>
      );
    }
  };

  const renderReplyButton = () => {
    if (showPopup && !recording && !transcribing) {
      return (
        <motion.span
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
        >
          <Button
            onClick={() => {
              setContextValue(selectedText);
              handleClearSelection();
              inputRef.current?.focus();
            }}
            variant="secondary"
            size="sm"
          >
            <Quotes size={20} weight="bold" /> Reply
          </Button>
        </motion.span>
      );
    }
  };

  const renderSelectedContext = () => {
    if (contextValue) {
      return (
        <div className="flex flex-row items-center bg-black/30 text-zinc-300 rounded-xl h-10 w-[700px] justify-start gap-2 pl-3 pr-1">
          <ArrowElbowDownRight size={16} weight="fill" />
          <p className="w-full overflow-hidden truncate ml-2 text-sm md:text-base ">
            {contextValue}
          </p>
          <Button
            size={"iconSm"}
            variant="ghost"
            onClick={() => {
              setContextValue("");
            }}
            className="flex-shrink-0 ml-4"
          >
            <X size={16} weight="bold" />
          </Button>
        </div>
      );
    }
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-end md:justify-center absolute bottom-8 md:bottom-0 px-2 md:px-4 pb-4 pt-16 bg-gradient-to-t transition-all ease-in-out duration-1000 from-white dark:from-zinc-800 to-transparent from-70% left-0 right-0 gap-1",
        isFreshSession && "top-0"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        {renderScrollToBottom()}
        {renderReplyButton()}
        {renderListeningIndicator()}
      </div>

      <div className="flex flex-col gap-1 w-full md:w-[700px]">
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
            onBotSelect={(bot) => {
              editor?.commands?.clearContent();
              editor?.commands.focus("end");
            }}
          >
            <motion.div
              variants={slideUpVariant}
              initial={"initial"}
              animate={editor.isEditable ? "animate" : "initial"}
              className="flex flex-col items-start gap-0 bg-zinc-50 dark:bg-white/5 w-full dark:border-white/5 rounded-2xl overflow-hidden"
            >
              <div className="flex flex-row items-end pl-2 md:pl-3 pr-2 py-2 w-full gap-0">
                <EditorContent
                  editor={editor}
                  autoFocus
                  onKeyDown={(e) => {
                    console.log("keydown", e.key);
                    if (e.key === "Enter" && !e.shiftKey) {
                      sendMessage();
                    }
                    if (e.key === "Enter") {
                      e.preventDefault();
                    }
                  }}
                  className="w-full min-h-8 text-sm md:text-base max-h-[120px] overflow-y-auto outline-none focus:outline-none p-1 [&>*]:outline-none no-scrollbar [&>*]:no-scrollbar [&>*]:leading-6 wysiwyg cursor-text"
                />

                {renderRecordingControls()}

                <Button
                  size="icon"
                  variant={!!editor?.getText() ? "secondary" : "ghost"}
                  disabled={!editor?.getText()}
                  className="min-w-8 h-8 ml-1"
                  onClick={() => {
                    sendMessage();
                  }}
                >
                  <ArrowUp size={20} weight="bold" />
                </Button>
              </div>
              <div className="flex flex-row items-center w-full justify-start gap-0 pt-1 pb-2 px-2">
                <ModelSelect
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                />
                <PluginSelect selectedModel={selectedModel} />
                <QuickSettings />
                <div className="flex-1"></div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={openFilters}
                  className="px-1.5"
                >
                  <ClockClockwise size={16} weight="bold" /> History
                  <Badge className="hidden md:flex">
                    <Command size={16} weight="bold" /> K
                  </Badge>
                </Button>
              </div>
            </motion.div>
          </PromptsBotsCombo>
        )}

        <Footer show={isFreshSession} />
      </div>
    </div>
  );
};
