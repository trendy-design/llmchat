import { useChatContext } from "@/context/chat/context";
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
  Microphone,
  Paperclip,
  Quotes,
  StopCircle,
  X,
} from "@phosphor-icons/react";
import { Stop } from "@phosphor-icons/react/dist/ssr";

import { EditorContent } from "@tiptap/react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import Resizer from "react-image-file-resizer";
import { ModelSelect } from "./model-select";
import { AudioWaveSpinner } from "./ui/audio-wave";
import { Badge } from "./ui/badge";

import { usePreferenceContext } from "@/context/preferences/provider";
import { useSettings } from "@/context/settings/context";
import { Footer } from "./footer";
import { PluginSelect } from "./plugin-select";
import { PromptsBotsCombo } from "./prompts-bots-combo";
import { QuickSettings } from "./quick-settings";
import { Button } from "./ui/button";
import { Tooltip } from "./ui/tooltip";
import { useToast } from "./ui/use-toast";

export type TAttachment = {
  file?: File;
  base64?: string;
};

export const ChatInput = () => {
  const { sessionId } = useParams();
  const { open: openFilters } = useFilters();
  const { showButton, scrollToBottom } = useScrollToBottom();
  const { toast } = useToast();
  const { startRecording, stopRecording, recording, text, transcribing } =
    useRecordVoice();
  const {
    currentSession,
    stopGeneration,
    editor,
    handleRunModel,
    openPromptsBotCombo,
    setOpenPromptsBotCombo,
    sendMessage,
  } = useChatContext();
  const [contextValue, setContextValue] = useState<string>("");
  const { apiKeys } = usePreferenceContext();
  const { open: openSettings } = useSettings();
  const { preferences } = usePreferenceContext();

  const { showPopup, selectedText, handleClearSelection } = useTextSelection();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [selectedModel, setSelectedModel] = useState<TModelKey>(
    preferences.defaultModel
  );

  const [attachment, setAttachment] = useState<TAttachment>();

  useEffect(() => {
    if (editor?.isActive) {
      editor.commands.focus("end");
    }
  }, [editor?.isActive]);

  const resizeFile = (file: File) =>
    new Promise((resolve) => {
      Resizer.imageFileResizer(
        file,
        1000,
        1000,
        "JPEG",
        100,
        0,
        (uri) => {
          console.log(typeof uri);
          resolve(uri);
        },
        "file"
      );
    });

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    const reader = new FileReader();

    const fileTypes = ["image/jpeg", "image/png", "image/gif"];
    if (file && !fileTypes.includes(file?.type)) {
      toast({
        title: "Invalid format",
        description: "Please select a valid image (JPEG, PNG, GIF).",
        variant: "destructive",
      });
      return;
    }

    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      const base64String = reader?.result?.split(",")[1];
      setAttachment((prev) => ({
        ...prev,
        base64: `data:${file?.type};base64,${base64String}`,
      }));
    };

    if (file) {
      setAttachment((prev) => ({
        ...prev,
        file,
      }));
      const resizedFile = await resizeFile(file);

      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = () => {
    document.getElementById("fileInput")?.click();
  };

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
      console.log("Voice run", sessionId.toString());
      handleRunModel({
        input: text,
        sessionId: sessionId.toString(),
      });

      editor?.commands.clearContent();
    }
  }, [text]);

  const startVoiceRecording = async () => {
    const openAIAPIKeys = apiKeys.openai;
    if (!openAIAPIKeys) {
      toast({
        title: "API key missing",
        description:
          "Recordings require OpenAI API key. Please check settings.",
        variant: "destructive",
      });
      openSettings("openai");
      return;
    }

    if (preferences?.whisperSpeechToTextEnabled) {
      startRecording();
    } else {
      toast({
        title: "Enable Speech to Text",
        description:
          "Recordings require Speech to Text enabled. Please check settings.",
        variant: "destructive",
      });
      openSettings("voice-input");
    }
  };

  const renderRecordingControls = () => {
    if (recording) {
      return (
        <>
          <Button
            variant="ghost"
            size="iconSm"
            onClick={() => {
              stopRecording();
            }}
          >
            <StopCircle size={20} weight="fill" className="text-red-300" />
          </Button>
        </>
      );
    }

    return (
      <Tooltip content="Record">
        <Button
          size="icon"
          variant="ghost"
          className="min-w-8 h-8"
          onClick={startVoiceRecording}
        >
          <Microphone size={20} weight="bold" />
        </Button>
      </Tooltip>
    );
  };

  const renderListeningIndicator = () => {
    if (transcribing) {
      return (
        <div className="bg-zinc-800 dark:bg-zinc-900 text-white rounded-full gap-2 px-4 py-1 h-10 flex flex-row items-center text-sm md:text-base">
          <AudioWaveSpinner /> <p>Transcribing ...</p>
        </div>
      );
    }
    if (recording) {
      return (
        <div className="bg-zinc-800 dark:bg-zinc-900 text-white rounded-full gap-2 px-2 pr-4 py-1 h-10 flex flex-row items-center text-sm md:text-base">
          <AudioWaveSpinner />
          <p>Listening ...</p>
        </div>
      );
    }
  };

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

  const renderStopButton = () => {
    return (
      <motion.span
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
      >
        <Button
          onClick={() => {
            stopGeneration();
          }}
          variant="secondary"
          size="sm"
        >
          <Stop size={20} weight="bold" /> Stop
        </Button>
      </motion.span>
    );
  };

  const renderAttachedImage = () => {
    if (attachment?.base64 && attachment?.file) {
      return (
        <div className="flex flex-row items-center bg-black/30 text-zinc-300 rounded-xl h-10 w-full md:w-[700px] justify-start gap-2 pl-3 pr-1">
          <ArrowElbowDownRight size={20} weight="bold" />
          <p className="w-full relative ml-2 text-sm md:text-base flex flex-row gap-2 items-center">
            <Image
              src={attachment.base64}
              alt="uploaded image"
              className="rounded-xl tanslate-y-[50%] min-w-[60px] h-[60px] border border-white/5 absolute rotate-6 shadow-md object-cover"
              width={0}
              height={0}
            />
            <span className="ml-[70px]">{attachment?.file?.name}</span>
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

  const renderFileUpload = () => {
    return (
      <>
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={handleImageUpload}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={handleFileSelect}
          className="px-1.5"
        >
          <Paperclip size={16} weight="bold" /> Attach
        </Button>
      </>
    );
  };

  const clearInput = () => {
    editor?.commands.clearContent();
  };

  const focusToInput = () => {
    editor?.commands.focus("end");
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
        {renderAttachedImage()}
        {editor && (
          <PromptsBotsCombo
            open={openPromptsBotCombo}
            onBack={() => {
              clearInput();
              focusToInput();
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
