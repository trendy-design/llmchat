import { useChatContext } from "@/context/chat/context";
import { useFilters } from "@/context/filters/context";
import { useSettings } from "@/context/settings/context";
import { useModelList } from "@/hooks/use-model-list";
import { usePreferences } from "@/hooks/use-preferences";
import { useRecordVoice } from "@/hooks/use-record-voice";
import useScrollToBottom from "@/hooks/use-scroll-to-bottom";
import { useTextSelection } from "@/hooks/usse-text-selection";
import { slideUpVariant } from "@/lib/framer-motion";
import { PromptType, RoleType } from "@/lib/prompts";
import { cn } from "@/lib/utils";
import {
  ArrowDown,
  ArrowElbowDownRight,
  ArrowUp,
  ClockClockwise,
  Command,
  Microphone,
  Paperclip,
  Plus,
  Quotes,
  StarFour,
  StopCircle,
  X,
} from "@phosphor-icons/react";
import { Stop } from "@phosphor-icons/react/dist/ssr";
import { motion } from "framer-motion";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ChatExamples } from "./chat-examples";
import { ChatGreeting } from "./chat-greeting";
import { ModelSelect } from "./model-select";
import { AudioWaveSpinner } from "./ui/audio-wave";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tooltip } from "./ui/tooltip";

export type TAttachment = {
  file?: File;
  base64?: string;
};

export const ChatInput = () => {
  const { sessionId } = useParams();
  const { open: openFilters } = useFilters();
  const { showButton, scrollToBottom } = useScrollToBottom();
  const router = useRouter();
  const { startRecording, stopRecording, recording, text, transcribing } =
    useRecordVoice();
  const {
    runModel,
    createSession,
    currentSession,
    streamingMessage,
    stopGeneration,
  } = useChatContext();
  const [inputValue, setInputValue] = useState("");
  const [contextValue, setContextValue] = useState<string>("");
  const { getPreferences, getApiKey } = usePreferences();
  const { getModelByKey } = useModelList();
  const { open: openSettings } = useSettings();
  const { showPopup, selectedText, handleClearSelection } = useTextSelection();
  const inputRef = useRef<HTMLInputElement>(null);

  const [attachment, setAttachment] = useState<TAttachment>();

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const reader = new FileReader();

    const fileTypes = ["image/jpeg", "image/png", "image/gif"];
    if (file && !fileTypes.includes(file?.type)) {
      toast("Please select a valid image (JPEG, PNG, GIF).");
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
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = () => {
    document.getElementById("fileInput")?.click();
  };

  const handleRunModel = (query?: string) => {
    if (!query && !inputValue) {
      return;
    }
    getPreferences().then(async (preference) => {
      const selectedModel = getModelByKey(preference.defaultModel);

      console.log(selectedModel?.baseModel);
      if (!selectedModel?.baseModel) {
        throw new Error("Model not found");
      }

      const apiKey = await getApiKey(selectedModel?.baseModel);
      console.log(apiKey);

      if (!apiKey) {
        toast.error("API key is missing. Please check your settings.");
        openSettings(selectedModel?.baseModel);
        return;
      }
      console.log(inputValue);
      runModel(
        {
          role: RoleType.assistant,
          type: PromptType.ask,
          image: attachment?.base64,
          query: query || inputValue,
          context: contextValue,
        },
        sessionId.toString()
      );
      setAttachment(undefined);
      setContextValue("");
      setInputValue("");
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleRunModel();
    }
  };

  useEffect(() => {
    if (sessionId) {
      inputRef.current?.focus();
    }
  }, [sessionId]);

  const isNewSession =
    !currentSession?.messages?.length && !streamingMessage?.loading;

  useEffect(() => {
    if (text) {
      setInputValue(text);
      runModel(
        {
          role: RoleType.assistant,
          type: PromptType.ask,
          query: text,
        },
        sessionId.toString()
      );
      setInputValue("");
    }
  }, [text]);

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
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
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
          onClick={() => {
            startRecording();
            setTimeout(() => {
              stopRecording();
            }, 20000);
          }}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
        >
          <Microphone size={20} weight="bold" />
        </Button>
      </Tooltip>
    );
  };

  const renderNewSession = () => {
    if (isNewSession) {
      return (
        <div className="min-w-8 h-8 flex justify-center items-center dark:text-white text-zinc-500">
          <StarFour size={24} weight="fill" />
        </div>
      );
    }

    return (
      <Button
        size="icon"
        variant={"ghost"}
        className="min-w-8 h-8"
        onClick={() => {
          createSession().then((session) => {
            router.push(`/chat/${session.id}`);
          });
        }}
      >
        <Plus size={20} weight="bold" />
      </Button>
    );
  };

  const renderListeningIndicator = () => {
    if (transcribing) {
      return (
        <div className="bg-zinc-800 dark:bg-zinc-900 text-white rounded-full gap-2 px-4 py-1 h-10 flex flex-row items-center text-sm">
          <AudioWaveSpinner /> <p>Transcribing ...</p>
        </div>
      );
    }
    if (recording) {
      return (
        <div className="bg-zinc-800 dark:bg-zinc-900 text-white rounded-full gap-2 px-2 pr-4 py-1 h-10 flex flex-row items-center text-sm">
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
    if (streamingMessage?.loading) {
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
    }
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col items-center justify-center absolute bottom-0 px-4 pb-4 pt-16 bg-gradient-to-t transition-all ease-in-out duration-1000 from-white dark:from-zinc-800 to-transparent from-70% left-0 right-0 gap-2",
        isNewSession && "top-0"
      )}
    >
      {isNewSession && <ChatGreeting />}
      <div className="flex flex-row items-center gap-2">
        {renderScrollToBottom()}
        {renderReplyButton()}
        {renderListeningIndicator()}
      </div>

      <div className="flex flex-col gap-1">
        {contextValue && (
          <div className="flex flex-row items-center bg-black/30 text-zinc-300 rounded-xl h-10 w-[700px] justify-start gap-2 pl-3 pr-1">
            <ArrowElbowDownRight size={16} weight="fill" />
            <p className="w-full overflow-hidden truncate ml-2 text-sm ">
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
        )}
        {attachment?.base64 && attachment?.file && (
          <div className="flex flex-row items-center bg-black/30 text-zinc-300 rounded-xl h-10 w-[700px] justify-start gap-2 pl-3 pr-1">
            <ArrowElbowDownRight size={20} weight="bold" />
            <p className="w-full relative ml-2 text-xs flex flex-row gap-2 items-center">
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
        )}
        <motion.div
          variants={slideUpVariant}
          initial={"initial"}
          animate={"animate"}
          className="flex flex-col gap-0 bg-white shadow-sm border-black/10 dark:bg-white/5 w-[700px] border dark:border-white/5 rounded-[1.25em] overflow-hidden"
        >
          <div className="flex flex-row items-center px-3 h-14  w-full gap-0">
            {renderNewSession()}
            <Input
              placeholder="Ask AI anything ..."
              value={inputValue}
              type="text"
              ref={inputRef}
              autoComplete="off"
              autoCapitalize="off"
              variant="ghost"
              onChange={(e) => {
                setInputValue(e.currentTarget.value);
              }}
              onKeyDown={handleKeyDown}
              className="px-2"
            />
            {renderRecordingControls()}

            <Button
              size="icon"
              variant={!!inputValue ? "secondary" : "ghost"}
              disabled={!inputValue}
              className="min-w-8 h-8 ml-1"
              onClick={() => handleRunModel()}
            >
              <ArrowUp size={20} weight="bold" />
            </Button>
          </div>
          <div className="flex flex-row items-center w-full justify-start gap-2 px-2 pb-2 pt-1">
            <ModelSelect />
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
            <div className="flex-1"></div>

            <Button
              variant="ghost"
              size="sm"
              onClick={openFilters}
              className="px-1.5"
            >
              <ClockClockwise size={16} weight="bold" /> History
              <Badge>
                <Command size={12} weight="bold" /> K
              </Badge>
            </Button>
          </div>
        </motion.div>
      </div>
      {isNewSession && (
        <ChatExamples
          onExampleClick={(prompt) => {
            handleRunModel(prompt);
          }}
        />
      )}
    </div>
  );
};
